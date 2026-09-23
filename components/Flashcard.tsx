"use client";

import { useState } from "react";

type Props = {
  question: string;
  answer: string;
};

export default function Flashcard({ question, answer }: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setFlipped(!flipped)}
      className="w-full cursor-pointer rounded-xl text-left perspective-[1000px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
    >
      {/* both sides sit in the same grid cell so the card is as tall as the longer side */}
      <span
        className={`grid h-full transition-transform duration-500 transform-3d motion-reduce:transition-none ${
          flipped ? "rotate-y-180" : ""
        }`}
      >
        <span
          aria-hidden={flipped}
          className="col-start-1 row-start-1 flex min-h-48 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm backface-hidden"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            Question
          </span>
          <span className="mt-2 flex-1 text-lg font-medium">{question}</span>
          <span className="mt-4 text-xs text-slate-400">Click to flip</span>
        </span>

        <span
          aria-hidden={!flipped}
          className="col-start-1 row-start-1 flex min-h-48 flex-col rounded-xl border border-indigo-200 bg-indigo-50 p-5 shadow-sm backface-hidden rotate-y-180"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
            Answer
          </span>
          <span className="mt-2 flex-1">{answer}</span>
        </span>
      </span>
    </button>
  );
}
