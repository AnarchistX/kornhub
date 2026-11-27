import type { NightDef } from '../engine/types';
import { NIGHT1 } from './night1';
import { NIGHT2 } from './night2';
import { NIGHT3 } from './night3';
import { NIGHT4 } from './night4';
import { NIGHT5 } from './night5';
import { NIGHT6 } from './night6';
import { NIGHT7 } from './night7';
import { NIGHT8 } from './night8';
import { NIGHT9 } from './night9';
import { NIGHT10 } from './night10';

export const NIGHTS: Record<number, NightDef> = { 1: NIGHT1, 2: NIGHT2, 3: NIGHT3, 4: NIGHT4, 5: NIGHT5, 6: NIGHT6, 7: NIGHT7, 8: NIGHT8, 9: NIGHT9, 10: NIGHT10 };
export const LAST_BUILT_NIGHT = 10; // the finale
export const SHIFT_MINUTES = 480; // 23:00 → 07:00
export const FREE_ERRORS = 2; // per night, before write-ups
export const MAX_WRITEUPS = 3;
