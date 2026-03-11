import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { PRIMARY_MISSION_IMAGES, TWIST_IMAGES } from '../../data/missionImages';

export function ObjectivesSidebar() {
  const primaryMission = useGameStore((s) => s.primaryMission);
  const twist = useGameStore((s) => s.twist);
  const p1      = useGameStore((s) => s.players[1]);
  const p2      = useGameStore((s) => s.players[2]);
  const p1Color = p1.role === 'attacker' ? 'text-danger' : 'text-success';
  const p2Color = p2.role === 'attacker' ? 'text-danger' : 'text-success';

  // Primary mission card state
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

  // Twist card state
  const [twistImgFailed, setTwistImgFailed] = useState(false);
  const [twistLightboxOpen, setTwistLightboxOpen] = useState(false);
  const [twistCardRect, setTwistCardRect] = useState(null);
  const twistCardRef = useRef(null);
  useEffect(() => { setTwistImgFailed(false); setTwistLightboxOpen(false); }, [twist]);
  const twistImgSrc = twist ? TWIST_IMAGES[twist] : null;
  const hasTwistImage = twistImgSrc && !twistImgFailed;

  const openTwistLightbox = () => {
    if (!hasTwistImage) return;
    if (twistCardRef.current) setTwistCardRect(twistCardRef.current.getBoundingClientRect());
    setTwistLightboxOpen(true);
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

      {/* 2. Twist card */}
      <div>
        <p className="text-xs text-text-muted uppercase tracking-wide mb-2">Twist</p>
        <div
          ref={twistCardRef}
          onClick={openTwistLightbox}
          className={`w-full aspect-[2/3] rounded-panel overflow-hidden border border-dashed
            border-border-subtle flex items-center justify-center text-center
            ${hasTwistImage ? 'cursor-pointer hover:opacity-90 active:opacity-75 transition-opacity' : ''}`}
        >
          {hasTwistImage
            ? <img src={twistImgSrc} alt={twist}
                onError={() => setTwistImgFailed(true)}
                className="w-full h-full object-cover" />
            : <span className="text-xs text-text-muted p-2 leading-snug">
                {twist ?? 'No Twist'}
              </span>
          }
        </div>
      </div>

      {/* Twist lightbox */}
      {twistLightboxOpen && (() => {
        const dx = twistCardRect
          ? Math.round(twistCardRect.left + twistCardRect.width / 2 - window.innerWidth / 2)
          : 0;
        const dy = twistCardRect
          ? Math.round(twistCardRect.top + twistCardRect.height / 2 - window.innerHeight / 2)
          : 0;
        const scale = twistCardRect ? (twistCardRect.width / (window.innerHeight * 2 / 3)).toFixed(3) : '0.18';
        return (
          <>
            <style>{`
              @keyframes twistPopOut {
                from { transform: translate(${dx}px, ${dy}px) scale(${scale}); opacity: 0.6; }
                to   { transform: translate(0, 0) scale(1); opacity: 1; }
              }
            `}</style>
            <div
              className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-8 py-12"
              onClick={() => setTwistLightboxOpen(false)}
            >
              <img
                src={twistImgSrc}
                alt={twist}
                className="max-h-full max-w-full object-contain rounded-2xl shadow-raised"
                style={{ animation: 'twistPopOut 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
              />
            </div>
          </>
        );
      })()}

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
