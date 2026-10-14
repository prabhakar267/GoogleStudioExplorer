import React, { useState, useEffect, useRef } from 'react';
import { TargetWordConfig, COMMON_DEFINITIONS } from '../data/dictionary';
import {
  isValidDictionaryWord,
  compareWords,
  getWordDistance,
  getHint,
  HintInfo,
  findShortestPath,
} from '../utils/wordLadder';
import { VirtualKeyboard } from './VirtualKeyboard';
import {
  Undo2,
  Lightbulb,
  Flag,
  Target,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { sounds } from '../utils/audio';

interface GameBoardProps {
  target: TargetWordConfig;
  startWord: string;
  parSteps: number;
  onWin: (history: string[], par: number, durationSeconds: number) => void;
  onGiveUp: (solution: string[]) => void;
  onOpenHowToPlay: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  target,
  startWord,
  parSteps,
  onWin,
  onGiveUp,
  onOpenHowToPlay,
}) => {
  // Ladder history starts with startWord
  const [ladder, setLadder] = useState<string[]>([startWord.toUpperCase()]);
  const [currentInput, setCurrentInput] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'error' | 'info' | 'success'>('error');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [activeHint, setActiveHint] = useState<HintInfo | null>(null);
  const [showHintModal, setShowHintModal] = useState<boolean>(false);
  const [selectedWordDefinition, setSelectedWordDefinition] = useState<{ word: string; def: string } | null>(null);
  const [startTime] = useState<number>(Date.now());

  const ladderEndRef = useRef<HTMLDivElement>(null);

  const currentWord = ladder[ladder.length - 1];
  const targetWord = target.word.toUpperCase();

  // Scroll to latest row when ladder updates
  useEffect(() => {
    ladderEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [ladder]);

  // Toast auto-clear
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg: string, type: 'error' | 'info' | 'success' = 'error') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const triggerShake = () => {
    setIsShaking(true);
    sounds.playError();
    setTimeout(() => setIsShaking(false), 500);
  };

  // Keyboard character handler
  const handleChar = (char: string) => {
    if (currentInput.length < 4) {
      setCurrentInput((prev) => prev + char.toUpperCase());
    }
  };

  // Backspace handler
  const handleDelete = () => {
    setCurrentInput((prev) => prev.slice(0, -1));
  };

  // Submission validation
  const handleSubmit = () => {
    const guess = currentInput.toUpperCase().trim();

    if (guess.length !== 4) {
      showToast('Need exactly 4 letters');
      triggerShake();
      return;
    }

    if (guess === currentWord) {
      showToast('Cannot submit the same word again');
      triggerShake();
      return;
    }

    // Check 1 letter difference rule
    const { diffCount } = compareWords(currentWord, guess);
    if (diffCount !== 1) {
      if (diffCount === 0) {
        showToast('Must change 1 letter');
      } else {
        showToast(`Must change ONLY 1 letter (you changed ${diffCount})`);
      }
      triggerShake();
      return;
    }

    // Check Oxford dictionary validity
    if (!isValidDictionaryWord(guess)) {
      showToast(`'${guess}' is not in the Oxford word list`);
      triggerShake();
      return;
    }

    // Valid step!
    const newLadder = [...ladder, guess];
    setLadder(newLadder);
    setCurrentInput('');
    setActiveHint(null);

    // Check if won
    if (guess === targetWord) {
      sounds.playVictory();
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      onWin(newLadder, parSteps, elapsed);
    } else {
      sounds.playSuccessStep();
      showToast(`Accepted: ${guess}`, 'success');
    }
  };

  // Physical Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is in an input or modal
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (/^[a-zA-Z]$/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        handleChar(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentInput, currentWord, ladder]);

  // Undo step
  const handleUndo = () => {
    if (ladder.length > 1) {
      sounds.playDelete();
      setLadder((prev) => prev.slice(0, -1));
      setCurrentInput('');
      setActiveHint(null);
      showToast('Stepped back 1 move', 'info');
    }
  };

  // Request hint
  const handleRequestHint = () => {
    sounds.playKey();
    const hint = getHint(currentWord, targetWord);
    if (hint) {
      setActiveHint(hint);
      setShowHintModal(true);
    } else {
      showToast('No path found from current word. Try undoing a step!', 'info');
    }
  };

  // Give up & see solution
  const handleGiveUpClick = () => {
    const solution = findShortestPath(currentWord, targetWord) || findShortestPath(startWord, targetWord);
    if (solution) {
      onGiveUp(solution);
    } else {
      showToast('Unable to find path', 'error');
    }
  };

  // Word definition peek
  const handleWordClick = (word: string) => {
    const def =
      COMMON_DEFINITIONS[word] ||
      `An accepted 4-letter English word in Oxford/Scrabble dictionaries.`;
    setSelectedWordDefinition({ word, def });
  };

  // Current distance to goal
  const currentDistance = getWordDistance(currentWord, targetWord);

  // Compute differences for the current typed input
  const previewDiff = currentInput.length === 4 ? compareWords(currentWord, currentInput).diffCount : null;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-5 min-h-[calc(100vh-140px)] justify-between">
      {/* Top HUD: Goal & Status */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Goal Word Lockup */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-2xl border border-emerald-300 dark:border-emerald-800">
            {target.emoji}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Target Goal</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                Par: {parSteps}
              </span>
            </div>
            <div className="flex items-center gap-1 font-mono font-extrabold text-lg text-emerald-600 dark:text-emerald-400 tracking-wider">
              {targetWord}
            </div>
          </div>
        </div>

        {/* Meters: Moves & Distance */}
        <div className="flex items-center gap-4 text-xs">
          <div className="text-right">
            <span className="text-stone-400 block text-[10px] uppercase font-bold">Attempts</span>
            <span className="font-mono font-bold text-base text-stone-900 dark:text-stone-100 tabular-nums">
              {ladder.length - 1}
            </span>
          </div>

          <div className="text-right pl-3 border-l border-stone-200 dark:border-stone-800">
            <span className="text-stone-400 block text-[10px] uppercase font-bold">Distance</span>
            <span className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400 tabular-nums">
              {currentDistance > 0 ? `${currentDistance} left` : 'Goal!'}
            </span>
          </div>
        </div>

        {/* Controls: Undo & Hint & Give Up */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100 dark:border-stone-800">
          <button
            onClick={handleUndo}
            disabled={ladder.length <= 1}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Undo last step"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>

          <button
            onClick={handleRequestHint}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition-colors cursor-pointer"
            title="Get a hint"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Hint</span>
          </button>

          <button
            onClick={handleGiveUpClick}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Give up and view solution"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Solution</span>
          </button>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-18 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-lg transition-all animate-bounce flex items-center gap-2 ${
            toastType === 'error'
              ? 'bg-rose-600 text-white shadow-rose-600/30'
              : toastType === 'success'
              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
              : 'bg-stone-900 text-white shadow-stone-900/30 dark:bg-stone-100 dark:text-stone-900'
          }`}
        >
          {toastType === 'error' ? (
            <AlertCircle className="w-4 h-4" />
          ) : toastType === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Info className="w-4 h-4" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Center Play Area: Wordle Ladder */}
      <div className="flex-1 flex flex-col items-center justify-start overflow-y-auto max-h-[380px] sm:max-h-[440px] px-2 py-3 rounded-2xl bg-stone-50/80 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-800/80 space-y-2 shadow-inner">
        {/* Render each step in the ladder */}
        {ladder.map((word, index) => {
          const isStart = index === 0;
          const prevWord = index > 0 ? ladder[index - 1] : null;
          const { diffIndex } = prevWord ? compareWords(prevWord, word) : { diffIndex: -1 };

          return (
            <div
              key={`${word}-${index}`}
              className="flex items-center gap-2 sm:gap-3 group cursor-pointer"
              onClick={() => handleWordClick(word)}
              title="Click to view definition"
            >
              {/* Row Step Marker */}
              <div className="w-12 text-right">
                <span className="text-[10px] font-mono font-bold text-stone-400 uppercase">
                  {isStart ? 'Start' : `Step ${index}`}
                </span>
              </div>

              {/* 4 Letter Tiles */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {word.split('').map((char, charIndex) => {
                  const isMatchingTarget = char === targetWord[charIndex];
                  const isChangedChar = charIndex === diffIndex;

                  let tileClasses =
                    'w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-extrabold text-xl sm:text-2xl transition-all shadow-xs select-none ';

                  if (isMatchingTarget) {
                    // Wordle Green
                    tileClasses += 'bg-emerald-600 text-white border-2 border-emerald-700 ';
                  } else if (isChangedChar) {
                    // Changed letter highlight
                    tileClasses +=
                      'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border-2 border-amber-400 dark:border-amber-600 font-black ';
                  } else {
                    // Regular word tile
                    tileClasses +=
                      'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border-2 border-stone-300 dark:border-stone-700 ';
                  }

                  return (
                    <div key={charIndex} className={tileClasses}>
                      {char}
                    </div>
                  );
                })}
              </div>

              {/* Info Icon for definition peek */}
              <div className="w-6 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity">
                <Info className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}

        {/* Current Active Input Row */}
        <div className={`flex items-center gap-2 sm:gap-3 ${isShaking ? 'animate-shake' : ''}`}>
          <div className="w-12 text-right">
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase animate-pulse">
              Next ➔
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {[0, 1, 2, 3].map((charIndex) => {
              const char = currentInput[charIndex] || '';
              const isActiveSlot = charIndex === currentInput.length;
              const matchesTarget = char && char === targetWord[charIndex];

              let inputTileClasses =
                'w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-extrabold text-xl sm:text-2xl transition-all select-none ';

              if (char) {
                if (matchesTarget) {
                  inputTileClasses +=
                    'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border-2 border-emerald-500 shadow-xs';
                } else {
                  inputTileClasses +=
                    'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border-2 border-stone-800 dark:border-stone-200 shadow-xs';
                }
              } else if (isActiveSlot) {
                inputTileClasses +=
                  'bg-stone-100/80 dark:bg-stone-900/80 border-2 border-dashed border-emerald-500 animate-pulse text-stone-400';
              } else {
                inputTileClasses +=
                  'bg-stone-100/50 dark:bg-stone-900/50 border-2 border-stone-200 dark:border-stone-800 text-stone-400';
              }

              return (
                <div key={charIndex} className={inputTileClasses}>
                  {char}
                </div>
              );
            })}
          </div>

          <div className="w-6 text-xs text-stone-400">
            {previewDiff !== null && (
              <span
                className={`text-[10px] font-bold ${
                  previewDiff === 1 ? 'text-emerald-600' : 'text-rose-500'
                }`}
                title="Letters changed"
              >
                {previewDiff === 1 ? '1 Δ' : `${previewDiff} Δ`}
              </span>
            )}
          </div>
        </div>

        {/* Target Destination Marker (Pinned at bottom of ladder) */}
        <div className="flex items-center gap-2 sm:gap-3 pt-3 opacity-60 hover:opacity-100 transition-opacity">
          <div className="w-12 text-right">
            <span className="text-[10px] font-mono font-bold text-stone-400 uppercase">Goal</span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {targetWord.split('').map((char, charIndex) => (
              <div
                key={charIndex}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center font-bold text-xl sm:text-2xl border-2 border-dashed border-emerald-400 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20"
              >
                {char}
              </div>
            ))}
          </div>

          <div className="w-6 text-lg">{target.emoji}</div>
        </div>

        <div ref={ladderEndRef} />
      </div>

      {/* Live Input Assistant / Hint Bar */}
      <div className="flex items-center justify-between px-2 text-xs text-stone-500 dark:text-stone-400">
        <div>
          <span>Change 1 letter from: </span>
          <strong className="font-mono text-stone-800 dark:text-stone-200">{currentWord}</strong>
        </div>
        <div>
          <button
            onClick={onOpenHowToPlay}
            className="hover:underline flex items-center gap-1 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Rules</span>
          </button>
        </div>
      </div>

      {/* On-Screen Virtual Keyboard */}
      <VirtualKeyboard
        onChar={handleChar}
        onEnter={handleSubmit}
        onDelete={handleDelete}
        targetWord={targetWord}
        currentWord={currentWord}
      />

      {/* Word Definition Modal */}
      {selectedWordDefinition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-sm w-full p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-xl text-stone-900 dark:text-stone-100">
                  {selectedWordDefinition.word}
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Oxford Word
                </span>
              </div>
              <button
                onClick={() => setSelectedWordDefinition(null)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              {selectedWordDefinition.def}
            </p>
            <button
              onClick={() => setSelectedWordDefinition(null)}
              className="w-full py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Hint Modal */}
      {showHintModal && activeHint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-amber-200 dark:border-amber-800/60 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                  Pathfinder Hint
                </h3>
              </div>
              <button
                onClick={() => setShowHintModal(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm text-stone-600 dark:text-stone-300">
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <span>Shortest remaining distance:</span>
                <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-base tabular-nums">
                  {activeHint.remainingSteps} steps
                </strong>
              </div>

              <div className="space-y-1">
                <p className="font-medium text-stone-800 dark:text-stone-200">
                  Letter position recommendation:
                </p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Try changing letter #{activeHint.recommendedPosition + 1} (
                  <strong className="text-stone-800 dark:text-stone-200 font-mono">
                    {currentWord[activeHint.recommendedPosition]}
                  </strong>{' '}
                  ➔{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                    {activeHint.recommendedLetter}
                  </strong>
                  ).
                </p>
              </div>

              <div className="pt-2">
                <p className="text-xs text-stone-400 mb-1">Optimal next step preview:</p>
                <div className="flex items-center gap-2 font-mono font-bold text-lg text-stone-900 dark:text-stone-100">
                  <span>{currentWord}</span>
                  <span>➔</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {activeHint.nextWordSuggestion}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => {
                  setCurrentInput(activeHint.nextWordSuggestion);
                  setShowHintModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Fill Word & Continue
              </button>
              <button
                onClick={() => setShowHintModal(false)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
