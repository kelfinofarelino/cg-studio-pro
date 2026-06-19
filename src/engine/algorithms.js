/**
 * Penjelasan: Pustaka algoritma garis primitif.
 * Fungsi: Berisi fungsi matematika murni (getPointsDDA, getPointsBresenham, dan getScanLinePixels). 
 * Tugasnya menerima input titik kordinat ujung, lalu menghitung deretan titik piksel mana saja yang 
 * harus diwarnai untuk membentuk garis lurus atau mengisi bangun datar (vektor-ke-piksel).
 */

export function getPointsDDA(x1, y1, x2, y2) {
  let points = [];
  let dx = x2 - x1;
  let dy = y2 - y1;
  let steps = Math.max(Math.abs(dx), Math.abs(dy));
  if (steps === 0) return [{ x: Math.round(x1), y: Math.round(y1) }];
  
  let xInc = dx / steps;
  let yInc = dy / steps;
  let x = x1;
  let y = y1;
  
  for (let i = 0; i <= steps; i++) {
    points.push({ x: Math.round(x), y: Math.round(y) });
    x += xInc;
    y += yInc;
  }
  return points;
}

export function getPointsBresenham(x1, y1, x2, y2) {
  let points = [];
  x1 = Math.round(x1); y1 = Math.round(y1);
  x2 = Math.round(x2); y2 = Math.round(y2);
  
  let dx = Math.abs(x2 - x1);
  let dy = Math.abs(y2 - y1);
  let sx = (x1 < x2) ? 1 : -1;
  let sy = (y1 < y2) ? 1 : -1;
  let err = dx - dy;
  
  let cx = x1;
  let cy = y1;

  while (true) {
    points.push({ x: cx, y: cy });
    if (cx === x2 && cy === y2) break;
    let e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      cx += sx;
    }
    if (e2 < dx) {
      err += dx;
      cy += sy;
    }
  }
  return points;
}

/**
 * ALGORITMA SCAN-LINE POLYGON FILL
 * Mewarnai area dalam poligon menggunakan perhitungan garis pindai horizontal.
 */
export function getScanLinePixels(vertices) {
  let pixels = [];
  if (vertices.length < 3) return pixels;

  // 1. Cari batas atas (minY) dan batas bawah (maxY) dari bangun datar
  let minY = Math.min(...vertices.map(v => v.y));
  let maxY = Math.max(...vertices.map(v => v.y));

  // 2. Lakukan pemindaian (Scanning) dari baris paling atas ke paling bawah
  for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
    let intersections = [];

    // 3. Cari titik potong garis horizontal (scan-line) dengan sisi-sisi bangun
    for (let i = 0; i < vertices.length; i++) {
      let p1 = vertices[i];
      let p2 = vertices[(i + 1) % vertices.length]; // Titik selanjutnya (melingkar)

      if (p1.y === p2.y) continue; // Abaikan garis yang benar-benar mendatar

      if (y >= Math.min(p1.y, p2.y) && y <= Math.max(p1.y, p2.y)) {
        // Rumus interpolasi linear untuk mencari nilai X pada titik potong Y
        let x = p1.x + ((y - p1.y) * (p2.x - p1.x)) / (p2.y - p1.y);
        intersections.push(x);
      }
    }

    // 4. Urutkan titik potong dari kiri ke kanan berdasarkan sumbu X
    intersections.sort((a, b) => a - b);

    // 5. Isi piksel di antara pasangan titik potong (kiri ke kanan)
    for (let i = 0; i < intersections.length; i += 2) {
      if (intersections[i + 1] !== undefined) {
        let startX = Math.floor(intersections[i]);
        let endX = Math.floor(intersections[i + 1]);
        for (let x = startX; x <= endX; x++) {
          pixels.push({ x, y });
        }
      }
    }
  }

  return pixels;
}