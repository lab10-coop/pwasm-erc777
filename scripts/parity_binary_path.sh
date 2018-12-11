if [[ "$OSTYPE" == "linux-gnu" ]]; then
    PARITY_BINARY_PATH=./scripts/bin/parity-linux
elif [[ "$OSTYPE" == "darwin"* ]]; then
    PARITY_BINARY_PATH=./scripts/bin/parity-darwin
else
    echo "Unsupported operating system"
    exit 1
fi