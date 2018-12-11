#!/bin/bash

rel_dir="$(dirname "$0")"
# get PARITY_BINARY_PATH
source "$rel_dir/parity_binary_path.sh"

$PARITY_BINARY_PATH --chain scripts/specs/wasm-dev-chain.json --jsonrpc-apis=all --base-path parity_data --unlock="0x004ec07d2329997267ec62b4166639513386f32e" --password <(echo "user")
