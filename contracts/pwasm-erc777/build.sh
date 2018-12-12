#!/bin/bash

cargo build --release --target wasm32-unknown-unknown
wasm-build --target=wasm32-unknown-unknown ./target pwasm_erc777
