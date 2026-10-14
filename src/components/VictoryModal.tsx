import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { TargetWordConfig, COMMON_DEFINITIONS } from '../data/dictionary';
import { Trophy, Share2, RotateCcw, Check, Clock, Footprints } from 'lucide-react';
import { sounds } from '../utils/audio';

interface VictoryModalProps {
  target: TargetWordConfig;
  ladder: string[];
  parSteps: number;
  durationSeconds: number;
  onPlayAgain: () => void;
  onChangeTarget: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  target,
  ladder,
  parSteps,
  durationSeconds,
  onPlayAgain,
  onChangeTarget,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const stepsTaken = ladder.length - 1;

  useEffect(() => {
    // Confetti fanfare
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
    const timer = setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 350);

    return () => clearTimeout(timer);
  }, []);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const generateShareText = () => {
    const targetWord = target.word.toUpperCase();
    const startWord = ladder[0];
    const diff = stepsTaken - parSteps;

    let performanceLabel = 'Flawless Par ⭐';
    if (diff === 1) performanceLabel = 'Birdie (+1)';
    else if (diff > 1) performanceLabel = `+${diff} moves`;

    const grid = ladder
      .map((word) => {
        return word
          .split('')
          .map((char, i) => (char === targetWord[i] ? '🟩' : '⬜'))
          .join('');
      })
      .join('\n');

    return `Paper Word Ladder 📜\n${startWord} ➔ ${targetWord} ${target.emoji}\nSteps: ${stepsTaken} (Par: ${parSteps}) · ${performanceLabel}\n\n${grid}\n\nPlay at: https://github.com/prabhakar267/paper-games`;
  };

  const handleShare = async () => {
    sounds.playKey();
    const text = generateShareText();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Celebration Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-4xl shadow-inner mb-1">
            {target.emoji}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-100 tracking-tight">
            You Reached {target.word}!
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            {stepsTaken === parSteps
              ? 'Incredible! You matched the optimal minimum par!'
              : `Mission accomplished in ${stepsTaken} steps with unlimited attempts.`}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 py-1">
          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-center">
            <Footprints className="w-4 h-4 mx-auto text-emerald-600 dark:text-emerald-400 mb-1" />
            <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Steps
            </span>
            <span className="font-mono font-extrabold text-xl text-stone-900 dark:text-stone-100 tabular-nums">
              {stepsTaken}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-center">
            <Trophy className="w-4 h-4 mx-auto text-amber-500 mb-1" />
            <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Optimal Par
            </span>
            <span className="font-mono font-extrabold text-xl text-amber-600 dark:text-amber-400 tabular-nums">
              {parSteps}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-center">
            <Clock className="w-4 h-4 mx-auto text-sky-500 mb-1" />
            <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Time
            </span>
            <span className="font-mono font-extrabold text-xl text-stone-900 dark:text-stone-100 tabular-nums">
              {formatDuration(durationSeconds)}
            </span>
          </div>
        </div>

        {/* Word Ladder Journey Recap */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-400">
            <span>Your Word Path ({ladder.length} words)</span>
            <span>Oxford Accepted</span>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 p-3 rounded-xl bg-stone-50 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-800 text-xs">
            {ladder.map((w, idx) => (
              <div key={idx} className="flex items-center justify-between py-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-stone-400 w-5">#{idx}</span>
                  <span
                    className={`font-mono font-bold text-sm tracking-wider ${
                      idx === ladder.length - 1
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    {w}
                  </span>
                  {idx === ladder.length - 1 && <span>{target.emoji}</span>}
                </div>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 truncate max-w-[200px]">
                  {COMMON_DEFINITIONS[w] || 'Valid English word'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={handleShare}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Share Emoji Ladder Grid</span>
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onPlayAgain}
              className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Play Again</span>
            </button>

            <button
              onClick={onChangeTarget}
              className="py-2.5 px-3 rounded-xl font-semibold text-xs bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-200 dark:border-stone-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Choose Target</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
