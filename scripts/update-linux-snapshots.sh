#!/usr/bin/env bash
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"

docker run --rm \
  --platform=linux/amd64 \
  --ipc=host \
  --volume "${repo_root}:/repo:rw" \
  --workdir /repo \
  mcr.microsoft.com/playwright:v1.57.0-noble \
  bash -c '
    set -euo pipefail

    rm -rf /tmp/work
    mkdir -p /tmp/work
    tar -C /repo \
      --exclude=.git \
      --exclude=.worktrees \
      --exclude=.superpowers \
      --exclude=node_modules \
      --exclude=dist \
      --exclude=storybook-static \
      --exclude=coverage \
      --exclude=test-results \
      --exclude=playwright-report \
      -cf - . | tar -C /tmp/work -xf -

    cd /tmp/work
    npm ci
    npx playwright test --project=chromium --grep @visual --update-snapshots

    linux_snapshots=test/visual/__snapshots__/visual.spec.ts/linux/chromium
    rm -rf "/repo/${linux_snapshots}"
    mkdir -p "$(dirname "/repo/${linux_snapshots}")"
    cp -a "${linux_snapshots}" "/repo/${linux_snapshots}"
  '
