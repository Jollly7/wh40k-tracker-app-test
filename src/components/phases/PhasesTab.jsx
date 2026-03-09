import { Check, Circle, Loader } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { PHASES } from '../../data/phases';

// Shortened names for the compact progress indicator
const PHASE_SHORT = ['Command', 'Movement', 'Shooting', 'Charge', 'Fight'];

function getCellIcon(state, isAttacker) {
  if (state === 'done')   return <Check  size={16} className="text-success" />;
  if (state === 'active') return <Loader size={16} className={`animate-spin ${isAttacker ? 'text-danger' : 'text-success'}`} />;
  return <Circle size={16} className="text-text-muted" />;
}

export function PhasesTab({ attackerNum, defenderNum, firstPlayerNum, secondPlayerNum }) {
  const currentPhase = useGameStore((s) => s.currentPhase);
  const round        = useGameStore((s) => s.round);
  const activePlayer = useGameStore((s) => s.activePlayer);
  const firstPlayer  = useGameStore((s) => s.players[firstPlayerNum]);
  const secondPlayer = useGameStore((s) => s.players[secondPlayerNum]);

  const phase = PHASES[currentPhase];

  const firstIsAttacker = firstPlayerNum === attackerNum;

  // Compute cell state for the round progress table.
  // Turn order within a round: first player → second player.
  function cellState(rowRound, isFirstPlayerCell) {
    if (rowRound < round) return 'done'; // entire round complete
    if (rowRound > round) return 'pending';
    // current round
    const firstGoingNow = activePlayer === firstPlayerNum;
    if (isFirstPlayerCell) return firstGoingNow ? 'active' : 'done';
    return firstGoingNow ? 'pending' : 'active';
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto p-6 gap-8 bg-surface-base">

      {/* Current phase detail */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="font-display text-3xl font-bold text-text-primary">{phase.name}</h2>
          <p className="text-text-secondary text-sm leading-relaxed mt-2">{phase.reminder}</p>
        </div>

        {/* 5-step progress indicator */}
        <div className="flex items-start">
          {PHASES.map((p, i) => (
            <div key={i} className={`flex items-center ${i < PHASES.length - 1 ? 'flex-1' : ''}`}>
              {/* Step: dot + label */}
              <div className="flex flex-col items-center gap-1">
                <div className={`w-3 h-3 rounded-full transition-colors ${
                  i < currentPhase  ? 'bg-success' :
                  i === currentPhase ? 'bg-accent ring-2 ring-accent/30 ring-offset-2 ring-offset-surface-base' :
                  'bg-border-subtle'
                }`} />
                <span className={`text-[9px] text-center leading-tight ${
                  i === currentPhase ? 'text-accent' : 'text-text-muted'
                }`} style={{ maxWidth: '48px' }}>
                  {PHASE_SHORT[i]}
                </span>
              </div>

              {/* Connector line (not after last) */}
              {i < PHASES.length - 1 && (
                <div className={`flex-1 h-px mb-4 ${i < currentPhase ? 'bg-success' : 'bg-border-subtle'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Round progress table */}
      <div className="border-t border-border-subtle pt-4">
        <h3 className="text-xs text-text-muted uppercase tracking-wide mb-3">Round Progress</h3>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border-subtle">
              <th className="text-left pb-2 pr-4 font-normal text-text-muted w-24" />
              <th className={`pb-2 px-6 font-normal text-center font-display ${firstIsAttacker ? 'text-danger' : 'text-success'}`}>{firstPlayer.name}</th>
              <th className={`pb-2 px-6 font-normal text-center font-display ${firstIsAttacker ? 'text-success' : 'text-danger'}`}>{secondPlayer.name}</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((r) => {
              const isCurrentRound = r === round;
              return (
                <tr key={r} className={`border-b border-border-subtle last:border-0
                  ${isCurrentRound ? 'bg-accent-muted border-l-4 border-l-accent' : ''}`}>
                  <td className={`py-2 pr-4 font-display font-semibold
                    ${isCurrentRound ? 'text-text-primary' : 'text-text-muted'}`}>
                    Round {r}
                  </td>
                  <td className="py-2 px-6">
                    <div className="flex justify-center">{getCellIcon(cellState(r, true),  firstIsAttacker)}</div>
                  </td>
                  <td className="py-2 px-6">
                    <div className="flex justify-center">{getCellIcon(cellState(r, false), !firstIsAttacker)}</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
