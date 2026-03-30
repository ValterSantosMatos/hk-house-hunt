#!/bin/bash
cd ~/Projects/house-hunt/app
rm -f .git/index.lock
git add -A
git commit -m "Upgrade: Neon SDK, Next.js 15, React 19, scanner API endpoints, feedback loop"
git push
echo ""
echo "Done! Changes pushed to GitHub."
echo "Vercel will auto-redeploy."
echo ""
echo "REMEMBER: Add SCANNER_API_KEY to Vercel env vars!"
echo "Press any key to close..."
read -n 1
