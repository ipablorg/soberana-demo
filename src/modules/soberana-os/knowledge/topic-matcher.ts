import type { KnowledgeEntry } from './types';

export function findBestMatch(
  input: string,
  entries: KnowledgeEntry[],
): KnowledgeEntry | null {
  const normalized = input.toLowerCase().trim();

  const exactId = entries.find((e) => e.id === normalized);
  if (exactId) return exactId;

  const scored = entries
    .filter((e) => e.id !== 'fallback')
    .map((entry) => {
      let score = 0;

      for (const alias of entry.aliases) {
        if (normalized === alias) {
          score += 100;
          break;
        }
        if (normalized.includes(alias)) {
          score += 50;
          break;
        }
        if (alias.includes(normalized) && normalized.length > 3) {
          score += 40;
          break;
        }
      }

      const questionLower = entry.question.toLowerCase();
      const questionEsLower = entry.questionEs.toLowerCase();
      if (normalized.includes(questionLower) || questionLower.includes(normalized))
        score += 30;
      if (normalized.includes(questionEsLower) || questionEsLower.includes(normalized))
        score += 30;

      const words = normalized.split(/\s+/);
      for (const keyword of entry.keywords) {
        if (normalized.includes(keyword)) score += 10;
        for (const word of words) {
          if (word.length >= 4 && keyword.startsWith(word)) score += 5;
          if (word.length >= 4 && word.startsWith(keyword)) score += 5;
        }
      }

      return { entry, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0 && scored[0].score >= 10) {
    return scored[0].entry;
  }

  return entries.find((e) => e.id === 'fallback') ?? null;
}
