import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import GameBoard3D from "./GameBoard3D";
import ResultScreen from "./ResultScreen";
import SoundControls from "./SoundControls";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, Home, Loader2, Sparkles, ChevronLeft } from "lucide-react";
import { type Board, type Difficulty, checkWinner, chooseAIMove, isDraw } from "@/game/ai";
import { sound } from "@/game/sound";
import { type Stats, loadStats, saveStats } from "@/game/storage";

interface Props {
  difficulty: Difficulty;
  onHome: () => void;
  onChangeDifficulty: () => void;
}

const EMPTY: Board = Array(9).fill(null);

export default function GameScreen({ difficulty, onHome, onChangeDifficulty }: Props) {
  const [board, setBoard] = useState<Board>(EMPTY);
  const [turn, setTurn] = useState<"human" | "ai">("human");
  const [muted, setMuted] = useState(false);
  const [stats, setStats] = useState<Stats>(loadStats);
  const [showResult, setShowResult] = useState(false);
  const [resolved, setResolved] = useState(false);

  const { winner, line } = useMemo(() => checkWinner(board), [board]);
  const draw = useMemo(() => isDraw(board), [board]);
  const status: "playing" | "won" | "lost" | "draw" =
    winner === "X" ? "won" : winner === "O" ? "lost" : draw ? "draw" : "playing";

  const aiThinking = turn === "ai" && status === "playing";

  // Persist stats on result.
  useEffect(() => {
    if (status === "playing" || resolved) return;
    setResolved(true);
    setStats((prev) => {
      const next: Stats = {
        ...prev,
        wins: prev.wins + (status === "won" ? 1 : 0),
        losses: prev.losses + (status === "lost" ? 1 : 0),
        draws: prev.draws + (status === "draw" ? 1 : 0),
        streak: status === "won" ? prev.streak + 1 : 0,
        bestStreak: status === "won" ? Math.max(prev.bestStreak, prev.streak + 1) : prev.bestStreak,
        gamesByDifficulty: {
          ...prev.gamesByDifficulty,
          [difficulty]: prev.gamesByDifficulty[difficulty] + 1,
        },
      };
      saveStats(next);
      return next;
    });

    sound.play(status === "won" ? "win" : status === "lost" ? "lose" : "draw");
    const t = window.setTimeout(() => setShowResult(true), 1400);
    return () => window.clearTimeout(t);
  }, [status, difficulty, resolved]);

  // AI move
  useEffect(() => {
    if (turn !== "ai" || status !== "playing") return;
    const delay = 600 + Math.random() * 600;
    const t = window.setTimeout(() => {
      const move = chooseAIMove(board, difficulty);
      if (move >= 0) {
        const next = [...board];
        next[move] = "O";
        setBoard(next);
        sound.play("place");
        setTurn("human");
      }
    }, delay);
    return () => window.clearTimeout(t);
  }, [turn, status, board, difficulty]);

  // Start music on first interaction.
  useEffect(() => {
    const start = () => {
      sound.startMusic();
      window.removeEventListener("pointerdown", start);
    };
    window.addEventListener("pointerdown", start, { once: true });
    return () => window.removeEventListener("pointerdown", start);
  }, []);

  const handleCellClick = useCallback(
    (i: number) => {
      if (turn !== "human" || status !== "playing" || board[i]) return;
      const next = [...board];
      next[i] = "X";
      setBoard(next);
      sound.play("place");
      setTurn("ai");
    },
    [turn, status, board],
  );

  const reset = useCallback(() => {
    setBoard(EMPTY);
    setTurn("human");
    setShowResult(false);
    setResolved(false);
    sound.play("click");
  }, []);

  const diffLabel = { easy: "Easy", medium: "Medium", impossible: "Impossible" }[difficulty];
  const diffColor = { easy: "text-success", medium: "text-warning", impossible: "text-accent" }[difficulty];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen overflow-hidden"
    >
      {/* HUD: top bar */}
      <header className="absolute inset-x-0 top-0 z-20 flex flex-wrap items-center justify-between gap-3 p-4 md:p-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { sound.play("click"); onChangeDifficulty(); }} className="border-primary/30 bg-card/40 backdrop-blur">
            <ChevronLeft className="mr-1 h-4 w-4" />
            <span className="hidden sm:inline">Difficulty</span>
          </Button>
          <Badge variant="outline" className={`border-current bg-card/40 backdrop-blur ${diffColor} font-display tracking-widest`}>
            {diffLabel.toUpperCase()}
          </Badge>
        </div>
        <SoundControls muted={muted} setMuted={setMuted} />
      </header>

      {/* Stats side panel (desktop) / bottom (mobile) */}
      <aside className="pointer-events-none absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 p-6 md:block">
        <div className="glass-card pointer-events-auto rounded-2xl p-5 text-sm">
          <div className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-muted-foreground">Stats</div>
          <div className="space-y-2">
            <Row label="Wins" value={stats.wins} className="text-success" />
            <Row label="Draws" value={stats.draws} className="text-warning" />
            <Row label="Losses" value={stats.losses} className="text-accent" />
            <div className="my-2 h-px bg-border" />
            <Row label="Streak" value={stats.streak} className="text-primary" />
            <Row label="Best" value={stats.bestStreak} className="text-primary-glow" />
          </div>
        </div>
      </aside>

      {/* 3D canvas */}
      <div className="absolute inset-0">
        <GameBoard3D
          board={board}
          winningLine={line}
          onCellClick={handleCellClick}
          disabled={turn !== "human" || status !== "playing"}
          status={status}
          aiThinking={aiThinking}
        />
      </div>

      {/* Turn indicator */}
      <div className="pointer-events-none absolute inset-x-0 top-20 z-10 flex justify-center md:top-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={turn + status}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="glass-card rounded-full px-5 py-2 text-sm font-display tracking-widest"
          >
            {status !== "playing" ? (
              <span className="text-primary">ROUND OVER</span>
            ) : turn === "human" ? (
              <span className="text-primary neon-text">YOUR TURN <span className="ml-2 text-primary-glow">X</span></span>
            ) : (
              <span className="text-accent neon-text-accent flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                AI THINKING <span className="ml-1">O</span>
              </span>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <footer className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-3 p-4 md:p-6">
        {/* Mobile compact stats */}
        <div className="glass-card flex gap-4 rounded-full px-5 py-2 text-xs md:hidden">
          <span className="text-success">W {stats.wins}</span>
          <span className="text-warning">D {stats.draws}</span>
          <span className="text-accent">L {stats.losses}</span>
          <span className="text-primary">🔥 {stats.streak}</span>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={reset}
            className="bg-gradient-to-r from-primary to-secondary font-display tracking-widest text-primary-foreground shadow-[0_0_25px_hsl(var(--primary)/0.4)]"
          >
            <RotateCcw className="mr-2 h-4 w-4" /> RESTART
          </Button>
          <Button variant="outline" onClick={() => { sound.play("click"); onChangeDifficulty(); }} className="border-secondary/40">
            <Sparkles className="mr-2 h-4 w-4" /> NEW GAME
          </Button>
          <Button variant="ghost" onClick={() => { sound.play("click"); onHome(); }} aria-label="Home">
            <Home className="h-4 w-4" />
          </Button>
        </div>
      </footer>

      <AnimatePresence>
        {showResult && status !== "playing" && (
          <ResultScreen
            result={status}
            onReplay={reset}
            onNewGame={() => { setShowResult(false); onChangeDifficulty(); }}
            onHome={() => { setShowResult(false); onHome(); }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Row({ label, value, className = "" }: { label: string; value: number; className?: string }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className={`font-display text-lg font-bold ${className}`}>{value}</span>
    </div>
  );
}
