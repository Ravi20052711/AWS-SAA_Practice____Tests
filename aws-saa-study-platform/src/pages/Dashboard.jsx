import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Clock, BarChart2, Bookmark, Target,
  TrendingUp, Zap, Award, ChevronRight, RotateCcw
} from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import ProgressBar from '../components/ProgressBar';

export default function Dashboard() {
  const { questions, answeredQuestions, bookmarks, streak, getTotalAnswered, getAccuracy, getTopicStats, resetQuiz, loading, error } = useQuiz();
  const navigate = useNavigate();

  const totalAnswered = getTotalAnswered();
  const accuracy = getAccuracy();
  const topicStats = useMemo(() => getTopicStats(), [getTopicStats]);

  const correct = useMemo(() =>
    Object.values(answeredQuestions).filter(a => a.isCorrect).length,
    [answeredQuestions]
  );
  const wrong = totalAnswered - correct;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTopColor: 'var(--aws-orange)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading 650+ questions…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (error) return (
    <div className="container py-12">
      <div className="card" style={{ padding: '2rem', textAlign: 'center', borderColor: 'rgba(248,113,113,0.3)' }}>
        <p style={{ color: 'var(--accent-red)', fontSize: '1.1rem', marginBottom: '1rem' }}>⚠️ Failed to load questions</p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Run <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-glass)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>npm run generate</code> first to fetch questions from GitHub.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Error: {error}</p>
      </div>
    </div>
  );

  return (
    <div className="container py-8 animate-fadein">
      {/* Hero */}
      <div className="hero-section">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="badge badge-orange"><Zap size={11} /> SAA-C03</span>
          <span className="badge badge-muted">{questions.length} Questions</span>
        </div>
        <h1 className="hero-title">AWS Solutions Architect<br />Study Platform</h1>
        <p className="hero-subtitle">
          Master the SAA-C03 exam with {questions.length}+ practice questions, detailed explanations, and real exam simulation.
        </p>
        <div className="flex gap-3 justify-center" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/practice')}>
            <BookOpen size={18} /> Start Practice
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/exam')}>
            <Clock size={18} /> Take Exam
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-4 gap-4 mb-8">
        {[
          {
            label: 'Questions Answered', value: `${totalAnswered}`, sub: `of ${questions.length}`,
            icon: '📝', grad: 'linear-gradient(135deg, var(--aws-orange), #FFB347)'
          },
          {
            label: 'Accuracy', value: `${accuracy}%`, sub: `${correct} correct`,
            icon: '🎯', grad: 'linear-gradient(135deg, var(--accent-green), #6ee7b7)'
          },
          {
            label: 'Bookmarked', value: `${bookmarks.length}`, sub: 'for review',
            icon: '🔖', grad: 'linear-gradient(135deg, var(--accent-blue), #7dd3fc)'
          },
          {
            label: 'Study Streak', value: `${streak.current}`, sub: `days (best: ${streak.longest})`,
            icon: '🔥', grad: 'linear-gradient(135deg, #fb923c, #f97316)'
          },
        ].map(({ label, value, sub, icon, grad }) => (
          <div key={label} className="stat-card">
            <div className="stat-icon">{icon}</div>
            <div className="stat-value" style={{ '--stat-grad': grad }}>{value}</div>
            <div className="stat-label">{label}</div>
            {sub && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* Overall Progress */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div className="flex items-center justify-between mb-4" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            <TrendingUp size={18} style={{ display: 'inline', marginRight: '0.5rem', color: 'var(--aws-orange)' }} />
            Overall Progress
          </h2>
          <div className="flex gap-3">
            <span className="badge badge-green">✓ {correct} Correct</span>
            <span className="badge badge-red">✗ {wrong} Wrong</span>
          </div>
        </div>
        <ProgressBar value={totalAnswered} max={questions.length} label="Completion" />
        <div style={{ marginTop: '1rem' }}>
          <ProgressBar
            value={correct}
            max={Math.max(totalAnswered, 1)}
            label="Accuracy"
            color="var(--accent-green)"
          />
        </div>
      </div>

      {/* Mode Cards */}
      <div className="grid grid-2 gap-4 mb-8">
        <div
          className="card"
          style={{ padding: '1.75rem', cursor: 'pointer', borderColor: 'rgba(255,153,0,0.2)' }}
          onClick={() => navigate('/practice')}
        >
          <div className="flex items-center gap-3 mb-3">
            <div style={{
              width: 44, height: 44, borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--aws-orange), #e67e00)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)'
            }}>
              <BookOpen size={22} color="#0f172a" />
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>Practice Mode</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Instant feedback & explanations</div>
            </div>
            <ChevronRight size={18} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Study at your own pace. Filter by topic, see explanations immediately after answering, and bookmark tricky questions.
          </p>
        </div>

        <div
          className="card"
          style={{ padding: '1.75rem', cursor: 'pointer', borderColor: 'rgba(56,189,248,0.2)' }}
          onClick={() => navigate('/exam')}
        >
          <div className="flex items-center gap-3 mb-3">
            <div style={{
              width: 44, height: 44, borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent-blue), #0ea5e9)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Clock size={22} color="#0f172a" />
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>Exam Mode</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>65 questions · 130 minutes</div>
            </div>
            <ChevronRight size={18} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Simulate the real exam with a 130-minute timer. Results and detailed review shown at the end.
          </p>
        </div>
      </div>

      {/* Topics */}
      {topicStats.length > 0 && (
        <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            <BarChart2 size={18} style={{ display: 'inline', marginRight: '0.5rem', color: 'var(--aws-orange)' }} />
            Topics Coverage
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {topicStats.slice(0, 16).map(([topic, count]) => (
              <button
                key={topic}
                className="topic-chip"
                onClick={() => navigate(`/practice?topic=${encodeURIComponent(topic)}`)}
              >
                {topic}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.7 }}>{count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action: Reset */}
      {totalAnswered > 0 && (
        <div style={{ textAlign: 'center', padding: '1rem 0 3rem' }}>
          <button
            className="btn btn-secondary"
            onClick={() => { if (confirm('Reset all progress? This cannot be undone.')) resetQuiz(); }}
          >
            <RotateCcw size={15} /> Reset All Progress
          </button>
        </div>
      )}
    </div>
  );
}
