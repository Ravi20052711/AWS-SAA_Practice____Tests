import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, LayoutDashboard, BookOpen, Clock, Bookmark, BarChart2 } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';

export default function Navbar() {
  const { theme, toggleTheme, streak, getTotalAnswered, getAccuracy, questions } = useQuiz();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/practice', label: 'Practice', icon: BookOpen },
    { to: '/exam', label: 'Exam Mode', icon: Clock },
    { to: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <button className="navbar-brand btn-ghost" onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none' }}>
            <span className="logo-icon">☁️</span>
            <span>AWS SAA-C03</span>
          </button>

          <ul className="navbar-nav">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink to={to} end={to === '/'} className={({ isActive }) => isActive ? 'active' : ''}>
                  <Icon size={15} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="navbar-actions">
            {streak.current > 0 && (
              <div className="badge badge-orange" title="Study streak">
                <span className="streak-flame">🔥</span>
                {streak.current}d
              </div>
            )}
            {questions.length > 0 && (
              <div className="badge badge-muted" style={{ fontFamily: 'var(--font-mono)' }}>
                {getTotalAnswered()}/{questions.length}
              </div>
            )}
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme" aria-label="Toggle dark/light mode">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav">
        {navLinks.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'}>
            {({ isActive }) => (
              <button className={`mobile-nav-item ${isActive ? 'active' : ''}`}>
                <Icon size={22} />
                {label}
              </button>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
