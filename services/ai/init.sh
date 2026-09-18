#!/usr/bin/env bash
set -e

echo "=== Initializing A.R.I.A Backend Environment ==="

# 1. Install dependencies
echo ">> Checking dependencies..."
bun --bun install

# 2. Run verification pipeline
echo ">> Running typecheck..."
bun --bun typecheck

echo ">> Running linter..."
bun --bun lint

echo "=== Environment Ready and Verified ==="
