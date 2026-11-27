import type { Song } from '../content/songs';

export type Form = 'spark' | 'flux' | 'comet' | 'blink';

export type ObjKind =
  | 'solid' // terrain: floors, platforms, ceilings, tunnel walls
  | 'thorn' // crystal spike, dir 1 points up (on a floor), -1 points down (from a ceiling)
  | 'rotor' // spinning blade disc
  | 'laser' // beam that is lethal only while on
  | 'node' // pulse node: tap inside it for a mid-air jump
  | 'boost' // boost plate: launches on contact
  | 'crystal' // form crystal: changes form when passed
  | 'gate' // speed gate
  | 'phase' // phase wall: passable only while a Blink is phased
  | 'shard' // collectible
  | 'finish';

/** World units are tiles; y points up. x/y is the bottom-left corner. */
export interface Obj {
  kind: ObjKind;
  x: number;
  y: number;
  w: number;
  h: number;
  dir?: 1 | -1;
  form?: Form;
  speed?: number; // gate: speed multiplier
  beat?: number; // the beat (seconds) this object answers to, for pulsing
  on?: [number, number][]; // laser: lethal intervals in seconds
  idx?: number; // shard number, node number
  r?: number; // rotor radius
  style?: number; // visual variant
}

export interface InputEvent {
  t: number; // seconds of song time
  down: boolean;
}

export interface SectionInfo {
  t: number; // start time
  x: number;
  form: Form;
  speed: number; // multiplier
  intensity: number; // 0..1, from the music, for visuals
  palette: number; // index into the world's palettes
}

export interface Level {
  id: string;
  name: string;
  credit: string;
  world: string;
  song: Song;
  start: number; // song time the run starts at
  end: number; // song time the finish is reached
  fadeAt?: number; // cut levels: song time the music fades out
  endX: number;
  objs: Obj[];
  inputs: InputEvent[]; // the intended run (bot, demo, validation)
  shardInputs: InputEvent[][]; // extra presses that collect each shard
  sections: SectionInfo[];
  beats: number[]; // every beat time (for visuals)
  downbeats: number[];
  drops: number[]; // big musical changes (flash moments)
  tolerance: number; // validator window in seconds
  startForm: Form;
  startSpeed: number;
}
