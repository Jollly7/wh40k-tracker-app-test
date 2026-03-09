import { useGameStore } from './store/gameStore';
import { SetupScreen } from './components/layout/SetupScreen';
import { PreBattleScreen } from './components/layout/PreBattleScreen';
import { GameScreen } from './components/layout/GameScreen';

function App() {
  const gameStarted = useGameStore((s) => s.gameStarted);
  const battleBegun = useGameStore((s) => s.battleBegun);

  if (!gameStarted) return <SetupScreen />;
  if (!battleBegun) return <PreBattleScreen />;
  return <GameScreen />;
}

export default App;
