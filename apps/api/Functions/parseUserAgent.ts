// Lightweight User-Agent sniffing for the "device / browser" analytics
// breakdown — deliberately not a full UA-parsing library (one more
// dependency, and a heavier one, for what only needs to answer "roughly
// which device/browser family").

export function parseDevice(userAgent: string | null | undefined): string {
  const ua = userAgent || "";
  if (/iPad|Tablet(?!.*Mobile)/i.test(ua)) return "Tablette";
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return "Mobile";
  return "Ordinateur";
}

export function parseBrowser(userAgent: string | null | undefined): string {
  const ua = userAgent || "";
  // Order matters: Edge/Opera/Chrome UAs all also match /Safari/, and
  // Edge/Opera UAs also match /Chrome/.
  if (/Edg\//i.test(ua)) return "Edge";
  if (/OPR\/|Opera/i.test(ua)) return "Opera";
  if (/Firefox\//i.test(ua)) return "Firefox";
  if (/Chrome\//i.test(ua)) return "Chrome";
  if (/Safari\//i.test(ua)) return "Safari";
  return "Autre";
}
