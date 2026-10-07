module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/utils/pricingUtils.js',
    'src/utils/scheduleFromBooking.js',
    'src/utils/genarateTokens.js',
    'src/utils/paymentUtils.js'
  ]
}
