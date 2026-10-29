Build a match-3 puzzle in THIS folder: C:\xampp\htdocs\match-3

A recruiter-ready browser match-3. Playable, polished, no backend.

## Game
- Call it "Gleam Grid". Original gem shapes, no licensed candy or jewel brands.
- 8×8 board, 6 gem types. Swap two adjacent gems. A swap is legal only if it makes at least one line of 3+ of the same type (row or column).
- Matched gems clear, remaining gems fall, empty cells refill from the top. Cascades can chain. Score +10 per gem cleared, combo multiplier on cascades.
- Click/tap two adjacent gems, or click one then a neighbor. Keyboard: arrows move a highlight, Enter/Space selects, second select swaps if adjacent. R restarts.
- Moves counter optional. Local best score in localStorage.

## UI
- Dark navy grid, glowing gems, clear pop, fall animation. Not a default Vite page. No Vue logo.
- 390px phone and 1280px desktop.

## Tests
- Vitest (pure logic): a swap that makes three in a row is legal; a swap that makes none is rejected; after a match the gems above fall; clearing gems increases score.
- `npm test` and `npm run build` must pass.

## GitHub
- Repo: https://github.com/oscarmmi/match-3
- Pages: https://oscarmmi.github.io/match-3/
- vite base `/match-3/`
- Commit: feat: add match-3
- First commit must `git add -A` so package.json, vite.config.ts, tsconfigs, src/main.ts, index.html, .gitignore, and .github/workflows/pages.yml ship with the game.
- gh repo edit --description "Gleam Grid match-3 puzzle in Vue 3 + TypeScript, playable on GitHub Pages." --add-topic vue --add-topic typescript --add-topic game --add-topic match-3 --add-topic puzzle
- Stop. Print the repo URL and Pages URL.
