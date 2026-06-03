import { Volume2, VolumeX, Music, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState } from "react";
import { sound } from "@/game/sound";

interface Props {
  muted: boolean;
  setMuted: (m: boolean) => void;
}

export default function SoundControls({ muted, setMuted }: Props) {
  const [vol, setVol] = useState(70);
  const [music, setMusic] = useState(25);
  const [sfx, setSfx] = useState(60);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          const next = !muted;
          setMuted(next);
          sound.setMuted(next);
          if (!next) sound.play("click");
        }}
        className="border-primary/30 bg-card/40 backdrop-blur"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4 text-primary" />}
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="border-primary/30 bg-card/40 backdrop-blur" aria-label="Sound settings">
            <Settings2 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="glass-card w-72 space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-1.5"><Volume2 className="h-3 w-3" /> Master</span>
              <span className="text-primary">{vol}%</span>
            </div>
            <Slider value={[vol]} onValueChange={(v) => { setVol(v[0]); sound.setVolume(v[0] / 100); }} max={100} step={1} />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-1.5"><Music className="h-3 w-3" /> Music</span>
              <span className="text-primary">{music}%</span>
            </div>
            <Slider value={[music]} onValueChange={(v) => { setMusic(v[0]); sound.setMusicVolume(v[0] / 100); }} max={100} step={1} />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
              <span>SFX</span>
              <span className="text-primary">{sfx}%</span>
            </div>
            <Slider value={[sfx]} onValueChange={(v) => { setSfx(v[0]); sound.setSfxVolume(v[0] / 100); }} max={100} step={1} />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
