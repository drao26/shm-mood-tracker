import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import NameSwitcher from './components/NameSwitcher';
import Home from './pages/Home';
import Today from './pages/Today';
import MyHeatmaps from './pages/MyHeatmaps';
import MoodMap from './pages/MoodMap';

function Nav() {
  const name = localStorage.getItem('shm-user');
  if (!name) return null;

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm px-2 py-1 ${isActive ? 'text-gray-800 font-medium' : 'text-gray-500 hover:text-gray-700'}`;

  return (
    <nav className="flex items-center justify-center gap-4 py-3 border-b border-gray-200 bg-white/80 backdrop-blur sticky top-0 z-40">
      <NavLink to="/today" className={linkClass}>today</NavLink>
      <NavLink to="/my-heatmaps" className={linkClass}>my heatmaps</NavLink>
      <NavLink to="/mood-map" className={linkClass}>mood map</NavLink>
      <span className="text-gray-300">|</span>
      <NameSwitcher />
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/shm-mood-tracker">
      <Nav />
      <main className="pb-12">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/today" element={<Today />} />
          <Route path="/my-heatmaps" element={<MyHeatmaps />} />
          <Route path="/mood-map" element={<MoodMap />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="text-center text-xs text-gray-400 py-4">
        this is a private space for three friends
      </footer>
    </BrowserRouter>
  );
}
