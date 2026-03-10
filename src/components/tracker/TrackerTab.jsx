import { useEffect, useRef, useState } from 'react';
import { Lock, X } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { SECONDARY_MISSION_IMAGES } from '../../data/missionImages';

const ROLE_ACCENT = {
  attacker: {
    border:  'border-l-4 border-danger',
    bg:      'bg-danger-muted/20',
    text:    'text-danger',
  },
  defender: {
    border:  'border-l-4 border-success',
    bg:      'bg-success-muted/20',
    text:    'text-success',
  },
};

const VP_COLUMNS = [
  { key: 'primary', label: 'Primary',     longLabel: 'Primary'     },
  { key: 'sec1',    label: 'Sec 1',       longLabel: 'Secondary 1' },
  { key: 'sec2',    label: 'Sec 2',       longLabel: 'Secondary 2' },
];

function VPCell({ playerNum, round, column, value, isCurrentRound, showControls }) {
  const adjustVP = useGameStore((s) => s.adjustVP);

  if (!isCurrentRound) {
    return (
      <span className={`font-display font-medium ${value > 0 ? 'text-text-primary' : 'text-text-muted'}`}>
        {value > 0 ? value : '—'}
      </span>
    );
  }

  if (!showControls) {
    return <span className="font-display font-medium text-text-primary tabular-nums">{value}</span>;
  }

  return (
    <div className="flex items-center justify-center gap-0.5">
      <button
        onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); adjustVP(playerNum, round, column, -1); }}
        disabled={value === 0}
        className="w-8 h-8 rounded-chip bg-surface-inset border border-border-subtle hover:border-border-strong
          disabled:opacity-25 disabled:cursor-not-allowed text-text-primary font-bold flex items-center justify-center
          transition-colors shrink-0 text-sm leading-none"
        aria-label={`Decrease ${column} VP round ${round}`}
      >
        −
      </button>
      <span className="w-6 text-center tabular-nums text-text-primary font-display font-medium text-sm">{value}</span>
      <button
        onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); adjustVP(playerNum, round, column, +1); }}
        className="w-8 h-8 rounded-chip bg-surface-inset border border-border-subtle hover:border-border-strong
          text-text-primary font-bold flex items-center justify-center transition-colors shrink-0 text-sm leading-none"
        aria-label={`Increase ${column} VP round ${round}`}
      >
        +
      </button>
    </div>
  );
}

function VPTable({ playerNum, showControls, currentRound }) {
  const byRound = useGameStore((s) => s.players[playerNum].vp.byRound);

  return (
    <table className="w-full border-collapse bg-surface-raised rounded-panel shadow-panel text-sm">
      <thead>
        <tr className="bg-surface-inset border-b border-border-subtle">
          <th className="text-left pb-1 pt-1 pl-2 font-normal text-text-muted whitespace-nowrap pr-2 w-px uppercase tracking-wider text-xs" />
          {VP_COLUMNS.map((c) => (
            <th key={c.key} className="px-3 pb-1 pt-1 font-normal text-text-secondary text-center text-xs uppercase tracking-wider">
              {showControls ? c.longLabel : c.label}
            </th>
          ))}
          <th className="px-3 pb-1 pt-1 font-normal text-center">
            <span className="flex items-center justify-center gap-0.5 text-text-muted text-xs uppercase tracking-wider">
              <Lock size={9} />{showControls ? 'Challenger' : 'Chall'}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        {[1, 2, 3, 4, 5].map((r) => {
          const isCurrentRound = r === currentRound;
          const isFutureRound  = r > currentRound;
          const isPastRound    = r < currentRound;
          const rowData        = byRound[r - 1];
          return (
            <tr
              key={r}
              className={`border-b border-border-subtle last:border-0
                ${isCurrentRound ? 'bg-accent-muted' : isPastRound ? 'bg-surface-base' : 'bg-surface-raised'}`}
            >
              <td className={`whitespace-nowrap pr-2 pl-2 font-display font-semibold
                ${isCurrentRound ? 'py-1.5 text-text-primary' : 'py-1 text-text-muted'}`}>
                Round {r}
              </td>
              {VP_COLUMNS.map((c) => (
                <td key={c.key} className="py-1 text-center px-3">
                  {isFutureRound ? (
                    <span className="text-text-muted">—</span>
                  ) : (
                    <VPCell
                      playerNum={playerNum}
                      round={r}
                      column={c.key}
                      value={rowData[c.key]}
                      isCurrentRound={isCurrentRound}
                      showControls={showControls}
                    />
                  )}
                </td>
              ))}
              <td className={`text-center bg-surface-inset px-3 ${isCurrentRound ? 'py-1.5' : 'py-1'}`}>
                <span className="text-text-muted">—</span>
              </td>
            </tr>
          );
        })}
        {/* Total row */}
        <tr className="border-t border-border-strong">
          <td className="pl-2 py-1.5 font-display font-bold text-text-primary text-xs uppercase tracking-wide">Total</td>
          {VP_COLUMNS.map((c) => {
            const total = byRound.reduce((sum, r) => sum + (r[c.key] || 0), 0);
            return (
              <td key={c.key} className="py-1.5 text-center font-display font-bold text-accent px-3">
                {total}
              </td>
            );
          })}
          <td className="py-1.5 text-center font-display font-bold text-text-muted bg-surface-inset px-3">—</td>
        </tr>
      </tbody>
    </table>
  );
}

