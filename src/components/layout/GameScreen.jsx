import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Header } from './Header';
import { TabBar } from './TabBar';
import { ObjectivesSidebar } from '../objectives/ObjectivesSidebar';
import { TrackerTab } from '../tracker/TrackerTab';
import { PhasesTab } from '../phases/PhasesTab';
import { FactionsTab } from '../factions/FactionsTab';

export function GameScreen() {
  const resetGame = useGameStore((s) => s.resetGame);
  const gameOver  = useGameStore((s) => s.gameOver);
  const p1Role      = useGameStore((s) => s.players[1].role);
  const firstPlayer = useGameStore((s) => s.firstPlayer);

  const attackerNum   = p1Role === 'attacker' ? 1 : 2;
  const defenderNum   = attackerNum === 1 ? 2 : 1;
  const firstPlayerNum  = firstPlayer;
  const secondPlayerNum = firstPlayer === 1 ? 2 : 1;

  const [activeTab, setActiveTab] = useState('tracker');

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-surface-base text-text-primary">
      <Header onReset={resetGame} />

      {gameOver && (
        <div className="px-4 py-1.5 bg-danger-muted border-b border-danger/30 text-center
          text-xs text-danger tracking-wide shrink-0 font-medium">
          Battle ended — Round 5 complete
        </div>
      )}

      <div className="flex-1 flex overflow-hidden min-h-0">

        {/* Main content area + tab bar */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">

          {/* Tab content */}
          <div className="flex-1 overflow-hidden min-h-0">
            {activeTab === 'tracker' && (
              <TrackerTab
                attackerNum={attackerNum}
                firstPlayerNum={firstPlayerNum}
                secondPlayerNum={secondPlayerNum} />
            )}
            {activeTab === 'phases' && (
              <PhasesTab
                attackerNum={attackerNum}
                defenderNum={defenderNum}
                firstPlayerNum={firstPlayerNum}
                secondPlayerNum={secondPlayerNum} />
            )}
            {activeTab === 'factions' && (
              <FactionsTab attackerNum={attackerNum} firstPlayerNum={firstPlayerNum} />
            )}
          </div>

          <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <ObjectivesSidebar />
      </div>
    </div>
  );
}
