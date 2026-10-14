import React from 'react';
import { Volume2, VolumeX, HelpCircle, RotateCcw, ExternalLink } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HeaderProps {
  onOpenHowToPlay: () => void;
  onResetGame: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  inGame: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHowToPlay,
  onResetGame,
  soundEnabled,
  onToggleSound,
  inGame,
}) => {
  return (
    <header className="w-full max-w-4xl mx-auto border-b border-stone-200 dark:border-stone-800 px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
      {/* Zone 1: Brand title wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onResetGame}
          className="text-left group cursor-pointer focus:outline-none"
          title="Return to target selection"
        >
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-stone-900 dark:text-stone-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Paper Word Ladder
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
              4-Letter
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 hidden sm:block">
            One letter at a time · Oxford English dictionary
          </p>
        </button>
      </div>

      {/* Zone 2: Navigation & GitHub Project */}
      <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-stone-600 dark:text-stone-400">
        <a
          href="https://github.com/prabhakar267/GoogleStudioExplorer"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1.5 transition-colors whitespace-nowrap"
          title="GoogleStudioExplorer repository"
        >
          <span>GoogleStudioExplorer</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
        </a>
        <button
          onClick={onOpenHowToPlay}
          className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Rules</span>
        </button>
      </nav>

      {/* Zone 3: Primary action & controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleSound}
          className="p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
          title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 opacity-60" />}
        </button>

        <button
          onClick={onOpenHowToPlay}
          className="md:hidden p-2 rounded-lg text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          aria-label="How to play"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {inGame && (
          <button
            onClick={onResetGame}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 transition-all cursor-pointer whitespace-nowrap shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Change Target</span>
            <span className="sm:hidden">Reset</span>
          </button>
        )}
      </div>
    </header>
  );
};
