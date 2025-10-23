# Funeral Memories Frontend

This project is a Vite + React application for the Funeral Memories experience. The original
deployment relies on Vercel serverless APIs, but the UI now ships with rich mock data so you can
preview and restyle the interface without those services.

## Getting started locally

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 4173
```

Open the local server URL printed in the terminal (for example
`http://localhost:4173`) and use the following mock credentials to explore the app:

- **Group ID:** `elmwood`
- **Admin email:** `host@example.com`
- **Admin password:** `remember-me`

The join and wall pages are pre-populated with realistic sample memories, portraits, and metadata
to make CSS work fast and visual.

### Toggling real APIs

The mock layer is enabled automatically in local development. If you have access to the production
APIs and want to test against them, create a `.env.local` file and set:

```bash
VITE_ENABLE_API_MOCKS=false
```

Restart the dev server and the frontend will resume calling the real `/api` endpoints.

## Publishing the local updates to another branch

If you need to move the local `work` branch updates onto an existing branch (for example, a
teammate's `Izzie` branch), here is the plain-language flow:

1. **Make sure your work is committed on `work`.** Run `git status` while on the `work` branch. If
   you still see "changes not staged for commit" or "untracked files", commit them before you keep
   going. The merge will only carry over committed work.

2. **Double-check that your remote exists.** If `git remote -v` prints nothing, add it with:
   ```bash
   git remote add origin <git-url>
   ```

3. **Download the latest `Izzie` branch from the remote** so you have your teammate's most recent
   changes locally:
   ```bash
   git fetch origin
   ```

4. **Switch to the branch that should receive the updates** and pull in the `work` commits:
   ```bash
   git checkout Izzie
   git merge work        # or git cherry-pick <commit-sha> for a single commit
   ```
   Git might tell you there are conflicts. That just means the same file was edited on both
   branches. Open the listed files, decide which version to keep, then run `git add <file>` for each
   resolved file.

5. **Finish the merge and push the branch back up:**
   ```bash
   git commit            # only if Git created a merge commit for you
   git push origin Izzie
   ```

When the push succeeds, the remote `Izzie` branch will now contain all of the changes you made on
`work`. Anyone else pulling `Izzie` will see the updated codebase.
