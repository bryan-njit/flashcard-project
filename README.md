# AI Flashcard Maker

Paste in your class notes and get flashcards you can flip through to study.

Built with Next.js (App Router), TypeScript, Tailwind CSS, and the Claude API.

## How it works

1. You paste your notes into the text box.
2. The page sends them to `/api/generate`, a Next.js API route.
3. The route sends the notes to Claude and asks for flashcards as JSON. It passes a JSON schema, so Claude has to answer in this shape:

   ```json
   { "cards": [{ "question": "...", "answer": "..." }] }
   ```

4. The server still checks the result before using it (`lib/checkCards.ts`). It has to be a list of cards, and every card needs a question and an answer. If anything is off, the page shows an error instead of broken cards.
5. The cards show up as flip cards. Click one (or press Space) to see the answer.

## Running it locally

You need Node 20.9 or newer (there's an `.nvmrc` in the repo) and an Anthropic API key from https://console.anthropic.com/settings/keys.

```bash
npm install
cp .env.example .env.local
```

Paste your key into `.env.local`, then run:

```bash
npm run dev
```

and open http://localhost:3000.

## Project structure

- `app/page.tsx` - notes form and the flashcards
- `app/api/generate/route.ts` - API route that calls Claude
- `lib/checkCards.ts` - checks the cards Claude sends back
- `components/Flashcard.tsx` - the flip card
