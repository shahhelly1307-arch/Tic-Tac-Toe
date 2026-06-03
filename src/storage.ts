export interface Stats {
  wins: number;
  losses: number;
  draws: number;
  streak: number;
  bestStreak: number;
  gamesByDifficulty: { easy: number; medium: number; impossible: number };
}

const KEY = "ttt3d_stats_v1";

export const defaultStats: Stats = {
  wins: 0,
  losses: 0,
  draws: 0,
  streak: 0,
  bestStreak: 0,
  gamesByDifficulty: { easy: 0, medium: 0, impossible: 0 },
};

export function loadStats(): Stats {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultStats;
    return { ...defaultStats, ...JSON.parse(raw) };
  } catch {
    return defaultStats;
  }
}

export function saveStats(stats: Stats) {
  try {
    localStorage.setItem(KEY, JSON.stringify(stats));
  } catch { /* ignore */ }
}
