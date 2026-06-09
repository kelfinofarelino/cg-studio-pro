export function filterLineStyles(points, style, thickness = 1) {
  if (style === 'solid' || !points || points.length === 0) return points;
  
  const filtered = [];
  const t = Math.max(1, thickness);
  
  // Skala dinamis rasio celah grafika komputer berbasis ketebalan objek
  const dashLen = t * 3;
  const gapLen = t * 2;
  const dotLen = Math.max(1, Math.floor(t / 2));
  
  if (style === 'dashed') {
    const patternLength = dashLen + gapLen;
    for (let i = 0; i < points.length; i++) {
      if ((i % patternLength) < dashLen) {
        filtered.push(points[i]);
      }
    }
  } else if (style === 'dotted') {
    const patternLength = dotLen + gapLen;
    for (let i = 0; i < points.length; i++) {
      if ((i % patternLength) < dotLen) {
        filtered.push(points[i]);
      }
    }
  } else if (style === 'dash-dotted') {
    const patternLength = dashLen + gapLen + dotLen + gapLen;
    for (let i = 0; i < points.length; i++) {
      const mod = i % patternLength;
      if (mod < dashLen) {
        filtered.push(points[i]);
      } else if (mod >= (dashLen + gapLen) && mod < (dashLen + gapLen + dotLen)) {
        filtered.push(points[i]);
      }
    }
  }
  
  return filtered;
}