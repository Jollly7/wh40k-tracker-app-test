import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { PRIMARY_MISSION_IMAGES } from '../../data/missionImages';

const OWNER_STYLES = {
  null: 'bg-surface-inset text-text-muted hover:bg-border-subtle',
  1:    'bg-accent text-accent-foreground hover:bg-accent-hover',
  2:    'bg-danger text-text-inverse hover:bg-danger-hover',
};

function ObjectiveCircle({ obj }) {
  const cycleObjective = useGameStore((s) => s.cycleObjective);
  const style = OWNER_STYLES[obj.owner] ?? OWNER_STYLES[null];

  return (
    <button
      onClick={() => cycleObjective(obj.id)}
      className={`w-14 h-14 rounded-full font-display font-bold text-sm transition-colors shrink-0 ${style}`}
    >
      {obj.id}
    </button>
  );
}

export function ObjectivesSidebar() {
  const objectives = useGameStore((s) => s.objectives);
  const primaryMission = useGameStore((s) => s.primaryMission);
  const p1     = useGameStore((s) => s.players[1]);
  const p2     = useGameStore((s) => s.players[2]);
  const p1Role = useGameStore((s) => s.players[1].role);
  const p1Color = p1Role === 'attacker' ? 'text-danger' : 'text-success';
  const p2Color = p1Role === 'attacker' ? 'text-success' : 'text-danger';

  const [imgFailed, setImgFailed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [cardRect, setCardRect] = useState(null);
  const cardRef = useRef(null);
  useEffect(() => { setImgFailed(false); setLightboxOpen(false); }, [primaryMission]);
  const imgSrc = primaryMission ? PRIMARY_MISSION_IMAGES[primaryMission] : null;
  const hasImage = imgSrc && !imgFailed;

  const openLightbox = () => {
    if (!hasImage) return;
    if (cardRef.current) setCardRect(cardRef.current.getBoundingClientRect());
    setLightboxOpen(true);
  };

  return (
    <aside className="w-52 shrink-0 flex flex-col bg-surface-panel border-l border-border-subtle shadow-panel p-3 gap-4 overflow-y-auto">

      {/* 1. Mission card */}
      <div>
        <p className="text-xs text-text-muted uppercase tracking-wide mb-2">Mission</p>
        <div
          ref={cardRef}
          onClick={openLightbox}
          className={`w-full aspect-[2/3] rounded-panel overflow-hidden border border-dashed
            border-border-subtle flex items-center justify-center text-center
            ${hasImage ? 'cursor-pointer hover:opacity-90 active:opacity-75 transition-opacity' : ''}`}
        >
          {hasImage
            ? <img src={imgSrc} alt={primaryMission}
                onError={() => setImgFailed(true)}
                className="w-full h-full object-cover" />
            : <span className="text-xs text-text-muted p-2 leading-snug">
                {primaryMission ?? 'Mission card image will appear here'}
              </span>
          }
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (() => {
        const dx = cardRect
          ? Math.round(cardRect.left + cardRect.width / 2 - window.innerWidth / 2)
          : 0;
        const dy = cardRect
          ? Math.round(cardRect.top + cardRect.height / 2 - window.innerHeight / 2)
          : 0;
        const scale = cardRect ? (cardRect.width / (window.innerHeight * 2 / 3)).toFixed(3) : '0.18';
        return (
          <>
            <style>{`
              @keyframes cardPopOut {
                from { transform: translate(${dx}px, ${dy}px) scale(${scale}); opacity: 0.6; }
                to   { transform: translate(0, 0) scale(1); opacity: 1; }
              }
            `}</style>
            <div
              className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-8 py-12"
              onClick={() => setLightboxOpen(false)}
            >
              <img
                src={imgSrc}
                alt={primaryMission}
                className="max-h-full max-w-full object-contain rounded-2xl shadow-raised"
                style={{ animation: 'cardPopOut 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
              />
            </div>
          </>
        );
      })()}

      {/* 2. Objectives — standard 40k layout */}
      <div>
        <p className="text-xs text-text-muted uppercase tracking-wide mb-3">Objectives</p>
        {/*
          Row 1: O1 (left)  ·  O2 (right)
          Row 2:    ·  O3 (centre)  ·
          Row 3: O4 (left)  ·  O5 (right)
        */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between px-1">
            <ObjectiveCircle obj={objectives[0]} />
            <ObjectiveCircle obj={objectives[1]} />
          </div>
          <div className="flex justify-center">
            <ObjectiveCircle obj={objectives[2]} />
          </div>
          <div className="flex justify-between px-1">
            <ObjectiveCircle obj={objectives[3]} />
            <ObjectiveCircle obj={objectives[4]} />
          </div>
        </div>
      </div>

      {/* Spacer pushes VP totals to the bottom */}
      <div className="flex-1" />

      {/* 3. Victory Points */}
      <div className="border-t border-border-subtle pt-3 flex flex-col gap-2">
        <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Victory Points</p>
        <div className="flex justify-between items-center">
          <span className={`font-display text-sm font-semibold truncate mr-2 ${p1Color}`}>{p1.name}</span>
          <span className="font-display text-lg font-bold text-text-primary">{p1.vp.total}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`font-display text-sm font-semibold truncate mr-2 ${p2Color}`}>{p2.name}</span>
          <span className="font-display text-lg font-bold text-text-primary">{p2.vp.total}</span>
        </div>
      </div>
    </aside>
  );
}
