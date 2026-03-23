import { BarChart2, List, Users, Swords, SlidersHorizontal } from 'lucide-react';

const TABS = [
  { id: 'tracker',  label: 'Tracker',  Icon: BarChart2 },
  { id: 'phases',   label: 'Phases',   Icon: List },
  { id: 'factions', label: 'Factions', Icon: Users },
  { id: 'army',     label: 'Army',     Icon: Swords },
];

export function TabBar({ activeTab, setActiveTab, onShowModeModal }) {
  return (
    <nav className="h-14 flex bg-surface-panel border-t border-border-subtle shrink-0">
      {TABS.map(({ id, label, Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onPointerDown={(e) => { e.preventDefault(); setActiveTab(id); }}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors
              ${isActive
                ? 'text-accent border-t-2 border-accent -mt-px'
                : 'text-chrome hover:text-chrome-hover'
              }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        );
      })}
      <button
        onPointerDown={(e) => { e.preventDefault(); onShowModeModal(); }}
        className="w-14 shrink-0 flex flex-col items-center justify-center gap-0.5 text-xs font-medium text-chrome hover:text-chrome-hover transition-colors"
        title="Switch device mode"
      >
        <SlidersHorizontal size={18} />
      </button>
    </nav>
  );
}
