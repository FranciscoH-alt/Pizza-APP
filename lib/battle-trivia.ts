export interface BattleTrivia {
  question: string | null;
  correct_option: 'a' | 'b' | null;
  fun_fact: string | null;
}

/** Parses the JSON-in-`description` trivia blob. Never throws — returns
 *  all-nulls if description is missing/not JSON (plain style-preference battles). */
export function parseBattleTrivia(description: string | null): BattleTrivia {
  try {
    const parsed = JSON.parse(description ?? '');
    return {
      question: parsed.question ?? null,
      correct_option: parsed.correct_option === 'a' || parsed.correct_option === 'b' ? parsed.correct_option : null,
      fun_fact: parsed.fun_fact ?? null,
    };
  } catch {
    return { question: null, correct_option: null, fun_fact: null };
  }
}

/** Builds the `description` column value for a new trivia battle. */
export function stringifyBattleTrivia(input: { question: string; correct_option: 'a' | 'b' | null; fun_fact?: string | null }): string {
  return JSON.stringify({
    question: input.question,
    correct_option: input.correct_option,
    fun_fact: input.fun_fact || null,
  });
}
