import { Link } from 'react-router-dom';

export default function NameSwitcher() {
  return (
    <Link
      to="/"
      className="text-sm text-gray-500 hover:text-gray-700 underline"
      onClick={() => localStorage.removeItem('shm-user')}
    >
      switch user
    </Link>
  );
}
