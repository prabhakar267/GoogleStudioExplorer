import React from 'react';
import { BookOpen, Check, X, ArrowDown } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-stone-900 dark:text-stone-100 text-lg">
                How to Play
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Wordle-style Word Ladder Rules
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

        {/* Core Rules */}
        <div className="space-y-3 text-xs sm:text-sm text-stone-600 dark:text-stone-300">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <p>
              You start with a 4-letter word and must reach your chosen funny target word (e.g. <strong>POOP 💩</strong>).
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <p>
              At each step, you can change <strong>exactly ONE letter</strong> from your previous word.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <p>
              Every new word you create must be an accepted <strong>Oxford English dictionary word</strong>.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
              4
            </span>
            <p>
              You have <strong>unlimited attempts</strong>! Try to find the shortest path matching Par.
            </p>
          </div>
        </div>

        {/* Visual Walkthrough Example */}
        <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
            Example: POLE ➔ POOP 💩
          </span>

          {/* Valid Steps Example */}
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="font-bold tracking-widest text-stone-900 dark:text-stone-100">P O L E</span>
              <span className="text-stone-400 font-sans text-[11px]">Start Word</span>
            </div>

            <div className="flex justify-center text-stone-400">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-800">
              <span className="font-bold tracking-widest text-stone-900 dark:text-stone-100">
                P O L <strong className="text-amber-500">L</strong>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-sans text-[11px] flex items-center gap-1">
                <Check className="w-3 h-3" /> Changed E ➔ L (Valid!)
              </span>
            </div>

            <div className="flex justify-center text-stone-400">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-stone-900 border border-emerald-300 dark:border-emerald-800">
              <span className="font-bold tracking-widest text-stone-900 dark:text-stone-100">
                P O <strong className="text-amber-500">O</strong> L
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-sans text-[11px] flex items-center gap-1">
                <Check className="w-3 h-3" /> Changed L ➔ O (Valid!)
              </span>
            </div>

            <div className="flex justify-center text-stone-400">
              <ArrowDown className="w-3.5 h-3.5" />
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-600 text-white font-bold">
              <span className="tracking-widest">P O O P</span>
              <span className="font-sans text-[11px] flex items-center gap-1">
                Target Reached! 💩
              </span>
            </div>
          </div>

          {/* Invalid Move Demonstration */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-mono">
            <span>POLE ➔ BALL</span>
            <span className="font-sans text-[11px] flex items-center gap-1">
              <X className="w-3 h-3" /> 3 letters changed (Invalid!)
            </span>
          </div>
        </div>

        {/* Footer */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-bold text-xs hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors cursor-pointer"
        >
          Got It, Let’s Play!
        </button>
      </div>
    </div>
  );
};
