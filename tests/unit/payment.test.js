import { calculatePaymentSplit } from '../../src/utils/paymentUtils'

describe('calculatePaymentSplit', () => {
  test('splits a confirmed payment using the default 20 percent fee', () => {
    expect(calculatePaymentSplit(1_250_000)).toEqual({
      platformFee: 250_000,
      ptEarning: 1_000_000
    })
  })

  test('floors the platform fee and assigns the remaining amount to the PT', () => {
    expect(calculatePaymentSplit(101, 15)).toEqual({
      platformFee: 15,
      ptEarning: 86
    })
  })
})
