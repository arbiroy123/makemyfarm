module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx)$': ['babel-jest', { presets: ['babel-preset-expo'] }],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(expo-localization|@expo/.*|expo)/)',
  ],
  moduleNameMapper: {
    '@react-native-async-storage/async-storage': '<rootDir>/src/__mocks__/async-storage.js',
  },
  testMatch: ['**/src/__tests__/**/*.test.js'],
};
