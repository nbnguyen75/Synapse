#!/bin/bash
set -e

echo "=== Harness Initialization ==="

echo "=== bun --bun install ==="
bun --bun install

echo "=== bun --bun check ==="
bun --bun check

# echo "=== bun --bun lint ==="
# bun --bun lint

# echo "=== tsc -b ==="
# tsc -b

# echo "=== bun --bun run build ==="
# bun --bun run build

echo "=== Verification Complete ==="
echo ""
echo "Next steps:"
echo "1. Read feature_list.json to see current feature state"
echo "2. Pick ONE unfinished feature to work on"
echo "3. Implement only that feature"
echo "4. Re-run verification before claiming done"