export function generateQRData(drug: {
  name: string;
  batchNumber: string;
  manufacturer: string;
  expiryDate: string;
}): string {
  return JSON.stringify({
    name: drug.name,
    batchNumber: drug.batchNumber,
    manufacturer: drug.manufacturer,
    expiryDate: drug.expiryDate,
    timestamp: new Date().toISOString(),
  });
}

export function parseQRData(qrData: string): any {
  try {
    return JSON.parse(qrData);
  } catch {
    // If it's not JSON, assume it's just a batch number
    return { batchNumber: qrData };
  }
}
