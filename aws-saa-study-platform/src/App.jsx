import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { QuizProvider } from './context/QuizContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import PracticeMode from './pages/PracticeMode';
import ExamMode from './pages/ExamMode';
import Bookmarks from './pages/Bookmarks';

export default function App() {
  return (
    <QuizProvider>
      <Router>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/practice" element={<PracticeMode />} />
            <Route path="/exam" element={<ExamMode />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
          </Routes>
        </main>
      </Router>
    </QuizProvider>
  );
}
