export type Card = {
  question: string;
  answer: string;
};

// Makes sure Claude gave back a list of cards and every card has a question and an answer.
// Returns an error message if something is wrong, or null if the cards look good.
export function checkCards(data: unknown): string | null {
  const cards = (data as { cards?: unknown } | null)?.cards;

  if (!Array.isArray(cards)) {
    return "Claude didn't send back a list of cards.";
  }
  if (cards.length === 0) {
    return "Claude didn't make any cards. Try adding more detail to your notes.";
  }

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    if (typeof card?.question !== "string" || card.question.trim() === "") {
      return `Card ${i + 1} is missing a question.`;
    }
    if (typeof card.answer !== "string" || card.answer.trim() === "") {
      return `Card ${i + 1} is missing an answer.`;
    }
  }

  return null;
}
