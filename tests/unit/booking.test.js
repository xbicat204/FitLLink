import { calcBookingPricing } from '../../src/utils/pricingUtils'
import { generateDatesByPatternFromDate } from '../../src/utils/scheduleFromBooking'

describe('FitLink booking and schedule helpers', () => {
  describe('calcBookingPricing', () => {
    test('calculates travel fee beyond the free radius', () => {
      const result = calcBookingPricing({
        mode: 'atClient',
        base: 1_000_000,
        tax: 50_000,
        discount: 100_000,
        travelDistanceKm: 8,
        travelPolicy: { freeRadiusKm: 2, feePerKm: 50_000 }
      })

      expect(result).toEqual({
        base: 1_000_000,
        tax: 50_000,
        discount: 100_000,
        travel: 300_000,
        subtotal: 1_350_000,
        total: 1_250_000
      })
    })

    test('does not charge travel when training at the PT gym', () => {
      const result = calcBookingPricing({
        mode: 'atPtGym',
        base: 500_000,
        travelDistanceKm: 10,
        travelPolicy: { freeRadiusKm: 2, feePerKm: 50_000 }
      })

      expect(result.travel).toBe(0)
      expect(result.total).toBe(500_000)
    })
  })

  describe('generateDatesByPatternFromDate', () => {
    test('generates training dates in calendar order for selected weekdays', () => {
      const dates = generateDatesByPatternFromDate(
        new Date(2026, 0, 1, 12),
        [2, 4],
        3
      )

      expect(dates).toEqual([
        new Date(2026, 0, 1),
        new Date(2026, 0, 6),
        new Date(2026, 0, 8)
      ])
    })

    test('removes duplicate weekdays from the pattern', () => {
      const dates = generateDatesByPatternFromDate(
        new Date(2026, 0, 1),
        [4, 4],
        2
      )

      expect(dates).toEqual([
        new Date(2026, 0, 1),
        new Date(2026, 0, 8)
      ])
    })
  })
})
