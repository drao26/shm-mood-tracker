import Button95 from '../components/Button95';
import Window from '../components/Window';

const names = ['april', 'angie', 'deepthi'] as const;

interface HomeProps {
  onPick: (name: string) => void;
}

export default function Home({ onPick }: HomeProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--desktop-bg)]">
      <Window title="pick your name" tone="butter">
        <div className="flex flex-col items-center gap-3">
          <p className="text-[11px] text-[var(--text)]">who's checking in today?</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {names.map((name) => (
              <Button95 key={name} onClick={() => onPick(name)}>
                {name}
              </Button95>
            ))}
          </div>
        </div>
      </Window>
    </div>
  );
}
