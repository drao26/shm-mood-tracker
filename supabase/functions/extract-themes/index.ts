import { GoogleGenerativeAI } from 'npm:@google/generative-ai@^0.21.0';
import { createClient } from 'npm:@supabase/supabase-js@^2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { name } = await req.json(); // 'april' | 'angie' | 'deepthi'
    if (!['april', 'angie', 'deepthi'].includes(name)) {
      return jsonResponse({ error: 'invalid name' }, 400);
    }

    // 1. Read entries from Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Fetch the most recent 90 entries (~3 months of daily logs for one user).
    // 'all-time' refers to the cache period label, not the full history window;
    // keeping this bounded avoids sending very large payloads to Gemini.
    const { data: entries } = await supabase
      .from('moods')
      .select('date, score, gratitude, rant')
      .eq('name', name)
      .order('date', { ascending: false })
      .limit(90);

    if (!entries || entries.length === 0) {
      return jsonResponse({ themes: [] });
    }

    // 2. Call Gemini 1.5 Flash
    const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY')!);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `You are analyzing a personal mood journal. Extract 5-8 recurring THEMES (not individual words) from these entries. Group synonyms (e.g. "tired"/"exhausted"/"sleepy" → "sleep").

For each theme, return:
- key: short lowercase label (e.g. "work", "family conflict")
- emoji: one relevant emoji
- count: how many entries mention this theme
- avgMood: average mood score (0-10) across entries mentioning this theme, rounded to 1 decimal
- exampleQuote: shortest representative quote (max 80 chars) verbatim from an entry

Return ONLY a JSON array, no prose. Schema:
[{"key": string, "emoji": string, "count": number, "avgMood": number, "exampleQuote": string}]

Sort by count descending. Skip themes with count < 2.

Entries:
${JSON.stringify(entries)}`;

    const result = await model.generateContent(prompt);
    const themes = JSON.parse(result.response.text());

    // 3. Cache in Supabase
    await supabase.from('theme_summaries').upsert(
      { name, period: 'all-time', themes, generated_at: new Date().toISOString() },
      { onConflict: 'name,period' },
    );

    return jsonResponse({ themes });
  } catch (e) {
    return jsonResponse({ error: e instanceof Error ? e.message : 'unknown' }, 500);
  }
});
