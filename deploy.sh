#!/usr/bin/env bash
set -euo pipefail

buildhash=$(git rev-parse HEAD)
origin=$(git config --get remote.origin.url)

echo "Building $buildhash"
npm run build
cd dist

if [ -d ".git" ]; then
  echo "Cleaning up .git folder from older deploy"
  rm -Rf .git
fi

git init
git add .
git commit -m "build $buildhash"

echo "Pushing to github pages"
git remote add origin "$origin"
git push origin master:gh-pages

echo "Cleaning up"
cd ..
rm -Rf dist/.git

echo "Done"
