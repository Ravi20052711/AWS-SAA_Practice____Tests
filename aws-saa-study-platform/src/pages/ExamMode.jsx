import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, CheckCircle2, XCircle, RotateCcw, ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import ProgressBar from '../components/ProgressBar';

const EXAM_QUESTIONS = 65;
const EXAM_MINUTES = 130;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ExamMode() {
  const { questions, loading } = useQuiz();
  const navigate = useNavigate();

  const [phase, setPhase] = useState('start'); // start | active | results
  const [examQuestions, setExamQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});    // { q.id: answerIndex }
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(EXAM_MINUTES * 60);
  const timerRef = useRef(null);

  const startExam = useCallback(() => {
    const selected = shuffleArray(questions).slice(0, Math.min(EXAM_QUESTIONS, questions.length));
    setExamQuestions(selected);
    setAnswers({});
    setFlagged(new Set());
    setCurrentIdx(0);
    setTimeLeft(EXAM_MINUTES * 60);
    setPhase('active');
  }, [questions]);

  useEffect(() => {
    if (phase === 'active') {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            setPhase('results');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const handleAnswer = useCallback((qid, idx) => {
    setAnswers(prev => ({ ...prev, [qid]: idx }));
  }, []);

  const toggleFlag = useCallback((qid) => {
    setFlagged(prev => {
      const n = new Set(prev);
      n.has(qid) ? n.delete(qid) : n.add(qid);
      return n;
    });
  }, []);

  const submitExam = useCallback(() => {
    if (Object.keys(answers).length < examQuestions.length) {
      const unanswered = examQuestions.length - Object.keys(answers).length;
      if (!confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    }
    clearInterval(timerRef.current);
    setPhase('results');
  }, [answers, examQuestions]);

  const results = useMemo(() => {
    if (phase !== 'results') return null;
    let correct = 0;
    examQuestions.forEach(q => {
      const ansIdx = answers[q.id];
      if (ansIdx !== undefined && q.options[ansIdx] === q.correctAnswer) correct++;
    });
    const total = examQuestions.length;
    const pct = Math.round((correct / total) * 100);
    const passed = pct >= 72; // AWS passing score ~72%
    return { correct, wrong: total - correct, total, pct, passed };
  }, [phase, examQuestions, answers]);

  const timerClass = timeLeft < 300 ? 'danger' : timeLeft < 600 ? 'warning' : '';
  const currentQ = examQuestions[currentIdx];
  const selectedAnswer = currentQ ? answers[currentQ.id] : undefined;
  const correctIndexOnResults = (phase === 'results' && currentQ)
    ? currentQ.options?.indexOf(currentQ.correctAnswer)
    : null;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <p style={{ color: 'var(--text-secondary)' }}>⏳ Loading exam questions…</p>
    </div>
  );

  /* ── START SCREEN ── */
  if (phase === 'start') return (
    <div className="container py-12 animate-fadein" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎓</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>Exam Simulation</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.7 }}>
          Simulate the real AWS SAA-C03 exam experience.
        </p>
        <div className="grid grid-2 gap-3 mb-6" style={{ textAlign: 'left' }}>
          {[
            { icon: '📋', label: 'Questions', value: `${Math.min(EXAM_QUESTIONS, questions.length)} random` },
            { icon: '⏱️', label: 'Time Limit', value: `${EXAM_MINUTES} minutes` },
            { icon: '🎯', label: 'Passing Score', value: '72% (≥47/65)' },
            { icon: '👁️', label: 'Results', value: 'Shown at the end' },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ padding: '0.85rem 1rem', background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{icon}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{ background: 'var(--aws-orange-dim)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'left' }}>
          <AlertTriangle size={14} style={{ display: 'inline', marginRight: '0.4rem', color: 'var(--aws-orange)' }} />
          Questions will be randomly selected and shuffled. Answers will only be visible after submission.
        </div>
        <button className="btn btn-primary btn-lg w-full" onClick={startExam} disabled={questions.length === 0}>
          <Clock size={18} /> Start Exam Now
        </button>
      </div>
    </div>
  );

  /* ── RESULTS SCREEN ── */
  if (phase === 'results') return (
    <div className="container py-8 animate-fadein" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>
          {results.passed ? '🏆' : '📚'}
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          {results.passed ? 'Congratulations! You Passed!' : 'Keep Practicing!'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          {results.passed
            ? `You scored ${results.pct}% — above the 72% passing threshold.`
            : `You scored ${results.pct}% — 72% is needed to pass.`}
        </p>

        {/* Score circle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div className="score-circle" style={{ '--pct': results.pct }}>
            <div className="score-circle-inner">
              <div style={{ fontSize: '2rem', fontWeight: 900, color: results.passed ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {results.pct}%
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score</div>
            </div>
          </div>
        </div>

        <div className="grid grid-3 gap-3 mb-4" style={{ maxWidth: 400, margin: '0 auto 1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-green)' }}>{results.correct}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Correct</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-red)' }}>{results.wrong}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wrong</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{results.total}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total</div>
          </div>
        </div>

        <div className="flex gap-3 justify-center" style={{ flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={startExam}><RotateCcw size={15} /> Retake Exam</button>
          <button className="btn btn-primary" onClick={() => navigate('/practice')}>📖 Study More</button>
        </div>
      </div>

      {/* Answer Review */}
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>📋 Answer Review</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {examQuestions.map((q, idx) => {
          const userIdx = answers[q.id];
          const correctIdx = q.options?.indexOf(q.correctAnswer);
          const isCorrect = userIdx !== undefined && q.options[userIdx] === q.correctAnswer;
          const LABELS = ['A', 'B', 'C', 'D'];

          return (
            <div key={q.id} className="card" style={{ padding: '1.25rem' }}>
              <div className="flex items-center gap-2 mb-0.5">
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Q{idx + 1}</span>
                {isCorrect
                  ? <span className="badge badge-green"><CheckCircle2 size={10} /> Correct</span>
                  : <span className="badge badge-red"><XCircle size={10} /> {userIdx === undefined ? 'Skipped' : 'Wrong'}</span>}
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                {q.question}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {(q.options || []).map((opt, oi) => {
                  let bg = 'transparent', color = 'var(--text-muted)';
                  if (oi === correctIdx) { bg = 'rgba(52,211,153,0.1)'; color = 'var(--accent-green)'; }
                  if (oi === userIdx && !isCorrect) { bg = 'rgba(248,113,113,0.1)'; color = 'var(--accent-red)'; }
                  return (
                    <div key={oi} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', padding: '0.4rem 0.75rem', borderRadius: 6, background: bg, fontSize: '0.85rem', color }}>
                      <span style={{ fontWeight: 700, flexShrink: 0 }}>{LABELS[oi]}.</span>
                      <span>{opt}</span>
                    </div>
                  );
                })}
              </div>
              {q.explanation && (
                <div className="explanation" style={{ marginTop: '0.75rem' }}>
                  <strong>💡 Explanation</strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  /* ── ACTIVE EXAM ── */
  return (
    <div className="container py-4 animate-fadein" style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Exam Header */}
      <div className="card" style={{ padding: '0.85rem 1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <span style={{ fontWeight: 700 }}>SAA-C03 Exam</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.75rem' }}>
            {Object.keys(answers).length}/{examQuestions.length} answered
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`timer-display ${timerClass}`}>
            <Clock size={15} style={{ display: 'inline', marginRight: '0.35rem' }} />
            {formatTime(timeLeft)}
          </span>
          <button className="btn btn-primary btn-sm" onClick={submitExam}>Submit Exam</button>
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: '1rem' }}>
        <ProgressBar value={currentIdx + 1} max={examQuestions.length} showPercent={false} />
      </div>

      {/* Question */}
      {currentQ && (
        <div className="question-card animate-fadein">
          <div className="question-header">
            <div>
              <div className="question-number">Question {currentIdx + 1} of {examQuestions.length}</div>
              {flagged.has(currentQ.id) && <span className="badge badge-orange mt-2" style={{ marginTop: '0.5rem' }}>🚩 Flagged for review</span>}
            </div>
            <button
              className="btn btn-ghost"
              onClick={() => toggleFlag(currentQ.id)}
              title="Flag for review"
              style={{ color: flagged.has(currentQ.id) ? 'var(--aws-orange)' : 'var(--text-muted)' }}
            >
              <Flag size={18} />
            </button>
          </div>

          <p className="question-text">{currentQ.question}</p>

          <div className="options-grid">
            {(currentQ.options || []).map((option, idx) => (
              <button
                key={idx}
                className={`option-btn ${selectedAnswer === idx ? 'selected' : ''}`}
                onClick={() => handleAnswer(currentQ.id, idx)}
              >
                <span className="option-label">{['A', 'B', 'C', 'D'][idx]}</span>
                <span style={{ flex: 1 }}>{option}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center" style={{ marginTop: '1rem', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={() => setCurrentIdx(i => Math.max(0, i - 1))} disabled={currentIdx === 0} style={{ opacity: currentIdx === 0 ? 0.4 : 1 }}>
              <ChevronLeft size={16} /> Prev
            </button>
            <button className="btn btn-primary" onClick={() => setCurrentIdx(i => Math.min(i + 1, examQuestions.length - 1))} disabled={currentIdx === examQuestions.length - 1} style={{ opacity: currentIdx === examQuestions.length - 1 ? 0.4 : 1 }}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Question Navigator */}
      <div className="card" style={{ padding: '1rem', marginTop: '1rem' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Navigator &nbsp;·&nbsp;
          <span style={{ color: 'var(--accent-green)' }}>■</span> Answered &nbsp;
          <span style={{ color: 'var(--aws-orange)' }}>■</span> Flagged &nbsp;
          <span style={{ color: 'var(--text-muted)' }}>■</span> Current
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {examQuestions.map((q, idx) => {
            const isAnswered = answers[q.id] !== undefined;
            const isFlagged = flagged.has(q.id);
            const isCurrent = idx === currentIdx;
            let bg = 'var(--bg-glass)', color = 'var(--text-muted)', border = '1px solid var(--border)';
            if (isCurrent) { bg = 'var(--aws-orange)'; color = '#0f172a'; border = 'none'; }
            else if (isFlagged) { bg = 'var(--aws-orange-dim)'; color = 'var(--aws-orange)'; border = '1px solid var(--border-accent)'; }
            else if (isAnswered) { bg = 'rgba(52,211,153,0.15)'; color = 'var(--accent-green)'; border = '1px solid rgba(52,211,153,0.3)'; }
            return (
              <button key={q.id} onClick={() => setCurrentIdx(idx)}
                style={{ width: 30, height: 30, borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, background: bg, color, border, cursor: 'pointer', transition: 'var(--transition)', fontFamily: 'var(--font-mono)' }}>
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
