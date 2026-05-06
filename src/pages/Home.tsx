import { useNavigate } from 'react-router-dom';
import Window from '../components/Window';

const names = ['april', 'angie', 'deepthi'] as const;

export default function Home() {
  const navigate = useNavigate();

  function pick(name: string) {
    localStorage.setItem('shm-user', name);
    navigate('/today');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Window title="pick your name" colorIndex={0}>
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-gray-500">who's checking in today?</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {names.map((name) => (
              <button
                key={name}
                onClick={() => pick(name)}
                className="px-6 py-3 border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] bg-[#c0c0c0] hover:bg-[#d0d0d0] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white font-pixel text-xs"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </Window>
    </div>
  );
}
