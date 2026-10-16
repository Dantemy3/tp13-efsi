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

// ─── Constantes ────────────────────────────────────────────────────────────────
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
  // Datos de la API
  const [countries, setCountries] = useState([]);       // [{ name, flag }]
  const [capitalsData, setCapitalsData] = useState([]); // [{ name, capital }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado del juego base
  const [currentCountry, setCurrentCountry] = useState(null);
  const [score, setScore] = useState(0);
  const [gameMode, setGameMode] = useState('flags'); // 'flags' | 'capitals'
  const [gameStarted, setGameStarted] = useState(false);

  // Jugador actual
  const [playerName, setPlayerName] = useState('');

  // Timer
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  // Pistas (modo banderas)
  const [revealedLetters, setRevealedLetters] = useState([]); // índices revelados
  const [hintCount, setHintCount] = useState(0);

  // Modo capitales: opciones de respuesta
  const [capitalOptions, setCapitalOptions] = useState([]); // [{ capital, isCorrect }]
  const [eliminatedOptions, setEliminatedOptions] = useState([]); // índices eliminados por pista
  const capitalHintTimerRef = useRef(null);

  // Feedback de respuesta
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong' | null

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState([]);
  const [capitalsLeaderboard, setCapitalsLeaderboard] = useState([]);

  // ── Carga de datos ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [flags, capitals] = await Promise.all([fetchFlags(), fetchCapitals()]);
        // Cruzar datos para tener { name, flag, capital }
        const enriched = flags.map((c) => {
          const capEntry = capitals.find(
            (cap) => cap.name.toLowerCase() === c.name.toLowerCase()
          );
          return { ...c, capital: capEntry?.capital || null };
        });
        setCountries(enriched);
        setCapitalsData(capitals);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // ── Leaderboard desde AsyncStorage ───────────────────────────────────────────
  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    try {
      const raw = await AsyncStorage.getItem(LEADERBOARD_KEY);
      if (raw) setLeaderboard(JSON.parse(raw));
      const rawCap = await AsyncStorage.getItem(CAPITALS_LEADERBOARD_KEY);
      if (rawCap) setCapitalsLeaderboard(JSON.parse(rawCap));
    } catch (_) {}
  }

  async function saveToLeaderboard(name, finalScore, mode) {
    const key = mode === 'capitals' ? CAPITALS_LEADERBOARD_KEY : LEADERBOARD_KEY;
    const setFn = mode === 'capitals' ? setCapitalsLeaderboard : setLeaderboard;
    const currentBoard = mode === 'capitals' ? capitalsLeaderboard : leaderboard;

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
    setFn(updated);
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

  const startTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(TIMER_SECONDS);
    setTimerActive(true);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setTimerActive(false);
          // Tiempo agotado: siguiente país sin sumar puntos
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopTimer]);

  function handleTimeUp() {
    setFeedback('timeout');
    setTimeout(() => {
      setFeedback(null);
      pickRandomCountry();
    }, 1500);
  }

  // ── Pista capital: eliminar opción cada 5s ────────────────────────────────────
  function startCapitalHintTimer(optionsLength) {
    if (capitalHintTimerRef.current) clearInterval(capitalHintTimerRef.current);
    setEliminatedOptions([]);
    capitalHintTimerRef.current = setInterval(() => {
      setEliminatedOptions((prev) => {
        // Eliminar una incorrecta que no esté ya eliminada
        const wrongIndices = Array.from({ length: optionsLength }, (_, i) => i).filter(
          (i) => !capitalOptions[i]?.isCorrect && !prev.includes(i)
        );
        if (wrongIndices.length === 0) {
          clearInterval(capitalHintTimerRef.current);
          return prev;
        }
        const toElim = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
        return [...prev, toElim];
      });
    }, 5000);
  }

  // ── Elegir país al azar ───────────────────────────────────────────────────────
  const pickRandomCountry = useCallback(
    (list) => {
      const source = list || countries;
      if (!source.length) return;
      stopTimer();
      if (capitalHintTimerRef.current) clearInterval(capitalHintTimerRef.current);

      const rand = source[Math.floor(Math.random() * source.length)];
      setCurrentCountry(rand);
      setRevealedLetters([]);
      setHintCount(0);
      setEliminatedOptions([]);

      if (gameMode === 'capitals') {
        const options = buildCapitalOptions(rand, source);
        setCapitalOptions(options);
        startCapitalHintTimer(options.length);
      }

      startTimer();
    },
    [countries, gameMode, startTimer, stopTimer]
  );

  function buildCapitalOptions(correct, source) {
    const wrongs = source
      .filter((c) => c.capital && c.name !== correct.name)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((c) => ({ capital: c.capital, isCorrect: false }));

    const all = [...wrongs, { capital: correct.capital, isCorrect: true }].sort(
      () => Math.random() - 0.5
    );
    return all;
  }

  // ── Iniciar juego ─────────────────────────────────────────────────────────────
  function startGame(name, mode = 'flags') {
    setPlayerName(name);
    setScore(0);
    setGameMode(mode);
    setGameStarted(true);
    setFeedback(null);
    pickRandomCountry(countries);
  }

  // ── Adivinar bandera (texto libre) ───────────────────────────────────────────
  function guess(input) {
    if (!currentCountry || feedback) return;
    const normalized = input.trim().toLowerCase();
    const correct = currentCountry.name.toLowerCase();

    if (normalized === correct) {
      const bonus = timeLeft; // segundos restantes
      setScore((s) => s + 10 + bonus);
      setFeedback('correct');
      stopTimer();
      setTimeout(() => {
        setFeedback(null);
        pickRandomCountry();
      }, 1200);
    } else {
      setScore((s) => Math.max(0, s - 1));
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 800);
    }
  }

  // ── Adivinar capital (opción múltiple) ───────────────────────────────────────
  function guessCapital(option) {
    if (!currentCountry || feedback) return;
    if (option.isCorrect) {
      const bonus = timeLeft;
      setScore((s) => s + 10 + bonus);
      setFeedback('correct');
      stopTimer();
      if (capitalHintTimerRef.current) clearInterval(capitalHintTimerRef.current);
      setTimeout(() => {
        setFeedback(null);
        pickRandomCountry();
      }, 1200);
    } else {
      setScore((s) => Math.max(0, s - 1));
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 800);
    }
  }

  // ── Pista (modo banderas) ─────────────────────────────────────────────────────
  function requestHint() {
    if (!currentCountry) return;
    const name = currentCountry.name;
    const allIndices = Array.from({ length: name.length }, (_, i) => i).filter(
      (i) => name[i] !== ' ' && !revealedLetters.includes(i)
    );
    if (allIndices.length === 0) return;

    const pick = allIndices[Math.floor(Math.random() * allIndices.length)];
    setRevealedLetters((prev) => [...prev, pick]);
    setHintCount((h) => h + 1);

    // Penalización: -2 segundos del timer
    setTimeLeft((t) => {
      const next = Math.max(1, t - HINT_PENALTY_SECONDS);
      return next;
    });
  }

  // ── Terminar juego (guardar en leaderboard) ───────────────────────────────────
  function endGame() {
    stopTimer();
    if (capitalHintTimerRef.current) clearInterval(capitalHintTimerRef.current);
    if (playerName) saveToLeaderboard(playerName, score, gameMode);
    setGameStarted(false);
    setCurrentCountry(null);
    setFeedback(null);
  }

  // ── Reset score ───────────────────────────────────────────────────────────────
  function resetScore() {
    setScore(0);
  }

  // ── Next country (skip) ───────────────────────────────────────────────────────
  function nextCountry() {
    if (playerName) saveToLeaderboard(playerName, score, gameMode);
    pickRandomCountry();
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopTimer();
      if (capitalHintTimerRef.current) clearInterval(capitalHintTimerRef.current);
    };
  }, [stopTimer]);

  const value = {
    // Datos
    countries,
    loading,
    error,
    // Estado del juego
    currentCountry,
    score,
    gameMode,
    gameStarted,
    playerName,
    feedback,
    // Timer
    timeLeft,
    timerActive,
    // Pistas banderas
    revealedLetters,
    hintCount,
    // Capitales
    capitalOptions,
    eliminatedOptions,
    // Leaderboards
    leaderboard,
    capitalsLeaderboard,
    // Acciones
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
