import React, { useState, useEffect } from 'react';
import { TargetWordConfig, TARGET_WORDS } from './data/dictionary';
import { Header } from './components/Header';
import { TargetSelector } from './components/TargetSelector';
import { GameBoard } from './components/GameBoard';
import { VictoryModal } from './components/VictoryModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { SolutionModal } from './components/SolutionModal';
import { sounds } from './utils/audio';

type GameState = 'SELECTING_TARGET' | 'PLAYING' | 'WON';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('SELECTING_TARGET');
  const [selectedTarget, setSelectedTarget] = useState<TargetWordConfig>(TARGET_WORDS[0]);
  const [startWord, setStartWord] = useState<string>('POLE');
  const [parSteps, setParSteps] = useState<number>(3);
  const [winningLadder, setWinningLadder] = useState<string[]>([]);
  const [winningTime, setWinningTime] = useState<number>(0);
  const [solutionPath, setSolutionPath] = useState<string[] | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(sounds.enabled);

  // Check if first-time visitor to optionally show How to Play
  useEffect(() => {
    const hasSeenGuide = localStorage.getItem('paper_word_ladder_seen_guide');
    if (!hasSeenGuide) {
      setShowHowToPlay(true);
      localStorage.setItem('paper_word_ladder_seen_guide', 'true');
    }
  }, []);

  const handleToggleSound = () => {
    const newSoundState = sounds.toggleSound();
    setSoundEnabled(newSoundState);
  };

  const handleStartGame = (target: TargetWordConfig, start: string, par: number) => {
    setSelectedTarget(target);
    setStartWord(start);
    setParSteps(par);
    setGameState('PLAYING');
  };

  const handleWin = (history: string[], par: number, durationSeconds: number) => {
    setWinningLadder(history);
    setParSteps(par);
    setWinningTime(durationSeconds);
    setGameState('WON');
  };

  const handleGiveUp = (solution: string[]) => {
    setSolutionPath(solution);
  };

  const handleResetToTargetSelect = () => {
    sounds.playKey();
    setGameState('SELECTING_TARGET');
    setSolutionPath(null);
  };

  const handlePlayAgainSameTarget = () => {
    sounds.playKey();
    setGameState('PLAYING');
    setSolutionPath(null);
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top Bar Contract */}
      <Header
        onOpenHowToPlay={() => setShowHowToPlay(true)}
        onResetGame={handleResetToTargetSelect}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        inGame={gameState !== 'SELECTING_TARGET'}
      />

      {/* Main Game Surface */}
      <main className="flex-1 flex flex-col justify-center w-full">
        {gameState === 'SELECTING_TARGET' && (
          <TargetSelector
            onStartGame={handleStartGame}
            onOpenHowToPlay={() => setShowHowToPlay(true)}
          />
        )}

        {(gameState === 'PLAYING' || gameState === 'WON') && (
          <GameBoard
            target={selectedTarget}
            startWord={startWord}
            parSteps={parSteps}
            onWin={handleWin}
            onGiveUp={handleGiveUp}
            onOpenHowToPlay={() => setShowHowToPlay(true)}
          />
        )}
      </main>

      {/* Victory Celebration Modal */}
      {gameState === 'WON' && (
        <VictoryModal
          target={selectedTarget}
          ladder={winningLadder}
          parSteps={parSteps}
          durationSeconds={winningTime}
          onPlayAgain={handlePlayAgainSameTarget}
          onChangeTarget={handleResetToTargetSelect}
        />
      )}

      {/* How to Play Rules Modal */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}

      {/* Solution View Modal */}
      {solutionPath && (
        <SolutionModal
          target={selectedTarget}
          solution={solutionPath}
          onPlayAgain={handleResetToTargetSelect}
          onClose={() => setSolutionPath(null)}
        />
      )}

      {/* Quiet Footer */}
      <footer className="w-full border-t border-stone-200 dark:border-stone-800 py-3 sm:py-4 px-4 text-center text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Word Ladder puzzle game inspired by Wordle & Lewis Carroll · Oxford Dictionary accepted words
          </p>
          <p>
            Part of{' '}
            <a
              href="https://github.com/prabhakar267/GoogleStudioExplorer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-stone-700 dark:text-stone-300 font-semibold underline underline-offset-2 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              GoogleStudioExplorer
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
