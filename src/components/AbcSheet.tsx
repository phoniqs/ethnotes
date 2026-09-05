import { useEffect, useId, useMemo, useRef, useState } from 'react';
import abcjs from 'abcjs';
import 'abcjs/abcjs-audio.css';
import { ChevronDown, ChevronUp, Volume2, VolumeX } from 'lucide-react';

interface AbcSheetProps {
  abc: string;
  showAudio?: boolean;
  responsive?: boolean;
  scale?: number;
  className?: string;
  transpose?: number;
  onTransposeChange?: (value: number) => void;
}

class CursorControl {
  private highlighted: Element[] = [];
  onStart() { this.clear(); }
  onEvent(ev: { elements?: HTMLElement[][] }) {
    this.clear();
    ev.elements?.forEach((group) => group.forEach((element) => {
      element.classList.add('abcjs-note_selected');
      this.highlighted.push(element);
    }));
  }
  onFinished() { this.clear(); }
  private clear() {
    this.highlighted.forEach((element) => element.classList.remove('abcjs-note_selected'));
    this.highlighted = [];
  }
}

export default function AbcSheet({ abc, showAudio = false, responsive = true, scale, className = '', transpose, onTransposeChange }: AbcSheetProps) {
  const rawId = useId().replace(/:/g, '');
  const paperId = `abc-paper-${rawId}`;
  const audioId = `abc-audio-${rawId}`;
  const paperRef = useRef<HTMLDivElement>(null);
  const audioContainerRef = useRef<HTMLDivElement>(null);
  const cursorControl = useMemo(() => new CursorControl(), []);
  const [audioReady, setAudioReady] = useState(false);
  const [audioSupported, setAudioSupported] = useState(true);
  const [renderError, setRenderError] = useState(false);
  const [localTranspose, setLocalTranspose] = useState(0);
  const shift = transpose ?? localTranspose;

  useEffect(() => {
    const paper = paperRef.current;
    if (!paper) return;

    setRenderError(false);
    paper.replaceChildren();

    let visualObjs: abcjs.TuneObject[];
    try {
      visualObjs = abcjs.renderAbc(paper, abc || 'X:1\nT:(empty)', {
        add_classes: true,
        responsive: responsive ? 'resize' : undefined,
        visualTranspose: shift,
        scale: scale ?? 1,
        staffwidth: 740,
        paddingtop: 6,
        paddingbottom: 6,
        paddingleft: 0,
        paddingright: 0,
      });
    } catch {
      setRenderError(true);
      return;
    }

    if (!showAudio) return;

    const audioEl = audioContainerRef.current;
    if (!audioEl) return;

    if (!abcjs.synth.supportsAudio()) {
      setAudioSupported(false);
      return;
    }

    let cancelled = false;
    audioEl.replaceChildren();
    const audioDiv = document.createElement('div');
    audioDiv.id = audioId;
    audioEl.appendChild(audioDiv);

    try {
      const synthControl = new abcjs.synth.SynthController();
      synthControl.load(`#${audioId}`, cursorControl, {
        displayLoop: true,
        displayRestart: true,
        displayPlay: true,
        displayProgress: true,
        displayWarp: true,
      });
      synthControl.setTune(visualObjs[0], false, { chordsOff: false })
        .then(() => { if (!cancelled) setAudioReady(true); })
        .catch(() => { if (!cancelled) { setAudioReady(false); setAudioSupported(false); } });
      return () => { cancelled = true; try { synthControl.pause(); } catch { /* noop */ } };
    } catch {
      setAudioSupported(false);
    }
  }, [abc, showAudio, responsive, scale, audioId, cursorControl, shift]);

  function setShift(value: number) {
    const next = Math.max(-12, Math.min(12, value));
    if (onTransposeChange) onTransposeChange(next);
    else setLocalTranspose(next);
  }

  if (renderError) {
    return <div className={className}><div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">The ABC notation for this tune could not be rendered.</div></div>;
  }

  return <div className={className}>
    {showAudio && <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-wood-200 bg-parchment-50 px-3 py-2 dark:border-wood-700 dark:bg-wood-800">
      <span className="text-xs font-semibold uppercase tracking-wide text-wood-500 dark:text-parchment-200/70">Modulation</span>
      <div className="flex items-center gap-1.5">
        <button onClick={() => setShift(shift - 1)} className="rounded-md p-1.5 text-wood-600 hover:bg-amber-100 dark:text-parchment-100 dark:hover:bg-wood-700" aria-label="Transpose down one semitone"><ChevronDown className="h-4 w-4" /></button>
        <span className="min-w-24 text-center text-sm font-medium text-wood-700 dark:text-parchment-100">{shift === 0 ? 'Original key' : `${shift > 0 ? '+' : ''}${shift} semitones`}</span>
        <button onClick={() => setShift(shift + 1)} className="rounded-md p-1.5 text-wood-600 hover:bg-amber-100 dark:text-parchment-100 dark:hover:bg-wood-700" aria-label="Transpose up one semitone"><ChevronUp className="h-4 w-4" /></button>
        <button onClick={() => setShift(0)} className="ml-1 rounded-md px-2 py-1 text-xs text-amber-800 hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-wood-700">Reset</button>
      </div>
    </div>}
    <div id={paperId} ref={paperRef} className="abc-sheet" />
    {showAudio && <div className="mt-4">
      <div ref={audioContainerRef} />
      {!audioSupported && <div className="flex items-center gap-2 rounded-xl border border-wood-200 bg-parchment-50 px-4 py-3 text-sm text-wood-500 dark:border-wood-700 dark:bg-wood-800 dark:text-parchment-200"><VolumeX className="h-4 w-4" />Audio playback is not available in this browser.</div>}
      {audioReady && audioSupported && <p className="mt-2 flex items-center gap-1.5 text-xs text-wood-400 dark:text-parchment-200/60"><Volume2 className="h-3.5 w-3.5" />Press play to hear the tune.</p>}
    </div>}
  </div>;
}
