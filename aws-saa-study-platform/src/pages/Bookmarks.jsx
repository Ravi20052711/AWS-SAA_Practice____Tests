import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkX, ChevronRight } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import QuestionCard from '../components/QuestionCard';

export default function Bookmarks() {
  const { questions, bookmarks, toggleBookmark } = useQuiz();
  const navigate = useNavigate();
  const [currentIdx, setCurrentIdx] = useState(0);

  const bookmarkedQuestions = questions.filter(q => bookmarks.includes(q.id));

  if (!bookmarks.length) return (
    <div className="container py-12 animate-fadein">
      <div className="empty-state">
        <div className="icon"><Bookmark size={48} /></div>
        <h3>No bookmarks yet</h3>
        <p>Bookmark tricky questions while practicing to review them here.</p>
        <button className="btn btn-primary mt-4" onClick={() => navigate('/practice')}>
          📖 Start Practicing
        </button>
      </div>
    </div>
  );

  if (!bookmarkedQuestions.length) return (
    <div className="container py-12">
      <div className="empty-state">
        <p style={{ color: 'var(--text-muted)' }}>Questions loading...</p>
      </div>
    </div>
  );

  const currentQ = bookmarkedQuestions[currentIdx];

  return (
    <div className="container py-8 animate-fadein" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="flex items-center justify-between mb-6" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>🔖 Bookmarks</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {bookmarkedQuestions.length} bookmarked question{bookmarkedQuestions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          className="btn btn-secondary btn-sm"
          style={{ color: 'var(--accent-red)' }}
          onClick={() => {
            if (confirm('Remove all bookmarks?')) {
              bookmarks.forEach(id => toggleBookmark(id));
              navigate('/');
            }
          }}
        >
          <BookmarkX size={15} /> Clear All
        </button>
      </div>

      {/* Mini List */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {bookmarkedQuestions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setCurrentIdx(idx)}
            style={{
              width: 30, height: 30, borderRadius: 6, fontSize: '0.72rem',
              fontWeight: 700, fontFamily: 'var(--font-mono)',
              background: currentIdx === idx ? 'var(--aws-orange)' : 'var(--bg-glass)',
              color: currentIdx === idx ? '#0f172a' : 'var(--text-muted)',
              border: '1px solid var(--border)',
              cursor: 'pointer', transition: 'var(--transition)'
            }}
          >
            {idx + 1}
          </button>
        ))}
      </div>

      {currentQ && (
        <QuestionCard
          key={currentQ.id}
          question={currentQ}
          questionNumber={currentIdx + 1}
          totalQuestions={bookmarkedQuestions.length}
          onNext={() => setCurrentIdx(i => Math.min(i + 1, bookmarkedQuestions.length - 1))}
          onPrev={() => setCurrentIdx(i => Math.max(i - 1, 0))}
          showNav={true}
          examMode={false}
        />
      )}
    </div>
  );
}
