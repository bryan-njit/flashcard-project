"use client";

import { useState } from "react";
import type { Card } from "@/lib/checkCards";

const MAX_LENGTH = 15000;

export default function Home() {
  const [notes, setNotes] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCards([]);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Try again.");
      } else {
        setCards(data.cards);
      }
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">AI Flashcard Maker</h1>
      <p className="mt-2 text-slate-600">
        Paste your class notes below and get flashcards to study with.
      </p>

      <form onSubmit={handleSubmit} className="mt-8">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Paste your notes here..."
          maxLength={MAX_LENGTH}
          rows={12}
          className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
        />

        <div className="mt-3 flex items-center justify-between gap-4">
          <span className="text-sm text-slate-500">
            {notes.length} / {MAX_LENGTH} characters
          </span>
          <button
            type="submit"
            disabled={loading || !notes.trim()}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Making flashcards..." : "Make flashcards"}
          </button>
        </div>
      </form>

      {error && (
        <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </p>
      )}

      {cards.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">{cards.length} flashcards</h2>
          <ul className="mt-4 space-y-3">
            {cards.map((card, i) => (
              <li key={i} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="font-medium">{card.question}</p>
                <p className="mt-1 text-slate-600">{card.answer}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
