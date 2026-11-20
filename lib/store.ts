import fs from "fs";
import path from "path";
import type { Fee } from "./batch";

// Swap load/save for Redis / Postgres on serverless hosts (Netlify/Vercel disk is ephemeral).
const FILE = process.env.DATA_FILE ?? path.join(process.cwd(), ".data", "store.json");

export type DB = { 
  cfg: Fee; 
  stats: { 
    batches: number; 
    revenueLamports: number; 
    volume: Record<string, number>; 
    users: string[] 
  }; 
  seen: string[] 
};

const fresh = (): DB => ({
  cfg: { 
    mode: "flat", 
    flatLamports: 10_000_000, 
    bps: 25, 
    free: false, 
    treasury: process.env.TREASURY_WALLET ?? "", 
    paused: false 
  },
  stats: { 
    batches: 0, 
    revenueLamports: 0, 
    volume: {}, 
    users: [] 
  }, 
  seen: [],
});

export const load = (): DB => { 
  try {
    if (!fs.existsSync(FILE)) return fresh();
    const raw = fs.readFileSync(FILE, "utf8");
    const parsed = JSON.parse(raw);
    const defaults = fresh();

    // Robust deep merge to prevent runtime errors if store.json has missing fields
    return {
      cfg: { ...defaults.cfg, ...(parsed.cfg || {}) },
      stats: {
        batches: typeof parsed.stats?.batches === "number" ? parsed.stats.batches : defaults.stats.batches,
        revenueLamports: typeof parsed.stats?.revenueLamports === "number" ? parsed.stats.revenueLamports : defaults.stats.revenueLamports,
        volume: parsed.stats?.volume && typeof parsed.stats.volume === "object" ? parsed.stats.volume : defaults.stats.volume,
        users: Array.isArray(parsed.stats?.users) ? parsed.stats.users : defaults.stats.users,
      },
      seen: Array.isArray(parsed.seen) ? parsed.seen : defaults.seen,
    };
  } catch { 
    return fresh(); 
  } 
};

export const save = (d: DB) => { 
  try {
    fs.mkdirSync(path.dirname(FILE), { recursive: true }); 
    fs.writeFileSync(FILE, JSON.stringify(d, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to save database state:", err);
  }
};