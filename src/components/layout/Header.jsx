import { useState, useEffect } from 'react';
import { ChevronRight, ScrollText, Undo2, Pause, Play } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { PHASES } from '../../data/phases';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function Header({ onReset }) {
  const round            = useGameStore((s) => s.round);
  const currentPhase     = useGameStore((s) => s.currentPhase);
  const activePlayer     = useGameStore((s) => s.activePlayer);
  const gameOver         = useGameStore((s) => s.gameOver);
  const timers           = useGameStore((s) => s.timers);
  const timerPaused      = useGameStore((s) => s.timerPaused);
  const canUndo          = useGameStore((s) => s.history.length > 0);
  const undo             = useGameStore((s) => s.undo);
  const advancePhase     = useGameStore((s) => s.advancePhase);
  const tickTimer        = useGameStore((s) => s.tickTimer);
  const toggleTimerPause = useGameStore((s) => s.toggleTimerPause);
  const log              = useGameStore((s) => s.log);
  const p1               = useGameStore((s) => s.players[1]);
  const p2               = useGameStore((s) => s.players[2]);

  const [logOpen, setLogOpen] = useState(false);

  const phaseName = PHASES[currentPhase]?.name ?? '—';

  // Tick the active player's timer every second; freeze when game is over or paused
  useEffect(() => {
    if (gameOver || timerPaused) return;
    const id = setInterval(() => tickTimer(activePlayer), 1000);
    return () => clearInterval(id);
  }, [activePlayer, gameOver, timerPaused, tickTimer]);

  return (
    <header className="h-14 flex items-center px-3 bg-surface-panel border-b border-border-subtle shadow-panel shrink-0 relative">

      {/* LEFT SECTION — Round · Phase Name · Next Phase · Pause */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="font-display text-xl font-semibold text-text-primary whitespace-nowrap">
          Round <span className="text-text-primary">{round}</span><span className="text-text-muted">/5</span>
        </span>

        <span className="text-border-strong">·</span>

        <span className="font-display text-sm font-medium text-text-secondary uppercase tracking-wide whitespace-nowrap max-w-[130px] truncate">
          {phaseName}
        </span>

        <button
          onClick={advancePhase}
          disabled={gameOver}
          className={`flex items-center gap-1 px-3 h-10 min-w-[48px] rounded-panel text-sm font-medium
            whitespace-nowrap transition-colors shrink-0
            ${gameOver
              ? 'bg-surface-inset text-text-muted cursor-not-allowed'
              : 'bg-accent text-accent-foreground hover:bg-accent-hover'
            }`}
        >
          {gameOver ? 'Game Over' : <><span>Next Phase</span><ChevronRight size={15} /></>}
        </button>

        {/* Pause / Resume button — next to Next Phase */}
        <button
          onClick={toggleTimerPause}
          disabled={gameOver}
          className={`flex items-center justify-center w-10 h-10 rounded-panel transition-colors shrink-0
            ${gameOver
              ? 'text-text-muted cursor-not-allowed'
              : timerPaused
                ? 'text-success hover:text-success-hover'
                : 'text-chrome hover:text-chrome-hover hover:bg-surface-inset'
            }`}
          title={timerPaused ? 'Resume timers' : 'Pause timers'}
        >
          {timerPaused ? <Play size={16} /> : <Pause size={16} />}
        </button>
      </div>

      {/* CENTER SECTION — P1 Timer · Scoreboard · P2 Timer */}
      <div className="flex-1 flex items-center justify-center gap-1.5 text-xs whitespace-nowrap min-w-0">

        {/* P1 Timer */}
        <span className={`font-display tabular-nums text-sm ${activePlayer === 1 && !gameOver && !timerPaused ? 'text-accent' : 'text-text-muted'}`}>
          {formatTime(timers.p1)}
        </span>

        <span className="text-border-strong">·</span>

        {/* P1 stats */}
        <span className="text-text-secondary">
          <span className="text-text-primary font-medium">{p1.cp}</span>cp
        </span>
        <span className="text-text-secondary">
          <span className="text-text-primary font-medium">{p1.vp.total}</span>vp
        </span>
        <span className={`font-display font-semibold text-sm ${activePlayer === 1 ? 'text-accent' : 'text-text-muted'}`}>
          {p1.name}
        </span>

        <span className="text-text-muted px-0.5">vs</span>

        {/* P2 stats */}
        <span className={`font-display font-semibold text-sm ${activePlayer === 2 ? 'text-danger' : 'text-text-muted'}`}>
          {p2.name}
        </span>
        <span className="text-text-secondary">
          <span className="text-text-primary font-medium">{p2.cp}</span>cp
        </span>
        <span className="text-text-secondary">
          <span className="text-text-primary font-medium">{p2.vp.total}</span>vp
        </span>

        <span className="text-border-strong">·</span>

        {/* P2 Timer */}
        <span className={`font-display tabular-nums text-sm ${activePlayer === 2 && !gameOver && !timerPaused ? 'text-danger' : 'text-text-muted'}`}>
          {formatTime(timers.p2)}
        </span>

      </div>

      {/* RIGHT SECTION — Undo · Log · Setup */}
      <div className="flex items-center gap-1 shrink-0">

        {/* Undo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className="flex items-center justify-center w-10 h-10 rounded-panel text-chrome
            hover:text-chrome-hover hover:bg-surface-inset disabled:text-text-muted disabled:cursor-not-allowed transition-colors"
          title="Undo last action"
        >
          <Undo2 size={16} />
        </button>

        {/* Action log toggle */}
        <button
          onClick={() => setLogOpen((o) => !o)}
          className={`flex items-center justify-center w-10 h-10 rounded-panel transition-colors
            ${logOpen ? 'text-text-primary bg-surface-inset' : 'text-chrome hover:text-chrome-hover hover:bg-surface-inset'}`}
          title="Action log"
        >
          <ScrollText size={16} />
        </button>

        {/* Setup / Reset */}
        <button
          onClick={onReset}
          className="text-xs text-text-muted hover:text-text-secondary px-2 h-10 rounded-panel whitespace-nowrap transition-colors"
        >
          ↩ Setup
        </button>
      </div>

      {/* Log dropdown */}
      {logOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setLogOpen(false)} />
          <div className="absolute top-full right-0 z-20 w-72 max-h-80 overflow-y-auto
            bg-surface-raised border border-border-subtle rounded-b-panel shadow-raised">
            {log.length === 0 ? (
              <p className="text-xs text-text-muted p-4 text-center">No actions logged yet.</p>
            ) : (
              <ul>
                {log.map((entry, i) => (
                  <li key={i} className="px-4 py-2 flex justify-between gap-4 text-xs
                    border-b border-border-subtle last:border-0">
                    <span className="text-text-secondary">{entry.message}</span>
                    <span className="text-text-muted font-mono whitespace-nowrap">
                      {formatTime(entry.timestamp)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </header>
  );
}
