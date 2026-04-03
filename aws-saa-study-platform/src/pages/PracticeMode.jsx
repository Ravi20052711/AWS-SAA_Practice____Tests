import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Shuffle, Filter, X, SkipForward } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import QuestionCard from '../components/QuestionCard';
import ProgressBar from '../components/ProgressBar';

const TOPICS = [
  'S3', 'EC2', 'RDS', 'Lambda', 'VPC', 'IAM',
  'CloudFront', 'DynamoDB', 'ECS', 'Route 53',
  'CloudWatch', 'SQS', 'SNS', 'EKS', 'Aurora', 'Kinesis',
  'Direct Connect', 'Snowball', 'Fargate', 'WAF',
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PracticeMode() {
  const { questions, answeredQuestions, loading } = useQuiz();
  const [searchParams, setSearchParams] = useSearchParams();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(searchParams.get('topic') || '');
  const [shuffled, setShuffled] = useState(false);
  const [showUnanswered, setShowUnanswered] = useState(false);
  const [questionList, setQuestionList] = useState([]);

  // Filter + shuffle logic
  useEffect(() => {
    let filtered = questions;
    if (selectedTopic) {
      filtered = filtered.filter(q =>
        q.question.toLowerCase().includes(selectedTopic.toLowerCase())
      );
    }
    if (showUnanswered) {
      filtered = filtered.filter(q => !answeredQuestions[q.id]);
    }
    setQuestionList(shuffled ? shuffleArray(filtered) : filtered);
    setCurrentIdx(0);
  }, [questions, selectedTopic, shuffled, showUnanswered]);

  // Sync topic from URL
  useEffect(() => {
    const t = searchParams.get('topic') || '';
    setSelectedTopic(t);
  }, []);

  const currentQuestion = questionList[currentIdx];
  const answered = Object.keys(answeredQuestions).length;

  const handleTopic = useCallback((topic) => {
    const next = selectedTopic === topic ? '' : topic;
    setSelectedTopic(next);
    setSearchParams(next ? { topic: next } : {});
  }, [selectedTopic]);

  const answeredInList = useMemo(() => {
    return questionList.filter(q => answeredQuestions[q.id]);
  }, [questionList, answeredQuestions]);

  const correctInList = useMemo(() => {
    return answeredInList.filter(q => answeredQuestions[q.id].isCorrect).length;
  }, [answeredInList, answeredQuestions]);

  const accuracy = answeredInList.length > 0 
    ? Math.round((correctInList / answeredInList.length) * 100) 
    : 0;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <p style={{ color: 'var(--text-secondary)' }}>⏳ Loading questions…</p>
    </div>
  );

  if (!questionList.length) return (
    <div className="container py-8">
      <div className="empty-state">
        <div className="icon">🔍</div>
        <h3>No questions found</h3>
        <p>Try a different filter or topic</p>
        <button className="btn btn-secondary mt-4" onClick={() => { setSelectedTopic(''); setShowUnanswered(false); }}>
          <X size={15} /> Clear Filters
        </button>
      </div>
    </div>
  );

  return (
    <div className="container py-8 animate-fadein" style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
          📖 Practice Mode
        </h1>
        <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${showUnanswered ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShowUnanswered(v => !v)}
          >
            <SkipForward size={14} /> Unanswered Only
          </button>
          <button
            className={`btn btn-sm ${shuffled ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setShuffled(v => !v)}
          >
            <Shuffle size={14} /> {shuffled ? 'Shuffled' : 'Shuffle'}
          </button>
        </div>
      </div>

      {/* Progress & Accuracy */}
      <div className="grid grid-2 gap-4 mb-5">
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Progress
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {currentIdx + 1} of {questionList.length}
            </span>
          </div>
          <ProgressBar value={currentIdx + 1} max={questionList.length} showPercent={false} />
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Accuracy
            </span>
            <span style={{ fontSize: '0.8rem', color: accuracy >= 72 ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 700 }}>
              {accuracy}%
            </span>
          </div>
          <ProgressBar 
            value={correctInList} 
            max={Math.max(answeredInList.length, 1)} 
            color={accuracy >= 72 ? 'var(--accent-green)' : 'var(--accent-red)'}
            showPercent={false}
          />
        </div>
      </div>

      {/* Topic Filters */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flexShrink: 0 }}>
          <Filter size={14} style={{ display: 'inline', marginRight: '0.3rem' }} />Filter:
        </span>
        {TOPICS.map(topic => (
          <button
            key={topic}
            className={`topic-chip ${selectedTopic === topic ? 'active' : ''}`}
            onClick={() => handleTopic(topic)}
          >
            {topic}
          </button>
        ))}
        {selectedTopic && (
          <button className="topic-chip" onClick={() => handleTopic(selectedTopic)} style={{ color: 'var(--accent-red)', borderColor: 'rgba(248,113,113,0.3)' }}>
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Question */}
      {currentQuestion && (
        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          questionNumber={currentIdx + 1}
          totalQuestions={questionList.length}
          onNext={() => setCurrentIdx(i => Math.min(i + 1, questionList.length - 1))}
          onPrev={() => setCurrentIdx(i => Math.max(i - 1, 0))}
          showNav={true}
          examMode={false}
        />
      )}

      {/* Jump to Question */}
      <div className="card" style={{ padding: '1rem', marginTop: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Jump to question
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {questionList.slice(0, 50).map((q, idx) => {
            const ans = answeredQuestions[q.id];
            let bg = 'var(--bg-glass)';
            let color = 'var(--text-muted)';
            if (ans) {
              bg = ans.isCorrect ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)';
              color = ans.isCorrect ? 'var(--accent-green)' : 'var(--accent-red)';
            }
            if (idx === currentIdx) {
              bg = 'var(--aws-orange)';
              color = '#0f172a';
            }
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(idx)}
                style={{
                  width: 30, height: 30, borderRadius: 6, fontSize: '0.72rem',
                  fontWeight: 700, background: bg, color, border: '1px solid var(--border)',
                  cursor: 'pointer', transition: 'var(--transition)', fontFamily: 'var(--font-mono)'
                }}
              >
                {idx + 1}
              </button>
            );
          })}
          {questionList.length > 50 && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
              +{questionList.length - 50} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
