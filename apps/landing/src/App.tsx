import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import Verify from '@/pages/Verify';
import Run from '@/pages/Run';
import Metrics from '@/pages/Metrics';
import Leaderboard from '@/pages/Leaderboard';
import Logs from '@/pages/Logs';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/run" element={<Run />} />
        <Route path="/metrics" element={<Metrics />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/logs" element={<Logs />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
