import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Brain, Cpu, Sparkles } from "lucide-react";
import type { Difficulty } from "@/game/ai";
import { cn } from "@/lib/utils";
import { sound } from "@/game/sound";

interface Props {
  onSelect: (d: Difficulty) => void;
  onBack: () => void;
}

const OPTIONS: {
  id: Difficulty;
  title: string;
  subtitle: string;
  color: string;
  glow: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "easy", title: "EASY", subtitle: "AI plays mostly random moves", color: "text-success", glow: "shadow-[0_0_30px_hsl(var(--success)/0.4)]", icon: Sparkles },
  { id: "medium", title: "MEDIUM", subtitle: "AI mixes strategy and chance", color: "text-warning", glow: "shadow-[0_0_30px_hsl(var(--warning)/0.4)]", icon: Cpu },
  { id: "impossible", title: "IMPOSSIBLE", subtitle: "Unbeatable minimax — best you can do is draw", color: "text-accent", glow: "shadow-[0_0_40px_hsl(var(--accent)/0.5)]", icon: Brain },
];

export default function DifficultyScreen({ onSelect, onBack }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative grid min-h-screen place-items-center px-6 py-12 grid-bg"
    >
      <div className="w-full max-w-5xl">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-12 text-center">
          <h2 className="font-display text-4xl font-bold tracking-widest text-primary neon-text md:text-6xl">
            SELECT DIFFICULTY
          </h2>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">Choose your challenge level</p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {OPTIONS.map((opt, i) => {
            const Icon = opt.icon;
            return (
              <motion.button
                key={opt.id}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onMouseEnter={() => sound.play("hover")}
                onClick={() => {
                  sound.play("click");
                  onSelect(opt.id);
                }}
                className={cn(
                  "glass-card scanline relative overflow-hidden rounded-2xl p-8 text-left transition-all duration-300 hover:border-primary/60",
                  opt.glow,
                )}
              >
                <div className="absolute right-4 top-4 opacity-20">
                  <Icon className={cn("h-20 w-20", opt.color)} />
                </div>
                <Icon className={cn("mb-4 h-10 w-10", opt.color)} />
                <h3 className={cn("font-display text-2xl font-bold tracking-wider md:text-3xl", opt.color)}>
                  {opt.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground md:text-base">{opt.subtitle}</p>
                <div className="mt-6 flex items-center text-xs uppercase tracking-[0.3em] text-primary">
                  Play →
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Button
            variant="ghost"
            onClick={() => {
              sound.play("click");
              onBack();
            }}
            className="text-muted-foreground hover:text-primary"
          >
            ← Back to home
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
