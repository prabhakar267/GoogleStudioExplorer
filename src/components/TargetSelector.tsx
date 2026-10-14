import React, { useState, useEffect, useMemo } from 'react';
import { TargetWordConfig, TARGET_WORDS } from '../data/dictionary';
import {
  findSolvableStartCandidates,
  getWordDistance,
  isValidDictionaryWord,
  findShortestPath,
} from '../utils/wordLadder';
import { Sparkles, Dices, ArrowRight, ShieldCheck, AlertCircle, HelpCircle } from 'lucide-react';
import { sounds } from '../utils/audio';

interface TargetSelectorProps {
  onStartGame: (target: TargetWordConfig, startWord: string, parSteps: number) => void;
  onOpenHowToPlay: () => void;
}

export const TargetSelector: React.FC<TargetSelectorProps> = ({
  onStartGame,
  onOpenHowToPlay,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<TargetWordConfig>(TARGET_WORDS[0]);
  const [startWord, setStartWord] = useState<string>('POLE');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customInput, setCustomInput] = useState<string>('');
  const [customError, setCustomError] = useState<string | null>(null);

  // Compute candidates for current target
  const candidates = useMemo(() => {
    const list = findSolvableStartCandidates(selectedTarget.word, 3, 5);
    return list.length > 0 ? list : [{ word: 'POLE', steps: 3 }];
  }, [selectedTarget]);

  // Pick a random starting word from candidates whenever target changes
  useEffect(() => {
    if (!isCustomMode) {
      // If POLE connects, prefer POLE for POOP if available as classic example
      const poleCandidate = candidates.find((c) => c.word === 'POLE');
      if (selectedTarget.word === 'POOP' && poleCandidate) {
        setStartWord('POLE');
      } else {
        const rand = candidates[Math.floor(Math.random() * candidates.length)];
        setStartWord(rand.word);
      }
    }
  }, [selectedTarget, candidates, isCustomMode]);

  // Calculate current distance / par
  const activeStartWord = isCustomMode ? customInput.trim().toUpperCase() : startWord;
  const currentPar = useMemo(() => {
    if (activeStartWord.length !== 4) return -1;
    return getWordDistance(activeStartWord, selectedTarget.word);
  }, [activeStartWord, selectedTarget.word]);

  const handleRerollStartWord = () => {
    sounds.playKey();
    if (candidates.length === 0) return;
    const available = candidates.filter((c) => c.word !== startWord);
    const pool = available.length > 0 ? available : candidates;
    const next = pool[Math.floor(Math.random() * pool.length)];
    setStartWord(next.word);
  };

  const handleSelectTarget = (target: TargetWordConfig) => {
    sounds.playKey();
    setSelectedTarget(target);
    setCustomError(null);
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
    setCustomInput(val);
    if (val.length === 4) {
      if (!isValidDictionaryWord(val)) {
        setCustomError('Not in Oxford word list');
      } else if (val === selectedTarget.word) {
        setCustomError('Cannot be identical to target word');
      } else {
        const path = findShortestPath(val, selectedTarget.word);
        if (!path) {
          setCustomError(`No word ladder path connects to ${selectedTarget.word}`);
        } else {
          setCustomError(null);
        }
      }
    } else {
      setCustomError(null);
    }
  };

  const handleStart = () => {
    if (isCustomMode) {
      if (customInput.length !== 4) {
        setCustomError('Please enter a 4-letter word');
        sounds.playError();
        return;
      }
      if (!isValidDictionaryWord(customInput)) {
        setCustomError('Not in Oxford word list');
        sounds.playError();
        return;
      }
      if (currentPar < 1) {
        setCustomError(`No connected path exists to ${selectedTarget.word}`);
        sounds.playError();
        return;
      }
      sounds.playSuccessStep();
      onStartGame(selectedTarget, customInput, currentPar);
    } else {
      sounds.playSuccessStep();
      onStartGame(selectedTarget, startWord, currentPar > 0 ? currentPar : 3);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 flex flex-col gap-8">
      {/* Introduction Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Lewis Carroll’s Word Ladder · Wordle Style</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight text-balance">
          Choose Your Funny Target Word
        </h1>
        <p className="text-stone-600 dark:text-stone-400 text-sm sm:text-base leading-relaxed text-balance">
          Morph from your starting word to your target by changing <strong>only one letter at a time</strong>.
          Every step must form an accepted Oxford dictionary word!
        </p>
      </div>

      {/* Target Word Selection Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Select One of Five Target Words
          </h2>
          <button
            onClick={onOpenHowToPlay}
            className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            See rules & example
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {TARGET_WORDS.map((target) => {
            const isSelected = selectedTarget.id === target.id;
            return (
              <button
                key={target.id}
                onClick={() => handleSelectTarget(target)}
                className={`group relative text-left p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-500 bg-white dark:bg-stone-900 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40 hover:border-stone-300 dark:hover:border-stone-700'
                }`}
              >
                {/* Badge */}
                <div className="flex items-center justify-between w-full mb-3">
                  <span className="text-3xl transform transition-transform group-hover:scale-110">
                    {target.emoji}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      target.difficulty === 'Easy'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : target.difficulty === 'Medium'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                        : 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                    }`}
                  >
                    {target.difficulty}
                  </span>
                </div>

                {/* Target Word Letters Tiles */}
                <div className="flex items-center gap-1 mb-2">
                  {target.word.split('').map((letter, i) => (
                    <span
                      key={i}
                      className={`w-7 h-8 flex items-center justify-center font-bold text-sm rounded ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200'
                      }`}
                    >
                      {letter}
                    </span>
                  ))}
                </div>

                {/* Name & Tagline */}
                <div>
                  <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {target.name}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mt-0.5">
                    {target.tagline}
                  </p>
                </div>

                {isSelected && (
                  <div className="mt-3 pt-2 border-t border-emerald-100 dark:border-emerald-950 flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Selected Target</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Starting Word Configuration Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>Your Starting Word</span>
              <span className="text-xs font-normal text-stone-500 dark:text-stone-400">
                (guaranteed path to {selectedTarget.word})
              </span>
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Start here, change 1 letter per move until you hit {selectedTarget.emoji} {selectedTarget.word}.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsCustomMode(!isCustomMode);
                setCustomError(null);
                if (!isCustomMode) {
                  setCustomInput(startWord);
                }
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
            >
              {isCustomMode ? 'Use Random Word' : 'Custom Start Word'}
            </button>

            {!isCustomMode && (
              <button
                onClick={handleRerollStartWord}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 border border-stone-300 dark:border-stone-700 transition-colors cursor-pointer"
                title="Roll a different starting word"
              >
                <Dices className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Reroll Word</span>
              </button>
            )}
          </div>
        </div>

        {/* Visual Route Preview */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 py-4 px-4 rounded-xl bg-stone-50 dark:bg-stone-950/50 border border-stone-200 dark:border-stone-800">
          {/* Start Tiles */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[11px] font-medium text-stone-400 uppercase tracking-wider">Start</span>
            {isCustomMode ? (
              <input
                type="text"
                value={customInput}
                onChange={handleCustomInputChange}
                maxLength={4}
                placeholder="POLE"
                className="w-36 text-center font-mono font-extrabold text-xl py-2 tracking-widest uppercase bg-white dark:bg-stone-900 border-2 border-emerald-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-stone-900 dark:text-stone-100"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-1.5">
                {startWord.split('').map((letter, i) => (
                  <span
                    key={i}
                    className="w-10 h-12 flex items-center justify-center font-extrabold text-lg rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-300 dark:border-stone-700 shadow-xs"
                  >
                    {letter}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Path Arrow & Par Info */}
          <div className="flex flex-col items-center gap-0.5 text-stone-400">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span className="text-xs font-bold tabular-nums">
                {currentPar > 0 ? `Par: ${currentPar} moves` : 'Testing path...'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </div>
            <span className="text-[10px] text-stone-400">1 letter change per step</span>
          </div>

          {/* Target Tiles */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 text-[11px] font-medium text-stone-400 uppercase tracking-wider">
              <span>Goal</span>
              <span>{selectedTarget.emoji}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {selectedTarget.word.split('').map((letter, i) => (
                <span
                  key={i}
                  className="w-10 h-12 flex items-center justify-center font-extrabold text-lg rounded-lg bg-emerald-600 text-white border border-emerald-700 shadow-xs"
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Input Error */}
        {customError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{customError}</span>
          </div>
        )}

        {/* Start Game Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-stone-500 dark:text-stone-400 text-center sm:text-left">
            <span>Selected Mission: </span>
            <strong className="text-stone-800 dark:text-stone-200">
              {activeStartWord || '????'} ➔ {selectedTarget.word} {selectedTarget.emoji}
            </strong>
            <span className="text-stone-400"> · Unlimited attempts allowed</span>
          </div>

          <button
            onClick={handleStart}
            disabled={isCustomMode && (customInput.length !== 4 || !!customError || currentPar < 1)}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Start Word Ladder</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
