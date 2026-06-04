import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import LandingScreen from "@/components/LandingScreen";
import DifficultyScreen from "@/components/DifficultyScreen";
import GameScreen from "@/components/GameScreen";
import { loadStats } from "@/game/storage";
import type { Difficulty } from "@/game/ai";

type Screen = "landing" | "difficulty" | "game";

const Index = () => {
  const [screen, setScreen] = useState<Screen>("landing");
  const [difficulty, setDifficulty] = useState<Difficulty>("impossible");
  const [stats, setStats] = useState(loadStats);

  useEffect(() => {
    if (screen === "landing") setStats(loadStats());
    document.title =
      screen === "landing"
        ? "Tic Tac Toe 3D — Premium Neon AI Game"
        : screen === "difficulty"
          ? "Select Difficulty — Tic Tac Toe 3D"
          : `Playing ${difficulty} — Tic Tac Toe 3D`;
  }, [screen, difficulty]);

  return (
    <main className="relative min-h-screen text-foreground">
      <AnimatePresence mode="wait">
        {screen === "landing" && (
          <LandingScreen key="landing" stats={stats} onStart={() => setScreen("difficulty")} />
        )}
        {screen === "difficulty" && (
          <DifficultyScreen
            key="difficulty"
            onBack={() => setScreen("landing")}
            onSelect={(d) => {
              setDifficulty(d);
              setScreen("game");
            }}
          />
        )}
        {screen === "game" && (
          <GameScreen
            key="game"
            difficulty={difficulty}
            onHome={() => setScreen("landing")}
            onChangeDifficulty={() => setScreen("difficulty")}
          />
        )}
      </AnimatePresence>
    </main>
  );
};

export default Index;

