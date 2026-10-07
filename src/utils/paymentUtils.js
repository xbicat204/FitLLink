/** Split a confirmed payment between FitLink and the personal trainer. */
export function calculatePaymentSplit(amount, platformPercent = 20) {
  const platformFee = Math.floor(amount * platformPercent / 100)
  const ptEarning = amount - platformFee

  return { platformFee, ptEarning }
}
