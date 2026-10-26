import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchFlags, fetchCapitals } from '../services/api';

// ─── Constants ─────────────────────────────────────────────────────────────────
const TIMER_SECONDS = 15;
const HINT_PENALTY_SECONDS = 2;
const LEADERBOARD_KEY = 'flag_game_leaderboard';
const CAPITALS_LEADERBOARD_KEY = 'capitals_game_leaderboard';

// ─── Context ───────────────────────────────────────────────────────────────────
const GameContext = createContext(null);

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}

// ─── Provider ──────────────────────────────────────────────────────────────────
export function GameProvider({ children }) {
  // API data
  const [countries, setCountries] = useState([]);       // [{ name, flag, capital }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Game state
  const [currentCountry, setCurrentCountry] = useState(null);
  const [score, setScore] = useState(0);
  const [gameMode, setGameMode] = useState('flags'); // 'flags' | 'capitals'
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState('');

  // Timer
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);
  const timeLeftRef = useRef(TIMER_SECONDS);

  // Flag mode hints — indices of revealed characters
  const [revealedLetters, setRevealedLetters] = useState([]);
  const [hintCount, setHintCount] = useState(0);

  // Capitals mode — multiple choice options
  const [capitalOptions, setCapitalOptions] = useState([]);
  const [eliminatedOptions, setEliminatedOptions] = useState([]);
  const capitalHintTimerRef = useRef(null);

  // Feedback overlay
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | 'timeout' | null

  // Leaderboards
  const [leaderboard, setLeaderboard] = useState([]);
  const [capitalsLeaderboard, setCapitalsLeaderboard] = useState([]);

  // Refs for stale-closure-safe access
  const gameModeRef = useRef(gameMode);
  const scoreRef = useRef(score);
  const playerNameRef = useRef(playerName);
  const leaderboardRef = useRef(leaderboard);
  const capitalsLeaderboardRef = useRef(capitalsLeaderboard);
  const countriesRef = useRef(countries);

  useEffect(() => { gameModeRef.current = gameMode; }, [gameMode]);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { playerNameRef.current = playerName; }, [playerName]);
  useEffect(() => { leaderboardRef.current = leaderboard; }, [leaderboard]);
  useEffect(() => { capitalsLeaderboardRef.current = capitalsLeaderboard; }, [capitalsLeaderboard]);
  useEffect(() => { countriesRef.current = countries; }, [countries]);

  // ── Data loading ──────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [flags, capitals] = await Promise.all([fetchFlags(), fetchCapitals()]);
        const enriched = flags
          .filter((c) => c.flag) // skip entries without a flag URL
          .map((c) => {
            const capEntry = capitals.find(
              (cap) => cap.name.toLowerCase() === c.name.toLowerCase()
            );
            return { ...c, capital: capEntry?.capital || null };
          });
        setCountries(enriched);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ── Leaderboard from AsyncStorage ─────────────────────────────────────────────
  useEffect(() => {
    async function loadBoards() {
      try {
        const raw = await AsyncStorage.getItem(LEADERBOARD_KEY);
        if (raw) setLeaderboard(JSON.parse(raw));
        const rawCap = await AsyncStorage.getItem(CAPITALS_LEADERBOARD_KEY);
        if (rawCap) setCapitalsLeaderboard(JSON.parse(rawCap));
      } catch (_) {}
    }
    loadBoards();
  }, []);

  async function saveToLeaderboard(name, finalScore, mode) {
    const isCapitals = mode === 'capitals';
    const key = isCapitals ? CAPITALS_LEADERBOARD_KEY : LEADERBOARD_KEY;
    const currentBoard = isCapitals
      ? capitalsLeaderboardRef.current
      : leaderboardRef.current;

    const existing = currentBoard.find((e) => e.name === name);
    let updated;
    if (existing) {
      updated = currentBoard.map((e) =>
        e.name === name ? { ...e, score: Math.max(e.score, finalScore) } : e
      );
    } else {
      updated = [...currentBoard, { name, score: finalScore }];
    }
    updated.sort((a, b) => b.score - a.score);

    if (isCapitals) {
      setCapitalsLeaderboard(updated);
    } else {
      setLeaderboard(updated);
    }

    try {
      await AsyncStorage.setItem(key, JSON.stringify(updated));
    } catch (_) {}
  }

  // ── Timer ─────────────────────────────────────────────────────────────────────
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerActive(false);
  }, []);

  // handleTimeUp is defined after pickRandomCountry via ref to avoid circular deps
  const handleTimeUpRef = useRef(null);

  const startTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(TIMER_SECONDS);
    timeLeftRef.current = TIMER_SECONDS;
    setTimerActive(true);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const next = prev - 1;
        timeLeftRef.current = next;
        if (next <= 0) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setTimerActive(false);
          if (handleTimeUpRef.current) handleTimeUpRef.current();
          return 0;
        }
        return next;
      });
    }, 1000);
  }, [stopTimer]);

  // ── Build capital options ─────────────────────────────────────────────────────
  function buildCapitalOptions(correct, source) {
    const wrongPool = source.filter(
      (c) => c.capital && c.name !== correct.name
    );
    const wrongs = wrongPool
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((c) => ({ capital: c.capital, isCorrect: false }));

    // Ensure we always have the correct answer
    const correctOption = { capital: correct.capital || '—', isCorrect: true };
    const all = [...wrongs, correctOption].sort(() => Math.random() - 0.5);
    return all;
  }

  // ── Capital hint timer (eliminates wrong options every 5s) ────────────────────
  function startCapitalHintTimer(options) {
    if (capitalHintTimerRef.current) clearInterval(capitalHintTimerRef.current);
    setEliminatedOptions([]);

    capitalHintTimerRef.current = setInterval(() => {
      setEliminatedOptions((prev) => {
        const wrongIndices = options
          .map((o, i) => (!o.isCorrect && !prev.includes(i) ? i : null))
          .filter((i) => i !== null);
        if (wrongIndices.length === 0) {
          clearInterval(capitalHintTimerRef.current);
          return prev;
        }
        const toElim = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
        return [...prev, toElim];
      });
    }, 5000);
  }

  // ── Pick random country ───────────────────────────────────────────────────────
  const pickRandomCountry = useCallback(
    (overrideList, overrideMode) => {
      const source = overrideList || countriesRef.current;
      const mode = overrideMode || gameModeRef.current;
      if (!source.length) return;

      stopTimer();
      if (capitalHintTimerRef.current) {
        clearInterval(capitalHintTimerRef.current);
        capitalHintTimerRef.current = null;
      }

      const rand = source[Math.floor(Math.random() * source.length)];
      setCurrentCountry(rand);
      setRevealedLetters([]);
      setHintCount(0);
      setEliminatedOptions([]);

      if (mode === 'capitals') {
        const options = buildCapitalOptions(rand, source);
        setCapitalOptions(options);
        startCapitalHintTimer(options); // pass options directly — no stale closure
      }

      startTimer();
    },
    [stopTimer, startTimer]
  );

  // handleTimeUp needs pickRandomCountry, wire via ref
  handleTimeUpRef.current = () => {
    setFeedback('timeout');
    setTimeout(() => {
      setFeedback(null);
      pickRandomCountry();
    }, 1500);
  };

  // ── Start game ────────────────────────────────────────────────────────────────
  function startGame(name, mode = 'flags') {
    setPlayerName(name);
    playerNameRef.current = name;
    setScore(0);
    scoreRef.current = 0;
    setGameMode(mode);
    gameModeRef.current = mode;
    setGameStarted(true);
    setFeedback(null);
    pickRandomCountry(countriesRef.current, mode);
  }

  // ── Guess (flag mode, free text) ─────────────────────────────────────────────
  function guess(input) {
    if (!currentCountry || feedback) return;
    const normalized = input.trim().toLowerCase();
    const correct = currentCountry.name.toLowerCase();

    if (normalized === correct) {
      const bonus = timeLeftRef.current;
      const newScore = scoreRef.current + 10 + bonus;
      scoreRef.current = newScore;
      setScore(newScore);
      setFeedback('correct');
      stopTimer();
      setTimeout(() => {
        setFeedback(null);
        pickRandomCountry();
      }, 1200);
    } else {
      const newScore = Math.max(0, scoreRef.current - 1);
      scoreRef.current = newScore;
      setScore(newScore);
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 800);
    }
  }

  // ── Guess capital (multiple choice) ─────────────────────────────────────────
  function guessCapital(option) {
    if (!currentCountry || feedback) return;
    if (option.isCorrect) {
      const bonus = timeLeftRef.current;
      const newScore = scoreRef.current + 10 + bonus;
      scoreRef.current = newScore;
      setScore(newScore);
      setFeedback('correct');
      stopTimer();
      if (capitalHintTimerRef.current) {
        clearInterval(capitalHintTimerRef.current);
        capitalHintTimerRef.current = null;
      }
      setTimeout(() => {
        setFeedback(null);
        pickRandomCountry();
      }, 1200);
    } else {
      const newScore = Math.max(0, scoreRef.current - 1);
      scoreRef.current = newScore;
      setScore(newScore);
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 800);
    }
  }

  // ── Hint (flag mode) — reveal a random letter, -2s ───────────────────────────
  function requestHint() {
    if (!currentCountry) return;
    const name = currentCountry.name;
    const hiddenIndices = Array.from({ length: name.length }, (_, i) => i).filter(
      (i) => name[i] !== ' ' && !revealedLetters.includes(i)
    );
    if (hiddenIndices.length === 0) return;

    const pick = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
    setRevealedLetters((prev) => [...prev, pick]);
    setHintCount((h) => h + 1);
    const newTime = Math.max(1, timeLeftRef.current - HINT_PENALTY_SECONDS);
    timeLeftRef.current = newTime;
    setTimeLeft(newTime);
  }

  // ── End game ──────────────────────────────────────────────────────────────────
  function endGame() {
    stopTimer();
    if (capitalHintTimerRef.current) {
      clearInterval(capitalHintTimerRef.current);
      capitalHintTimerRef.current = null;
    }
    if (playerNameRef.current) {
      saveToLeaderboard(playerNameRef.current, scoreRef.current, gameModeRef.current);
    }
    setGameStarted(false);
    setCurrentCountry(null);
    setFeedback(null);
  }

  // ── Reset score ───────────────────────────────────────────────────────────────
  function resetScore() {
    setScore(0);
    scoreRef.current = 0;
  }

  // ── Skip to next country ──────────────────────────────────────────────────────
  function nextCountry() {
    if (playerNameRef.current) {
      saveToLeaderboard(playerNameRef.current, scoreRef.current, gameModeRef.current);
    }
    pickRandomCountry();
  }

  // ── Cleanup on unmount ────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopTimer();
      if (capitalHintTimerRef.current) clearInterval(capitalHintTimerRef.current);
    };
  }, [stopTimer]);

  // ── Context value ─────────────────────────────────────────────────────────────
  const value = {
    // Data
    countries,
    loading,
    error,
    // Game state
    currentCountry,
    score,
    gameMode,
    gameStarted,
    playerName,
    feedback,
    // Timer
    timeLeft,
    timerActive,
    // Flag hints
    revealedLetters,
    hintCount,
    // Capitals
    capitalOptions,
    eliminatedOptions,
    // Leaderboards
    leaderboard,
    capitalsLeaderboard,
    // Actions
    startGame,
    endGame,
    guess,
    guessCapital,
    requestHint,
    nextCountry,
    resetScore,
    setGameMode,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
