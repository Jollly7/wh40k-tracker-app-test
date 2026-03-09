import { Plus } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

const PHASE_REMINDERS = [
  {
    phase: 'Command Phase',
    text: 'Remember faction-specific Command phase abilities and Aura effects. Check detachment rules that activate here. Battle-shock tests also happen in this phase.',
  },
  {
    phase: 'Movement Phase',
    text: 'Check unit movement values and special movement rules for your detachment. Note any abilities that trigger on Advance.',
  },
  {
    phase: 'Shooting Phase',
    text: 'Review faction Stratagems usable during the Shooting phase. Check any ranged ability triggers.',
  },
  {
    phase: 'Charge Phase',
    text: 'Check if any faction abilities trigger on successful or failed charges. Note Overwatch rules for your army.',
  },
  {
    phase: 'Fight Phase',
    text: 'Note faction Fight phase Stratagems and melee ability triggers. Check activation order rules.',
  },
];

function FactionColumn({ playerNum, isAttacker, isLeft }) {
  const player     = useGameStore((s) => s.players[playerNum]);
  const accentText = isAttacker ? 'text-danger' : 'text-success';
  const divider    = isLeft ? 'border-r border-border-subtle' : '';

  return (
    <div className={`flex-1 flex flex-col overflow-hidden bg-surface-base ${divider}`}>
      {/* Column header */}
      <div className="px-5 py-3 border-b border-border-subtle bg-surface-panel shrink-0">
        <div className={`font-display text-base font-bold ${accentText}`}>{player.name}</div>
        <div className="text-sm text-text-secondary mt-0.5">{player.faction ?? '—'}</div>
        {player.detachment && (
          <div className="text-xs text-text-muted mt-0.5">{player.detachment}</div>
        )}
      </div>

      {/* Scrollable reminders */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">

        {PHASE_REMINDERS.map(({ phase, text }) => (
          <div key={phase}>
            <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">{phase}</h3>
            <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
          </div>
        ))}

        {/* Pre-battle notes */}
        <div className="border-t border-border-subtle pt-4">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1">Pre-Battle Notes</h3>
          <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
            {player.preBattleNotes || 'No pre-battle notes recorded.'}
          </p>
        </div>

        {/* Add note stub */}
        <button className="flex items-center gap-2 px-3 py-3 rounded-panel border border-dashed border-border-subtle
          text-sm text-text-muted hover:text-text-secondary hover:border-border-strong transition-colors min-h-[48px]">
          <Plus size={14} />
          Add note
        </button>
      </div>
    </div>
  );
}

export function FactionsTab({ firstPlayerNum, attackerNum }) {
  const secondPlayerNum = firstPlayerNum === 1 ? 2 : 1;
  return (
    <div className="h-full flex overflow-hidden">
      <FactionColumn playerNum={firstPlayerNum} isAttacker={firstPlayerNum === attackerNum} isLeft />
      <FactionColumn playerNum={secondPlayerNum} isAttacker={secondPlayerNum === attackerNum} isLeft={false} />
    </div>
  );
}
