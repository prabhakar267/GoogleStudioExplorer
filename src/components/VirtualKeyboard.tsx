import React from 'react';
import { CornerDownLeft, Delete } from 'lucide-react';
import { sounds } from '../utils/audio';

interface VirtualKeyboardProps {
  onChar: (char: string) => void;
  onEnter: () => void;
  onDelete: () => void;
  targetWord: string;
  currentWord: string;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onChar,
  onEnter,
  onDelete,
  targetWord,
  currentWord,
}) => {
  const targetChars = new Set(targetWord.toUpperCase().split(''));
  const currentChars = new Set(currentWord.toUpperCase().split(''));

  const handleKeyClick = (key: string) => {
    if (key === 'ENTER') {
      sounds.playKey();
      onEnter();
    } else if (key === 'BACKSPACE') {
      sounds.playDelete();
      onDelete();
    } else {
      sounds.playKey();
      onChar(key);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-1.5 sm:gap-2 px-1 select-none">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center items-center gap-1 sm:gap-1.5 w-full">
          {row.map((key) => {
            const isEnter = key === 'ENTER';
            const isBackspace = key === 'BACKSPACE';
            const isTargetChar = targetChars.has(key);
            const isCurrentChar = currentChars.has(key);

            let keyStyle = 'bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 hover:bg-stone-300 dark:hover:bg-stone-700 active:bg-stone-400';
            
            if (isCurrentChar && isTargetChar) {
              keyStyle = 'bg-emerald-600 text-white hover:bg-emerald-500 font-bold';
            } else if (isTargetChar) {
              keyStyle = 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold';
            }

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleKeyClick(key)}
                className={`h-12 sm:h-14 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-xs ${
                  isEnter || isBackspace
                    ? 'flex-[1.5] text-xs sm:text-xs font-semibold px-2 bg-stone-300 dark:bg-stone-700 text-stone-900 dark:text-stone-100'
                    : `flex-1 ${keyStyle}`
                }`}
                aria-label={key}
              >
                {isEnter ? (
                  <span className="flex items-center gap-1 font-bold">
                    <span>ENTER</span>
                    <CornerDownLeft className="w-3.5 h-3.5" />
                  </span>
                ) : isBackspace ? (
                  <Delete className="w-5 h-5" />
                ) : (
                  key
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
