import React from 'react';
import { TargetWordConfig, COMMON_DEFINITIONS } from '../data/dictionary';
import { Flag, ArrowDown, RotateCcw } from 'lucide-react';

interface SolutionModalProps {
  target: TargetWordConfig;
  solution: string[];
  onPlayAgain: () => void;
  onClose: () => void;
}

export const SolutionModal: React.FC<SolutionModalProps> = ({
  target,
  solution,
  onPlayAgain,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 my-8">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 flex items-center justify-center">
              <Flag className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h2 className="font-extrabold text-stone-900 dark:text-stone-100 text-base">
                Word Ladder Solution
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Optimal shortest path ({solution.length - 1} steps)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 flex items-center justify-center cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            ✕
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2 p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800">
          {solution.map((word, i) => {
            const isTarget = i === solution.length - 1;
            const isStart = i === 0;

            return (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-mono text-xs ${
                    isTarget
                      ? 'bg-emerald-600 text-white font-bold'
                      : isStart
                      ? 'bg-stone-200 dark:bg-stone-800 font-bold text-stone-900 dark:text-stone-100'
                      : 'bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] opacity-70 font-sans">
                      {isStart ? 'Start' : isTarget ? 'Goal' : `Step ${i}`}
                    </span>
                    <span className="tracking-widest font-extrabold text-sm">{word}</span>
                    {isTarget && <span>{target.emoji}</span>}
                  </div>
                  <span className="text-[10px] opacity-80 truncate max-w-[150px] font-sans">
                    {COMMON_DEFINITIONS[word] || 'Oxford word'}
                  </span>
                </div>

                {i < solution.length - 1 && (
                  <ArrowDown className="w-3.5 h-3.5 text-stone-400 my-0.5" />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Another Puzzle</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
