# pwasm-erc777
[![Build Status](https://img.shields.io/circleci/project/github/lab10-coop/pwasm-erc777/master.svg?style=flat-square&maxAge=3600)](https://circleci.com/gh/lab10-coop/workflows/pwasm-erc777)

## Description

An experimental implementation of the [ERC777](https://eips.ethereum.org/EIPS/eip-777) Ethereum Token Standard implemented in Rust/WebAssembly using the "pwasm" environment.

The purpose of this implementation is to explore the feasibility of writing complex contracts for the Ethereum platform using Rust/WebAssembly.

It uses the Rust 2018 Edition and current nightly builds of Rust to benefit of newest language features and simplifications.

## pwasm Environment Modifications and Extensions

To allow faithful representation of the [ERC777](https://eips.ethereum.org/EIPS/eip-777) ABI the [pwasm-abi] repository (https://github.com/paritytech/pwasm-abi) was forked [here](https://github.com/lab10-coop/pwasm-abi) and extended with support for Rust/ABI "String" type.

Furthermore a Rust module containing a procedural macro for [**compile-time** calculation of keccack hashes](https://github.com/lab10-coop/keccak-derive) was implemented to reduce the Gas cost of running the contract by eliminating needless re-calculation of constant hash values for smart contract storage.

Functions emulating the Solidity "require" function were implemented to ease the transition from the Solidity implementation and produce more readable/recognizable precondition checks.

### wruffle

In addition to Rust Unit Tests integration tests using the node.js and the "web3" module were developed, following the example of the [Solidity ERC777 implementation](https://github.com/0xjac/ERC777).

The [truffle](https://truffleframework.com/) toolchain is widely used for development/testing/deploying of smart contracts in Solidity. This repository contains the beginnings of a similar toolset for smart contracts written in Rust, starting with support for convenient testing of smart contracts deployed in Rust. We empathically call this toolset **wruffle**.

It allows quick and convenient compile/deploy/test cycles on pwasm smart contracts with the web3 tests largely identical to the ones you can write with truffle.

This suite is in early development, to be extended with further commands, e.g. for deploying on production chains.

## Known Problems

Advanced mathematical operations on the U256 type imported from pwasm-std causes duplicate symbols link errors, specifically when using multiplications and modulo.

This is most likely an issue with the "uint" Rust module not being fully adapted to work in the "no-std" environment at this point. Subject to further investigation.

As a consequence the granularity checks and corresponding web3 Unit Tests are currently deactivated.

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
