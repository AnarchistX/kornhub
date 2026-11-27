// Music slots for the owner's tracks. Drop files in public/audio/ and set the paths here, e.g.
//   title: 'audio/ridge.mp3'
// Paths are relative to the game's base URL. A null slot simply plays nothing;
// the synthesized ambience and tension layers carry the mood on their own.
import { audio } from './audio';

export type MusicSlot = 'title' | 'night' | 'tension' | 'rollover';

export const MUSIC: Record<MusicSlot, string | null> = {
  title: null,
  night: null,
  tension: null,
  rollover: null,
};

let current: MusicSlot | null = null;

export function playMusic(slot: MusicSlot | null, volume = 1) {
  if (slot === current) return;
  current = slot;
  const old = audio.musicEl;
  if (old) {
    const fade = window.setInterval(() => {
      old.volume = Math.max(0, old.volume - 0.05);
      if (old.volume <= 0.01) {
        old.pause();
        window.clearInterval(fade);
      }
    }, 60);
    audio.musicEl = null;
  }
  const path = slot ? MUSIC[slot] : null;
  if (!path) return;
  const el = new Audio(import.meta.env.BASE_URL + path);
  el.loop = true;
  el.volume = volume;
  audio.musicEl = el;
  void el.play().catch(() => {
    /* autoplay blocked until the next gesture; harmless */
  });
}
