module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|react-native-safe-area-context|expo(nent)?|@expo(nent)?/.*|expo-router|@expo-google-fonts/.*|react-native-svg|react-native-screens|react-native-gesture-handler|@react-navigation/.*|@tanstack/react-query)/)',
  ],
  collectCoverageFrom: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'context/**/*.{ts,tsx}'],
};
