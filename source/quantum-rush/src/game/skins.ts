// Runner colours and trails, unlocked by medals.
import type { RGB } from './worlds';

export interface Skin {
  id: string;
  name: string;
  body: RGB;
  rim: RGB;
  glow: RGB;
  unlock: string; // human-readable
  need: Need;
}

export interface Trail {
  id: string;
  name: string;
  kind: 'ribbon' | 'sparks' | 'pixels' | 'rainbow' | 'flame' | 'notes';
  unlock: string;
  need: Need;
}

/** Unlock rule: cleared level count, a level's shards, or total shards. */
export type Need = { kind: 'free' } | { kind: 'clears'; n: number } | { kind: 'shards'; n: number } | { kind: 'level'; id: string };

export const SKINS: Skin[] = [
  { id: 'volt', name: 'Volt', body: [61, 242, 224], rim: [255, 255, 255], glow: [61, 242, 224], unlock: 'Ready to go', need: { kind: 'free' } },
  { id: 'ember', name: 'Ember', body: [255, 122, 61], rim: [255, 230, 160], glow: [255, 90, 40], unlock: 'Clear 1 level', need: { kind: 'clears', n: 1 } },
  { id: 'bloom', name: 'Bloom', body: [255, 79, 216], rim: [255, 214, 245], glow: [255, 79, 216], unlock: 'Clear 2 levels', need: { kind: 'clears', n: 2 } },
  { id: 'lime', name: 'Lime', body: [160, 255, 80], rim: [240, 255, 210], glow: [125, 255, 60], unlock: 'Clear 3 levels', need: { kind: 'clears', n: 3 } },
  { id: 'gold', name: 'Gold', body: [255, 209, 102], rim: [255, 255, 230], glow: [255, 190, 40], unlock: 'Collect 6 shards', need: { kind: 'shards', n: 6 } },
  { id: 'ice', name: 'Glacier', body: [150, 220, 255], rim: [255, 255, 255], glow: [100, 180, 255], unlock: 'Clear 5 levels', need: { kind: 'clears', n: 5 } },
  { id: 'void', name: 'Void', body: [40, 30, 70], rim: [180, 120, 255], glow: [140, 90, 255], unlock: 'Collect 15 shards', need: { kind: 'shards', n: 15 } },
  { id: 'ruby', name: 'Ruby', body: [255, 43, 80], rim: [255, 200, 210], glow: [255, 30, 60], unlock: 'Clear Redline', need: { kind: 'level', id: 'redline' } },
  { id: 'prism', name: 'Prism', body: [255, 255, 255], rim: [255, 255, 255], glow: [255, 255, 255], unlock: 'Clear Singularity', need: { kind: 'level', id: 'singularity' } },
  { id: 'aurora', name: 'Aurora', body: [120, 255, 200], rim: [220, 180, 255], glow: [160, 120, 255], unlock: 'Collect all 30 shards', need: { kind: 'shards', n: 30 } },
];

export const TRAILS: Trail[] = [
  { id: 'ribbon', name: 'Ribbon', kind: 'ribbon', unlock: 'Ready to go', need: { kind: 'free' } },
  { id: 'sparks', name: 'Sparks', kind: 'sparks', unlock: 'Collect 3 shards', need: { kind: 'shards', n: 3 } },
  { id: 'pixels', name: 'Pixels', kind: 'pixels', unlock: 'Clear 4 levels', need: { kind: 'clears', n: 4 } },
  { id: 'notes', name: 'Notes', kind: 'notes', unlock: 'Collect 9 shards', need: { kind: 'shards', n: 9 } },
  { id: 'flame', name: 'Flame', kind: 'flame', unlock: 'Clear 7 levels', need: { kind: 'clears', n: 7 } },
  { id: 'rainbow', name: 'Rainbow', kind: 'rainbow', unlock: 'Collect 21 shards', need: { kind: 'shards', n: 21 } },
];
