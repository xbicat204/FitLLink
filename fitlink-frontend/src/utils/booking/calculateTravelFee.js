export function calculateTravelFee(distanceKm, feePerKm, freeRadiusKm, maxTravelKm) {
  if (distanceKm <= freeRadiusKm) return 0; // miễn phí trong bán kính freeRadiusKm
  if (distanceKm > maxTravelKm) {
    throw new Error(`Khoảng cách vượt quá giới hạn cho phép (${maxTravelKm} km)`);
  }

  // Tính quãng đường tính phí
  const chargeableDistance = distanceKm - freeRadiusKm;

  // Phí cơ bản
  let totalFee = chargeableDistance * feePerKm;

  return totalFee;
}