function MiniVPTable({ playerNum, currentRound }) {
  const byRound = useGameStore((s) => s.players[playerNum].vp.byRound);
  return (
    <table className="w-full border-collapse text-xs bg-surface-raised rounded-panel shadow-panel">
      <thead>
        <tr className="bg-surface-inset border-b border-border-subtle">
          <th className="text-left px-1.5 py-1 font-normal text-text-muted w-px" />
          <th className="px-1.5 py-1 font-normal text-text-secondary text-center uppercase tracking-wider">VP</th>
        </tr>
      </thead>
      <tbody>
        {[1, 2, 3, 4, 5].map((r) => {
          const rowData = byRound[r - 1];
          const total   = (rowData.primary || 0) + (rowData.sec1 || 0) + (rowData.sec2 || 0);
          const isFuture  = r > currentRound;
          const isCurrent = r === currentRound;
          return (
            <tr key={r} className={`border-b border-border-subtle last:border-0
              ${isCurrent ? 'bg-accent-muted' : r < currentRound ? 'bg-surface-base' : 'bg-surface-raised'}`}>
              <td className={`px-1.5 py-1 font-display font-semibold whitespace-nowrap
                ${isCurrent ? 'text-text-primary' : 'text-text-muted'}`}>R{r}</td>
              <td className="px-1.5 py-1 text-center font-display font-medium tabular-nums">
                {isFuture
                  ? <span className="text-text-muted">—</span>
                  : <span className="text-text-primary">{total}</span>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// Draw modal — no backdrop-click-to-close per spec
function DrawModal({ deck, onSelect, onCancel }) {
  const sorted = [...deck].sort();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-surface-raised border border-border-subtle rounded-panel shadow-raised w-80 max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle shrink-0">
          <span className="text-sm font-semibold text-text-primary">Draw Secondary Card</span>
          <button
            onClick={onCancel}
            className="w-12 h-12 flex items-center justify-center rounded-panel text-chrome
              hover:text-chrome-hover hover:bg-surface-inset transition-colors"
            aria-label="Cancel"
          >
            <X size={16} />
          </button>
        </div>
        {sorted.length === 0 ? (
          <p className="text-xs text-text-muted p-4 text-center">Deck is empty.</p>
        ) : (
          <ul className="overflow-y-auto flex-1">
            {sorted.map((card) => (
              <li key={card}>
                <button
                  onClick={() => onSelect(card)}
                  className="w-full text-left px-4 h-12 text-sm text-text-primary hover:bg-surface-inset
                    transition-colors border-b border-border-subtle last:border-0
                    flex items-center"
                >
                  {card}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// A single secondary card slot — empty shows Draw button, filled shows image + Discard
function SecondaryCardSlot({ cardName, onDraw, onDiscard }) {
  const [imgError, setImgError] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [cardRect, setCardRect] = useState(null);
  const imgRef = useRef(null);

  const imgSrc = cardName ? SECONDARY_MISSION_IMAGES[cardName] : null;
  const hasImage = imgSrc && !imgError;

  const openLightbox = (e) => {
    e.stopPropagation();
    if (imgRef.current) setCardRect(imgRef.current.getBoundingClientRect());
    setLightboxOpen(true);
  };

  if (!cardName) {
    return (
      <div className="w-fit rounded-panel border border-dashed border-border-subtle p-1.5">
        <button
          onClick={(e) => { e.stopPropagation(); onDraw(); }}
          className="w-40 min-h-[48px] flex items-center justify-center text-xs text-text-muted
            hover:text-text-primary hover:bg-surface-inset transition-colors rounded-panel"
        >
          Draw
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="w-fit flex flex-col items-center gap-1 rounded-panel border border-border-subtle
        bg-surface-panel p-1.5">
        {hasImage ? (
          <img
            ref={imgRef}
            src={imgSrc}
            alt={cardName}
            onError={() => setImgError(true)}
            onClick={openLightbox}
            className="w-40 aspect-[7/10] object-cover rounded-chip shrink-0 cursor-pointer
              hover:opacity-90 active:opacity-75 transition-opacity"
          />
        ) : (
          <div className="w-40 aspect-[7/10] flex items-center justify-center rounded-chip bg-surface-inset
            text-xs text-text-muted text-center p-1 leading-tight shrink-0">
            {cardName}
          </div>
        )}
        <span className="text-xs text-text-secondary text-center leading-tight px-0.5 truncate w-full">
          {cardName}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); onDiscard(); }}
          className="w-full min-h-[48px] rounded-panel bg-surface-inset border border-border-subtle
            hover:border-border-strong text-xs text-text-muted hover:text-text-primary transition-colors mt-auto"
        >
          Discard
        </button>
      </div>

      {lightboxOpen && hasImage && (() => {
        const dx = cardRect
          ? Math.round(cardRect.left + cardRect.width / 2 - window.innerWidth / 2) : 0;
        const dy = cardRect
          ? Math.round(cardRect.top + cardRect.height / 2 - window.innerHeight / 2) : 0;
        const scale = cardRect
          ? (cardRect.height / window.innerHeight).toFixed(3) : '0.12';
        return (
          <>
            <style>{`
              @keyframes secCardPopOut {
                from { transform: translate(${dx}px, ${dy}px) scale(${scale}); opacity: 0.6; }
                to   { transform: translate(0, 0) scale(1); opacity: 1; }
              }
            `}</style>
            <div
              className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-8"
              onClick={() => setLightboxOpen(false)}
            >
              <img
                src={imgSrc}
                alt={cardName}
                className="max-h-full max-w-full object-contain rounded-2xl shadow-raised"
                style={{ animation: 'secCardPopOut 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
              />
            </div>
          </>
        );
      })()}
    </>
  );
}

function PlayerTrackerPanel({ playerNum, isAttacker, isActive, isExpanded, onExpand, onCollapse, onActiveClick }) {
  const player      = useGameStore((s) => s.players[playerNum]);
  const round       = useGameStore((s) => s.round);
  const adjustCP    = useGameStore((s) => s.adjustCP);
  const hand        = useGameStore((s) => s.hand[`p${playerNum}`]);
  const drawCard    = useGameStore((s) => s.drawCard);
  const discardCard = useGameStore((s) => s.discardCard);
  const accent      = ROLE_ACCENT[isAttacker ? 'attacker' : 'defender'];
  const showControls        = isActive || isExpanded;
  const isCollapsedInactive = !isActive && !isExpanded;

  const [drawModal, setDrawModal] = useState(null); // null | { slot: 0|1 }

  return (
    <>
      {drawModal !== null && (
        <DrawModal
          deck={player.secondaryDeck}
          onSelect={(cardName) => { drawCard(playerNum, drawModal.slot, cardName); setDrawModal(null); }}
          onCancel={() => setDrawModal(null)}
        />
      )}

      <div
        className={`relative h-full w-full flex flex-col overflow-hidden select-none bg-surface-panel
          ${isActive ? `${accent.border} ${accent.bg}` : 'border-l border-border-subtle'}
          ${isCollapsedInactive ? 'cursor-pointer' : ''}`}
        onClick={isCollapsedInactive ? onExpand : (isActive && onActiveClick ? onActiveClick : undefined)}
      >
        {/* Collapse button — expanded inactive only */}
        {isExpanded && (
          <button
            onClick={(e) => { e.stopPropagation(); onCollapse(); }}
            className="absolute top-2 right-2 z-10 w-12 h-12 flex items-center justify-center
              rounded-panel text-text-muted hover:text-text-primary hover:bg-surface-inset transition-colors"
            title="Collapse"
          >
            <X size={18} />
          </button>
        )}

        {/* Player name strip */}
        <div className={`px-3 py-2 border-b border-border-subtle shrink-0 ${accent.text}`}>
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-semibold truncate">{player.name}</span>
            {isActive && <span className="text-xs font-normal opacity-60 shrink-0">active</span>}
          </div>
          {(player.faction || player.detachment) && (
            <div className="text-xs text-text-muted mt-0.5 truncate">
              {[player.faction, player.detachment].filter(Boolean).join(' · ')}
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto min-h-0 p-3 flex flex-col gap-4">

          {/* CP section */}
          <div className="flex items-baseline gap-3">
            <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider shrink-0">CP</span>
            <span className="font-display text-4xl font-bold text-text-primary tabular-nums w-10">{player.cp}</span>
            {showControls && (
              <div className="flex gap-2 ml-1">
                <button
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); adjustCP(playerNum, -1); }}
                  disabled={player.cp === 0}
                  className="w-12 h-12 rounded-panel bg-surface-inset border border-border-subtle
                    hover:bg-surface-panel hover:border-border-strong disabled:opacity-25
                    disabled:cursor-not-allowed text-xl font-bold text-text-primary flex items-center
                    justify-center transition-colors shrink-0"
                  aria-label="Spend CP"
                >
                  −
                </button>
                <button
                  onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); adjustCP(playerNum, +1); }}
                  className="w-12 h-12 rounded-panel bg-surface-inset border border-border-subtle
                    hover:bg-surface-panel hover:border-border-strong text-xl font-bold
                    text-text-primary flex items-center justify-center transition-colors shrink-0"
                  aria-label="Gain CP"
                >
                  +
                </button>
              </div>
            )}
          </div>

          {/* VP total */}
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-text-secondary uppercase tracking-wider">VP</span>
            <span className="font-display text-4xl font-bold text-text-primary tabular-nums">{player.vp.total}</span>
            <span className="text-xs text-text-muted tabular-nums">
              {player.vp.primary}p / {player.vp.secondary}s
            </span>
          </div>

          {/* VP table */}
          {isCollapsedInactive
            ? <MiniVPTable playerNum={playerNum} currentRound={round} />
            : <VPTable playerNum={playerNum} showControls={showControls} currentRound={round} />}

          {/* Secondary Cards — hidden when collapsed to 10% strip */}
          {!isCollapsedInactive && <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between shrink-0">
              <span className="text-xs text-text-muted uppercase tracking-wide">Secondary</span>
              <span className="text-xs text-text-muted">{player.secondaryDeck.length} left</span>
            </div>
            <div className="flex gap-2">
              {[0, 1].map((slot) => (
                <SecondaryCardSlot
                  key={slot}
                  cardName={hand[slot]}
                  onDraw={() => setDrawModal({ slot })}
                  onDiscard={() => discardCard(playerNum, slot)}
                />
              ))}
            </div>
          </div>}

        </div>
      </div>
    </>
  );
}

export function TrackerTab({ attackerNum, firstPlayerNum, secondPlayerNum }) {
  const activePlayer = useGameStore((s) => s.activePlayer);
  const [expandedInactive, setExpandedInactive] = useState(false);

  // Reset expanded state when the active player changes (turn advances)
  useEffect(() => { setExpandedInactive(false); }, [activePlayer]);

  const leftIsActive    = activePlayer === firstPlayerNum;
  const leftIsExpanded  = expandedInactive && !leftIsActive;
  const rightIsExpanded = expandedInactive && leftIsActive;

  // Active = 90%, expanded inactive = 60%, collapsed inactive = 10%
  const leftFlex  = leftIsActive   ? 'flex-[9]' : leftIsExpanded  ? 'flex-[6]' : 'flex-[1]';
  const rightFlex = !leftIsActive  ? 'flex-[9]' : rightIsExpanded ? 'flex-[6]' : 'flex-[1]';

  return (
    <div className="h-full flex overflow-hidden">
      {/* Left: player who goes first */}
      <div className={`flex overflow-hidden transition-[flex] duration-200 ${leftFlex}`}>
        <PlayerTrackerPanel
          playerNum={firstPlayerNum}
          isAttacker={firstPlayerNum === attackerNum}
          isActive={leftIsActive}
          isExpanded={leftIsExpanded}
          onExpand={() => setExpandedInactive(true)}
          onCollapse={() => setExpandedInactive(false)}
          onActiveClick={expandedInactive ? () => setExpandedInactive(false) : undefined}
        />
      </div>

      {/* Right: player who goes second */}
      <div className={`flex overflow-hidden transition-[flex] duration-200 ${rightFlex}`}>
        <PlayerTrackerPanel
          playerNum={secondPlayerNum}
          isAttacker={secondPlayerNum === attackerNum}
          isActive={!leftIsActive}
          isExpanded={rightIsExpanded}
          onExpand={() => setExpandedInactive(true)}
          onCollapse={() => setExpandedInactive(false)}
          onActiveClick={expandedInactive ? () => setExpandedInactive(false) : undefined}
        />
      </div>
    </div>
  );
}
