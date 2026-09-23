"use client";

import { useState } from "react";

const MAX_LENGTH = 15000;

export default function Home() {
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: send notes to the api
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
            disabled={!notes.trim()}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Make flashcards
          </button>
        </div>
      </form>
    </main>
  );
}
