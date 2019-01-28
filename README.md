# pwasm-erc777
[![Build Status](https://img.shields.io/circleci/project/github/lab10-coop/pwasm-erc777/master.svg?style=flat-square&maxAge=3600)](https://circleci.com/gh/lab10-coop/workflows/pwasm-erc777)

## Description

An experimental implementation of the ERC777 Ethereum Token Standard implemented in Rust/WebAssembly using the "pwasm" environment.

## Build Prerequisites

Install rust with `wasm32-unknown-unknown` target:
```
rustup target add wasm32-unknown-unknown
```
Install Wasm build util:
```
cargo install pwasm-utils --bin wasm-build
```

## Build Rust WebAssembly

Run:
```
cd contracts/pwasm-erc777/
./build.sh
```
## Testing
```
cd contracts/pwasm-erc777/
./test.sh
```

## Build web3 Unit Tests

Requires node.js 10.x

Run:
```
npm i
npm test
```
