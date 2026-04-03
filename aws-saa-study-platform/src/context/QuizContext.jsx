import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const QuizContext = createContext(null);

const STORAGE_KEY = 'aws-saa-quiz-data';

const defaultState = {
  questions: [],
  answeredQuestions: {},  // { questionId: { selectedIndex, isCorrect, timestamp } }
  bookmarks: [],          // array of question ids
  streak: { current: 0, lastDate: null, longest: 0 },
  sessionStats: { correct: 0, wrong: 0, skipped: 0 },
  theme: 'dark',
};

export function QuizProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultState, ...parsed, questions: [] };
      }
    } catch {}
    return defaultState;
  });

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Persist state (except questions which come from file)
  useEffect(() => {
    const { questions: _q, ...toSave } = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {}
  }, [state]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  // Load questions from generated JSON
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('./data/questions.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setQuestions(data);
      } catch (e) {
        setError(e.message);
        console.error('Failed to load questions:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Update study streak on mount
  useEffect(() => {
    const today = new Date().toDateString();
    setState(prev => {
      const { lastDate, current, longest } = prev.streak;
      if (lastDate === today) return prev;  // already updated today
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newCurrent = lastDate === yesterday ? current + 1 : 1;
      return {
        ...prev,
        streak: {
          current: newCurrent,
          longest: Math.max(longest, newCurrent),
          lastDate: today,
        }
      };
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setState(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  }, []);

  const answerQuestion = useCallback((questionId, selectedIndex, isCorrect) => {
    setState(prev => ({
      ...prev,
      answeredQuestions: {
        ...prev.answeredQuestions,
        [questionId]: { selectedIndex, isCorrect, timestamp: Date.now() }
      },
      sessionStats: {
        ...prev.sessionStats,
        correct: prev.sessionStats.correct + (isCorrect ? 1 : 0),
        wrong: prev.sessionStats.wrong + (isCorrect ? 0 : 1),
      }
    }));
  }, []);

  const toggleBookmark = useCallback((questionId) => {
    setState(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.includes(questionId)
        ? prev.bookmarks.filter(id => id !== questionId)
        : [...prev.bookmarks, questionId]
    }));
  }, []);

  const isBookmarked = useCallback((questionId) => {
    return state.bookmarks.includes(questionId);
  }, [state.bookmarks]);

  const resetQuiz = useCallback(() => {
    setState(prev => ({
      ...prev,
      answeredQuestions: {},
      sessionStats: { correct: 0, wrong: 0, skipped: 0 },
    }));
  }, []);

  const getTopicStats = useCallback(() => {
    // Group by topic keywords found in the question text
    const topics = {
      'S3': 0, 'EC2': 0, 'RDS': 0, 'Lambda': 0,
      'VPC': 0, 'IAM': 0, 'CloudFront': 0, 'DynamoDB': 0,
      'ECS': 0, 'Route 53': 0, 'CloudWatch': 0, 'SQS': 0,
      'SNS': 0, 'EKS': 0, 'Aurora': 0, 'Kinesis': 0,
    };

    questions.forEach(q => {
      Object.keys(topics).forEach(topic => {
        if (q.question.toLowerCase().includes(topic.toLowerCase())) {
          topics[topic]++;
        }
      });
    });

    return Object.entries(topics)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [questions]);

  const getTotalAnswered = useCallback(() => {
    return Object.keys(state.answeredQuestions).length;
  }, [state.answeredQuestions]);

  const getAccuracy = useCallback(() => {
    const answered = Object.values(state.answeredQuestions);
    if (!answered.length) return 0;
    const correct = answered.filter(a => a.isCorrect).length;
    return Math.round((correct / answered.length) * 100);
  }, [state.answeredQuestions]);

  return (
    <QuizContext.Provider value={{
      questions,
      loading,
      error,
      theme: state.theme,
      toggleTheme,
      answeredQuestions: state.answeredQuestions,
      bookmarks: state.bookmarks,
      streak: state.streak,
      sessionStats: state.sessionStats,
      answerQuestion,
      toggleBookmark,
      isBookmarked,
      resetQuiz,
      getTopicStats,
      getTotalAnswered,
      getAccuracy,
    }}>
      {children}
    </QuizContext.Provider>
  );
}

export const useQuiz = () => {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used inside QuizProvider');
  return ctx;
};
