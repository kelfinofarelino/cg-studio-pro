export function executeFloodFill(canvas, startX, startY, fillColorHex) {
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  
  // Batas aman koordinat klik agar tidak out-of-bounds
  if (startX < 0 || startX >= width || startY < 0 || startY >= height) return null;
  
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Dekonstruksi warna Hex pilihan ke format RGB data piksel
  const rFill = parseInt(fillColorHex.substr(1, 2), 16);
  const gFill = parseInt(fillColorHex.substr(3, 2), 16);
  const bFill = parseInt(fillColorHex.substr(5, 2), 16);

  const targetIdx = (startY * width + startX) * 4;
  const rTarget = data[targetIdx];
  const gTarget = data[targetIdx + 1];
  const bTarget = data[targetIdx + 2];
  const aTarget = data[targetIdx + 3];

  // Jika warna yang diklik sudah sama dengan warna fill, hentikan operasi
  if (rTarget === rFill && gTarget === gFill && bTarget === bFill && aTarget === 255) {
    return imgData;
  }

  // ANTRIAN FLAT ARRAY + INDEKS POINTER (Super cepat, anti-garbage collection)
  const queue = [startX, startY];
  let head = 0;

  // WARNAI LANGSUNG PIKSEL PERTAMA (Kunci anti-freeze)
  data[targetIdx] = rFill;
  data[targetIdx + 1] = gFill;
  data[targetIdx + 2] = bFill;
  data[targetIdx + 3] = 255;

  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];

    // Periksa 4 tetangga mata angin (Kanan, Kiri, Bawah, Atas)
    const neighbors = [
      cx + 1, cy,
      cx - 1, cy,
      cx, cy + 1,
      cx, cy - 1
    ];

    for (let i = 0; i < neighbors.length; i += 2) {
      const nx = neighbors[i];
      const ny = neighbors[i + 1];

      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const idx = (ny * width + nx) * 4;
        
        // Jika piksel tetangga warnanya cocok dengan target awal
        if (data[idx] === rTarget && data[idx + 1] === gTarget && data[idx + 2] === bTarget && data[idx + 3] === aTarget) {
          
          // WARNAI SEKARANG JUGA sebelum dimasukkan ke antrean!
          data[idx] = rFill;
          data[idx + 1] = gFill;
          data[idx + 2] = bFill;
          data[idx + 3] = 255;
          
          queue.push(nx, ny);
        }
      }
    }
  }

  // Tembakkan kembali data piksel matang ke kanvas
  ctx.putImageData(imgData, 0, 0);
  return imgData;
}