// ==============================================================================
// BAGIAN 1: LOGIKA INTERAKSI UI
// Bertugas menghitung 8 titik koordinat Bounding Box untuk Cursor Tool
// ==============================================================================

export function getHandleCoordinates(w, h) {
  return {
    tl: { x: 0, y: 0 },    tm: { x: w / 2, y: 0 },   tr: { x: w, y: 0 },
    ml: { x: 0, y: h / 2 },                           mr: { x: w, y: h / 2 },
    bl: { x: 0, y: h },    bm: { x: w / 2, y: h },   br: { x: w, y: h }
  };
}

export function checkHandleHit(mx, my, layer) {
  const handles = getHandleCoordinates(layer.w, layer.h);
  let lx = mx - layer.x;
  let ly = my - layer.y;
  let hit = null;

  Object.keys(handles).forEach(key => {
    let h = handles[key];
    if (Math.abs(lx - h.x) <= 8 && Math.abs(ly - h.y) <= 8) {
      hit = key;
    }
  });
  return hit;
}


// ==============================================================================
// BAGIAN 2: MESIN KALKULATOR MATRIKS TRANSFORMASI 2D
// Implementasi Koordinat Homogen 3x3 sesuai teori grafika komputer untuk mendukung Translasi, Skala, Rotasi, Shear, dan Transformasi Komposit.
// ==============================================================================

/**
 * Fungsi utilitas untuk mengalikan dua matriks 3x3.
 * Digunakan untuk menggabungkan beberapa transformasi menjadi satu (Transformasi Komposit).
 */
export const multiplyMatrix = (m1, m2) => {
  let result = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      result[i][j] = m1[i][0] * m2[0][j] + 
                     m1[i][1] * m2[1][j] + 
                     m1[i][2] * m2[2][j];
    }
  }
  return result;
};

/**
 * 1. TRANSLASI (Pergeseran)
 * Menggeser objek sejauh tx pada sumbu x dan ty pada sumbu y.
 */
export const getTranslationMatrix = (tx, ty) => [
  [1, 0, tx],
  [0, 1, ty],
  [0, 0, 1]
];

/**
 * 2. SKALA & REFLEKSI (Pengecilan/Pembesaran & Pencerminan)
 * Digunakan untuk fitur perbesaran rasio. 
 * Jika nilai sx atau sy adalah negatif (-1), matriks ini otomatis bertindak sebagai Refleksi (Pencerminan).
 */
export const getScaleMatrix = (sx, sy) => [
  [sx, 0, 0],
  [0, sy, 0],
  [0, 0, 1]
];

/**
 * 3. ROTASI (Perputaran)
 * Memutar objek menggunakan perhitungan Trigonometri (Cos dan Sin) dari sudut radian.
 */
export const getRotationMatrix = (angleInRadians) => {
  const cos = Math.cos(angleInRadians);
  const sin = Math.sin(angleInRadians);
  return [
    [cos, -sin, 0],
    [sin, cos, 0],
    [0, 0, 1]
  ];
};

/**
 * 4. SHEAR (Pemiringan)
 * Mendistorsi bentuk objek berdasarkan sumbu X (shx) dan sumbu Y (shy).
 */
export const getShearMatrix = (shx, shy) => [
  [1, shx, 0],
  [shy, 1, 0],
  [0, 0, 1]
];

/**
 * 5. TRANSFORMASI KOMPOSIT TERHADAP TITIK TENGAH (PIVOT POINT)
 * Fungsi utama yang merangkai urutan transformasi agar objek tidak berputar
 * secara acak dari pojok layar, melainkan berpusat di tengah objek itu sendiri.
 * * Urutan komputasi: Translate(Pivot) -> Rotate/Scale/Shear -> Translate(-Pivot)
 */
export const getCompositeTransform = (pivotX, pivotY, tx, ty, sx, sy, rotation, shx, shy) => {
  // Matriks Identitas Awal
  let matrix = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1]
  ];

  // 1. Pindahkan titik pusat ke lokasi akhir (Translasi + Titik Pivot)
  matrix = multiplyMatrix(matrix, getTranslationMatrix(pivotX + tx, pivotY + ty));

  // 2. Terapkan Rotasi
  if (rotation !== 0) {
    matrix = multiplyMatrix(matrix, getRotationMatrix(rotation));
  }

  // 3. Terapkan Skala (dan Refleksi jika bernilai -1)
  if (sx !== 1 || sy !== 1) {
    matrix = multiplyMatrix(matrix, getScaleMatrix(sx, sy));
  }

  // 4. Terapkan Pemiringan (Shear)
  if (shx !== 0 || shy !== 0) {
    matrix = multiplyMatrix(matrix, getShearMatrix(shx, shy));
  }

  // 5. Inverse Translasi (Kembalikan Pivot Point objek ke pusat kordinat (0,0))
  matrix = multiplyMatrix(matrix, getTranslationMatrix(-pivotX, -pivotY));

  return matrix;
};