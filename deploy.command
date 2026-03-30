#!/bin/bash
cd ~/Projects/house-hunt/app
rm -f .git/index.lock
rm -f next.config.ts
git add -A
git commit -m "Fix: rename next.config.ts to next.config.mjs for Vercel compatibility"
git push
echo ""
echo "Done! Fix pushed to GitHub."
echo "Go back to Vercel and click Redeploy."
echo "Press any key to close..."
read -n 1
