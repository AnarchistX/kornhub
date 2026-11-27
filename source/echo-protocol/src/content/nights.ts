import type { NightDef } from '../engine/types';
import { NIGHT1 } from './night1';

export const NIGHTS: Record<number, NightDef> = { 1: NIGHT1 };
export const LAST_BUILT_NIGHT = 1;
export const SHIFT_MINUTES = 480; // 23:00 → 07:00
export const FREE_ERRORS = 2; // per night, before write-ups
export const MAX_WRITEUPS = 3;
