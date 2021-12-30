module.exports = {
    "testMatch": [
        "**/tests/unit/*.[jt]s?(x)",
        "**/tests/integration/*.[jt]s?(x)",
    ],
    "transform": {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
}