import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy, Frown, Handshake, RotateCcw, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { sound } from "@/game/sound";

interface Props {
  result: "won" | "lost" | "draw";
  onReplay: () => void;
  onNewGame: () => void;
  onHome: () => void;
}

export default function ResultScreen({ result, onReplay, onNewGame, onHome }: Props) {
  const config = {
    won: {
      title: "VICTORY",
      subtitle: "You outsmarted the AI!",
      icon: Trophy,
      color: "text-success",
      glowClass: "shadow-[0_0_80px_hsl(var(--success)/0.6)]",
      gradient: "from-success via-primary to-success",
    },
    lost: {
      title: "DEFEATED",
      subtitle: "The AI claimed this round",
      icon: Frown,
      color: "text-accent",
      glowClass: "shadow-[0_0_80px_hsl(var(--accent)/0.6)]",
      gradient: "from-accent via-secondary to-accent",
    },
    draw: {
      title: "STALEMATE",
      subtitle: "A perfectly balanced match",
      icon: Handshake,
      color: "text-warning",
      glowClass: "shadow-[0_0_80px_hsl(var(--warning)/0.5)]",
      gradient: "from-warning via-primary to-warning",
    },
  }[result];

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-background/85 backdrop-blur-md p-6"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className={cn("glass-card scanline relative w-full max-w-md overflow-hidden rounded-3xl p-10 text-center", config.glowClass)}
      >
        <motion.div
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 18 }}
          className="mx-auto mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-background to-muted"
        >
          <Icon className={cn("h-12 w-12", config.color)} />
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.25 }}
          className={cn(
            "font-display text-5xl font-black tracking-widest bg-gradient-to-r bg-clip-text text-transparent",
            config.gradient,
          )}
        >
          {config.title}
        </motion.h2>
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-3 text-base text-muted-foreground"
        >
          {config.subtitle}
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mt-8 flex flex-col gap-3"
        >
          <Button
            size="lg"
            onClick={() => { sound.play("click"); onReplay(); }}
            className="h-12 bg-gradient-to-r from-primary to-secondary font-display tracking-widest text-primary-foreground shadow-[0_0_30px_hsl(var(--primary)/0.5)]"
          >
            <RotateCcw className="mr-2 h-4 w-4" /> PLAY AGAIN
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { sound.play("click"); onNewGame(); }}>
              New Difficulty
            </Button>
            <Button variant="ghost" className="flex-1" onClick={() => { sound.play("click"); onHome(); }}>
              <Home className="mr-2 h-4 w-4" /> Home
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
