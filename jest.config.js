module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!/node_modules/",
    "!/examples/",
    "!/lib/",
    "!index.js",
    "!src/jest.config.js"
  ]
};