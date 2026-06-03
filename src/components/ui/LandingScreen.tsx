import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Gamepad2, Zap } from "lucide-react";
import { sound } from "@/game/sound";

interface Props {
  onStart: () => void;
  stats: { wins: number; losses: number; draws: number };
}

export default function LandingScreen({ onStart, stats }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative grid min-h-screen place-items-center overflow-hidden px-6 py-12 grid-bg"
    >
      {/* Floating neon orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-float-y" />
        <div className="absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-secondary/20 blur-3xl animate-float-y" style={{ animationDelay: "1.5s" }} />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-3xl text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-primary"
        >
          <Zap className="h-3 w-3" />
          Powered by Minimax AI
        </motion.div>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="font-display text-5xl font-black leading-none tracking-tight md:text-7xl lg:text-8xl"
        >
          <span className="block text-primary animate-neon-pulse">TIC TAC</span>
          <span className="mt-2 block bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            TOE 3D
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground md:text-xl"
        >
          A premium 3D tic-tac-toe experience. Face an unbeatable AI, glowing neon pieces, and cinematic effects.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button
            size="lg"
            onClick={() => {
              sound.play("click");
              onStart();
            }}
            className="group relative h-14 overflow-hidden bg-gradient-to-r from-primary to-secondary px-10 font-display text-base font-bold tracking-widest text-primary-foreground shadow-[0_0_40px_hsl(var(--primary)/0.5)] transition-all hover:scale-105 hover:shadow-[0_0_60px_hsl(var(--primary)/0.8)]"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <Gamepad2 className="mr-2 h-5 w-5" />
            START GAME
          </Button>
        </motion.div>

        {(stats.wins + stats.losses + stats.draws) > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-12 flex justify-center gap-6 text-sm"
          >
            <div className="glass-card rounded-xl px-5 py-3">
              <div className="font-display text-2xl font-bold text-success">{stats.wins}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Wins</div>
            </div>
            <div className="glass-card rounded-xl px-5 py-3">
              <div className="font-display text-2xl font-bold text-warning">{stats.draws}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Draws</div>
            </div>
            <div className="glass-card rounded-xl px-5 py-3">
              <div className="font-display text-2xl font-bold text-accent">{stats.losses}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Losses</div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
