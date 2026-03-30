#!/bin/bash
cd ~/Projects/house-hunt/app

# Clean up any stale lock files from previous crashes
rm -f .git/index.lock

# Install gh CLI if not available
if ! command -v gh &> /dev/null; then
  echo "Installing GitHub CLI..."
  brew install gh 2>/dev/null || {
    echo ""
    echo "Could not install gh automatically."
    echo "Please run: brew install gh"
    echo "Then run this script again."
    echo "Press any key to close..."
    read -n 1
    exit 1
  }
fi

# Check gh auth
if ! gh auth status &> /dev/null; then
  echo "Please log in to GitHub:"
  gh auth login
fi

git init
git add -A
git commit -m "Initial commit: House Hunt HK property tracker"

# Create repo and push
gh repo create hk-house-hunt --public --source=. --push

echo ""
echo "Done! Code pushed to GitHub."
echo "Press any key to close..."
read -n 1
