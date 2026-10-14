import { FOUR_LETTER_WORDS, TARGET_WORDS } from '../data/dictionary';

// Normalized set of all uppercase valid words
export const WORD_SET = new Set<string>(FOUR_LETTER_WORDS.map((w) => w.toUpperCase()));

// Make sure target words are in the word set
TARGET_WORDS.forEach((tw) => WORD_SET.add(tw.word.toUpperCase()));

// Pre-built pattern map for fast O(1) neighbor lookups
const patternMap = new Map<string, string[]>();

function initializePatternMap() {
  if (patternMap.size > 0) return;
  for (const word of WORD_SET) {
    for (let i = 0; i < 4; i++) {
      const pattern = word.slice(0, i) + '*' + word.slice(i + 1);
      const list = patternMap.get(pattern) || [];
      list.push(word);
      patternMap.set(pattern, list);
    }
  }
}

// Initialize immediately
initializePatternMap();

/**
 * Checks if a word is in the dictionary
 */
export function isValidDictionaryWord(word: string): boolean {
  if (!word || word.length !== 4) return false;
  return WORD_SET.has(word.toUpperCase());
}

/**
 * Returns the number of characters that differ between two 4-letter words
 * and the specific index that differs (or -1 if more or fewer than 1)
 */
export function compareWords(word1: string, word2: string): { diffCount: number; diffIndex: number } {
  const w1 = word1.toUpperCase();
  const w2 = word2.toUpperCase();
  let diffCount = 0;
  let diffIndex = -1;

  for (let i = 0; i < 4; i++) {
    if (w1[i] !== w2[i]) {
      diffCount++;
      diffIndex = i;
    }
  }

  return { diffCount, diffIndex };
}

/**
 * Returns all valid 1-letter mutation words for a given word
 */
export function getNeighbors(word: string): string[] {
  initializePatternMap();
  const upper = word.toUpperCase();
  const neighbors = new Set<string>();

  for (let i = 0; i < 4; i++) {
    const pattern = upper.slice(0, i) + '*' + upper.slice(i + 1);
    const matches = patternMap.get(pattern);
    if (matches) {
      for (const match of matches) {
        if (match !== upper) {
          neighbors.add(match);
        }
      }
    }
  }

  return Array.from(neighbors).sort();
}

/**
 * Breadth-First Search (BFS) to find the shortest path from startWord to targetWord
 * Returns an array of words: [startWord, ..., targetWord] or null if no path exists.
 */
export function findShortestPath(startWord: string, targetWord: string): string[] | null {
  const start = startWord.toUpperCase();
  const target = targetWord.toUpperCase();

  if (start === target) return [start];
  if (!WORD_SET.has(start) || !WORD_SET.has(target)) return null;

  initializePatternMap();

  const queue: string[] = [start];
  const visited = new Set<string>([start]);
  const parent = new Map<string, string>();

  let head = 0;
  while (head < queue.length) {
    const current = queue[head++];
    const neighbors = getNeighbors(current);

    for (const neighbor of neighbors) {
      if (neighbor === target) {
        // Build path backwards
        const path = [target];
        let curr = current;
        while (curr) {
          path.push(curr);
          curr = parent.get(curr) || '';
        }
        return path.reverse();
      }

      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }

  return null;
}

/**
 * Computes minimum step distance between two words (number of transitions, i.e. path length - 1)
 */
export function getWordDistance(startWord: string, targetWord: string): number {
  const path = findShortestPath(startWord, targetWord);
  if (!path) return -1;
  return path.length - 1;
}

/**
 * Finds good starting words guaranteed to connect to the target word within [minSteps, maxSteps]
 */
export function findSolvableStartCandidates(targetWord: string, minSteps = 3, maxSteps = 5): Array<{ word: string; steps: number }> {
  const target = targetWord.toUpperCase();
  initializePatternMap();

  const distances = new Map<string, number>();
  distances.set(target, 0);

  const queue: string[] = [target];
  let head = 0;

  while (head < queue.length) {
    const current = queue[head++];
    const dist = distances.get(current)!;

    if (dist >= maxSteps + 1) break;

    const neighbors = getNeighbors(current);
    for (const n of neighbors) {
      if (!distances.has(n)) {
        distances.set(n, dist + 1);
        queue.push(n);
      }
    }
  }

  const results: Array<{ word: string; steps: number }> = [];
  for (const [word, steps] of distances.entries()) {
    if (steps >= minSteps && steps <= maxSteps) {
      results.push({ word, steps });
    }
  }

  return results;
}

/**
 * Provides a hint for the current word:
 * - Optimal next step
 * - Which position to change
 * - Total remaining minimum steps
 */
export interface HintInfo {
  remainingSteps: number;
  recommendedPosition: number; // 0..3
  recommendedLetter: string;
  nextWordSuggestion: string;
}

export function getHint(currentWord: string, targetWord: string): HintInfo | null {
  const path = findShortestPath(currentWord, targetWord);
  if (!path || path.length < 2) return null;

  const nextWord = path[1];
  const { diffIndex } = compareWords(currentWord, nextWord);

  return {
    remainingSteps: path.length - 1,
    recommendedPosition: diffIndex,
    recommendedLetter: nextWord[diffIndex] || '',
    nextWordSuggestion: nextWord,
  };
}
