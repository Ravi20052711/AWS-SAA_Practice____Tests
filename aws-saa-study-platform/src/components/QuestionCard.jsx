import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, Bookmark, BookmarkCheck, ChevronRight, Lightbulb } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onNext,
  onPrev,
  showNav = true,
  examMode = false,
  examAnswer = null,
  onExamAnswer,
}) {
  const { answeredQuestions, answerQuestion, toggleBookmark, isBookmarked } = useQuiz();
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const savedAnswer = answeredQuestions[question.id];
  const bookmarked = isBookmarked(question.id);

  useEffect(() => {
    // Reset on question change
    setSelected(null);
    setRevealed(false);
    setShowExplanation(false);
    // Restore saved answer in practice mode
    if (!examMode && savedAnswer) {
      setSelected(savedAnswer.selectedIndex);
      setRevealed(true);
    }
  }, [question.id, examMode]);

  // Exam mode sync
  useEffect(() => {
    if (examMode && examAnswer !== null) {
      setSelected(examAnswer);
    }
  }, [examMode, examAnswer]);

  const handleSelect = useCallback((idx) => {
    if (examMode) {
      setSelected(idx);
      onExamAnswer?.(question.id, idx);
      return;
    }
    if (revealed) return;
    const correct = question.options[idx] === question.correctAnswer;
    setSelected(idx);
    setRevealed(true);
    answerQuestion(question.id, idx, correct);
  }, [revealed, examMode, question, answerQuestion, onExamAnswer]);

  const correctIndex = examMode ? null : question.options?.indexOf(question.correctAnswer);

  const getOptionClass = (idx) => {
    if (!revealed || examMode) {
      return selected === idx ? 'selected' : '';
    }
    if (idx === correctIndex) return 'correct';
    if (idx === selected && selected !== correctIndex) return 'wrong';
    return '';
  };

  return (
    <div className="question-card animate-fadein">
      {/* Header */}
      <div className="question-header">
        <div>
          <div className="question-number">
            Question {questionNumber} of {totalQuestions}
          </div>
          {!examMode && savedAnswer && (
            <div className="flex items-center gap-2 mt-2">
              {savedAnswer.isCorrect
                ? <span className="badge badge-green"><CheckCircle2 size={11} /> Correct</span>
                : <span className="badge badge-red"><XCircle size={11} /> Incorrect</span>}
            </div>
          )}
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => toggleBookmark(question.id)}
          title={bookmarked ? 'Remove bookmark' : 'Bookmark this question'}
          aria-label="Bookmark"
          style={{ color: bookmarked ? 'var(--aws-orange)' : 'var(--text-muted)' }}
        >
          {bookmarked ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
        </button>
      </div>

      {/* Question Text */}
      <p className="question-text">{question.question}</p>

      {/* Options */}
      <div className="options-grid">
        {(question.options || []).map((option, idx) => (
          <button
            key={idx}
            className={`option-btn ${getOptionClass(idx)}`}
            onClick={() => handleSelect(idx)}
            disabled={!examMode && revealed}
            aria-label={`Option ${OPTION_LABELS[idx]}`}
          >
            <span className="option-label">{OPTION_LABELS[idx]}</span>
            <span style={{ flex: 1 }}>{option}</span>
            {!examMode && revealed && idx === correctIndex && (
              <CheckCircle2 size={18} style={{ color: 'var(--accent-green)', flexShrink: 0 }} />
            )}
            {!examMode && revealed && idx === selected && selected !== correctIndex && (
              <XCircle size={18} style={{ color: 'var(--accent-red)', flexShrink: 0 }} />
            )}
          </button>
        ))}
      </div>

      {/* Explanation (practice mode only) */}
      {!examMode && revealed && question.explanation && (
        <div style={{ marginBottom: '1rem' }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowExplanation(v => !v)}
            style={{ color: 'var(--aws-orange)', paddingLeft: 0 }}
          >
            <Lightbulb size={15} />
            {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
          </button>
          {showExplanation && (
            <div className="explanation">
              <strong>📚 Explanation</strong>
              {question.explanation}
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      {showNav && (
        <div className="flex justify-between items-center" style={{ marginTop: '0.5rem', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={onPrev} disabled={questionNumber === 1} style={{ opacity: questionNumber === 1 ? 0.4 : 1 }}>
            ← Prev
          </button>

          {!examMode && !revealed && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => {
                answerQuestion(question.id, -1, false);
                setRevealed(true);
                setShowExplanation(true);
              }}
              style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}
            >
              Skip
            </button>
          )}

          <button
            className="btn btn-primary"
            onClick={onNext}
            disabled={questionNumber === totalQuestions}
            style={{ opacity: questionNumber === totalQuestions ? 0.4 : 1 }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
