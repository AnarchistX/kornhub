// Secure VTC calls: ringing, a grainy talking portrait, typed lines with voice blips, choices.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CallDef, CallNode } from '../engine/types';
import { allCalls, applyEffect, closePopup, getState, nightDef, useGame, useSettings } from '../engine/store';
import { useTyped } from '../engine/hooks';
import { fill, personById } from '../engine/text';
import { audio } from '../engine/audio';
import { Portrait } from '../art/Portrait';

const CHAR_MS = [0, 26, 48];
const PITCH: Record<string, number> = { tolliver: 140, pike: 250, reyes: 290, ashcombe: 165, kraemer: 270, varga: 125 };

export function CallPopup() {
  const popup = useGame((s) => s.night.popup);
  const call = popup ? allCalls(nightDef()).find((c) => c.id === popup) : undefined;
  if (!call) return null;
  return <CallWindow key={call.id} call={call} />;
}

interface Line {
  who: 'them' | 'you' | 'sys';
  text: string;
}

function textOf(node: CallNode) {
  const s = getState();
  return fill(typeof node.text === 'function' ? node.text(s) : node.text, s);
}

function CallWindow({ call }: { call: CallDef }) {
  const settings = useSettings();
  const profile = useGame((s) => s.profile);
  const caller = personById(call.from, profile);
  const [live, setLive] = useState(false);
  const [nodeId, setNodeId] = useState(call.start);
  const [log, setLog] = useState<Line[]>([]);
  const [secs, setSecs] = useState(0);
  const applied = useRef<Set<string>>(new Set());
  const scroller = useRef<HTMLDivElement>(null);
  const node = call.nodes[nodeId];
  const text = live ? textOf(node) : '';
  const pitch = PITCH[call.from] ?? (call.from === '' ? 200 : caller?.photo.sex === 'f' ? 260 : 170);
  const onChar = useCallback(() => audio.blip(pitch), [pitch]);
  const [typed, done, finish] = useTyped(text, CHAR_MS[settings.textSpeed] ?? 26, onChar);
  // A tap meant for "Skip" must not land on whatever replaces it (End call, or a choice).
  const readyAt = useRef(0);
  useEffect(() => {
    if (done) readyAt.current = performance.now() + 280;
  }, [done, nodeId]);
  const ready = () => performance.now() >= readyAt.current;

  // Ring until answered.
  useEffect(() => {
    if (live) return;
    audio.play('ring');
    const id = window.setInterval(() => audio.play('ring'), 2600);
    return () => window.clearInterval(id);
  }, [live]);

  // Call timer and line hiss.
  useEffect(() => {
    if (!live) return;
    audio.line(true);
    const id = window.setInterval(() => setSecs((x) => x + 1), 1000);
    return () => {
      window.clearInterval(id);
      audio.line(false);
    };
  }, [live]);

  // Each node's effect applies once, when it is reached.
  useEffect(() => {
    if (!live || applied.current.has(nodeId)) return;
    applied.current.add(nodeId);
    if (node.effect) applyEffect(node.effect);
  }, [live, nodeId, node]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [typed, log]);

  const goTo = (to: string, said?: string) => {
    setLog((l) => [...l, { who: node.who, text }, ...(said ? [{ who: 'you' as const, text: said }] : [])]);
    setNodeId(to);
  };
  const advance = () => {
    if (!done) return finish();
    const next = typeof node.next === 'function' ? node.next(getState()) : node.next;
    if (next) goTo(next);
  };
  const hangUp = () => {
    audio.play('hangup');
    closePopup();
  };

  const name = call.name ?? (caller ? `${caller.first.split(' ')[0]} ${caller.last}` : 'Unknown caller');
  const role = call.role ?? (caller ? caller.title : '');
  const voiceOnly = call.video === false || !caller;
  const label = (call.name ?? caller?.last ?? 'CALLER').toUpperCase();
  const mm = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss = String(secs % 60).padStart(2, '0');

  return (
    <div className="scrim vtc-scrim">
      <div className="dialog vtc" role="dialog" aria-label={`Video call from ${name}`}>
        <div className="win-title">
          <span className="t">Secure VTC · {live ? 'Connected' : 'Incoming call'}</span>
        </div>
        <div className="vtc-body">
          <div className={`vtc-feed ${live ? 'on' : 'ringing'} ${voiceOnly ? 'voice' : 'video'}`}>
            {caller && !voiceOnly && (
              <div className="vtc-face">
                <Portrait spec={caller.photo} title={name} talking={live && !done} />
              </div>
            )}
            {voiceOnly && (
              <div className="vtc-novideo">
                <div>VIDEO DISABLED BY CALLER</div>
                <div className={`wave ${live && !done ? 'on' : ''}`} aria-hidden="true">
                  {Array.from({ length: 16 }, (_, i) => (
                    <i key={i} style={{ animationDelay: `${(i * 53) % 400}ms` }} />
                  ))}
                </div>
              </div>
            )}
            <div className="vtc-osd top">
              <span>{live ? `● ${mm}:${ss}` : 'RINGING'}</span>
              <span>ISDN 384K · 15 FPS</span>
            </div>
            <div className="vtc-osd bottom">
              <b>{name.toUpperCase()}</b>
              <span>{role}</span>
              <span>{call.place}</span>
            </div>
          </div>
          <div className="vtc-talk">
            <div className="vtc-log scroll" ref={scroller} aria-live="polite">
              {!live && <div className="vtc-line sys">Incoming secure video call from {call.place}.</div>}
              {log.map((l, i) => (
                <div key={i} className={`vtc-line ${l.who}`}>
                  <span className="who">{l.who === 'you' ? 'YOU' : label}</span>
                  {l.text}
                </div>
              ))}
              {live && (
                <div className={`vtc-line ${node.who}`} onClick={advance}>
                  <span className="who">{node.who === 'you' ? 'YOU' : label}</span>
                  {typed}
                  {!done && <span className="caret">▌</span>}
                </div>
              )}
            </div>
            <div className="vtc-actions">
              {!live ? (
                <button
                  key="answer"
                  className="btn big approve"
                  autoFocus
                  onClick={() => {
                    audio.unlock();
                    audio.play('click');
                    setLive(true);
                  }}
                >
                  <span>Answer</span>
                </button>
              ) : !done ? (
                <button key="skip" className="btn" onClick={finish}>
                  <span>Skip ▸</span>
                </button>
              ) : node.choices ? (
                node.choices.map((c) => (
                  <button
                    key={`${nodeId}:${c.to}:${c.text}`}
                    className="btn choice"
                    onClick={() => {
                      if (!ready()) return;
                      audio.play('click');
                      if (c.effect) applyEffect(c.effect);
                      goTo(c.to, c.text);
                    }}
                  >
                    <span>{c.text}</span>
                  </button>
                ))
              ) : node.end ? (
                <button key="end" className="btn big deny" onClick={() => ready() && hangUp()}>
                  <span>End call</span>
                </button>
              ) : (
                <button key={`next:${nodeId}`} className="btn big" onClick={() => ready() && advance()}>
                  <span>Continue ▸</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
