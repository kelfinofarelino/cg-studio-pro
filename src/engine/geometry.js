/**
 * THETADRAW GEOMETRY ENGINE
 * Mengalkulasi proyeksi matriks 2D dan struktur koordinat bentuk geometris
 */

// Menghitung posisi nyata 8 kotak handle di layar setelah dikenakan transformasi matriks (Screen-Space)
export const getScreenCoordinatesOfHandles = (layer) => {
  const rad = (layer.rotation * Math.PI) / 180;
  
  const localHandles = {
    tl: { x: 0, y: 0 },         tm: { x: layer.w / 2, y: 0 },   tr: { x: layer.w, y: 0 },
    ml: { x: 0, y: layer.h / 2 },                               mr: { x: layer.w, y: layer.h / 2 },
    bl: { x: 0, y: layer.h },   bm: { x: layer.w / 2, y: layer.h }, br: { x: layer.w, y: layer.h }
  };

  const screenHandles = {};

  Object.keys(localHandles).forEach(k => {
    const pt = localHandles[k];
    
    // 1. Translasi berdasarkan titik poros (Pivot)
    let x1 = pt.x - layer.pivotX;
    let y1 = pt.y - layer.pivotY;
    
    // 2. Transformasi Shear (Kemiringan)
    let x2 = x1 + layer.shearX * y1;
    let y2 = layer.shearY * x1 + y1;
    
    // 3. Transformasi Scale (Meregang)
    let x3 = x2 * layer.scaleX;
    let y3 = y2 * layer.scaleY;
    
    // 4. Transformasi Rotate (Rotasi Sudut Radian)
    let x4 = x3 * Math.cos(rad) - y3 * Math.sin(rad);
    let y4 = x3 * Math.sin(rad) + y3 * Math.cos(rad);
    
    // 5. Kembalikan proyeksi ke koordinat layar kanvas
    screenHandles[k] = {
      x: x4 + layer.x + layer.pivotX,
      y: y4 + layer.y + layer.pivotY
    };
  });

  return screenHandles;
};

// Mendefinisikan jalur (path tracking) tertutup untuk keperluan Fill Bucket internal & Hit-Testing
export const defineLayerPath = (ctx, layer) => {
  ctx.beginPath();
  if (layer.type === 'RECT' || layer.type === 'SQUARE') {
    ctx.rect(0, 0, layer.w, layer.h);
  } else if (layer.type === 'TRIANGLE_EQUILATERAL' || layer.type === 'TRIANGLE_ISOSCELES') {
    ctx.moveTo(layer.w / 2, 0); 
    ctx.lineTo(layer.w, layer.h); 
    ctx.lineTo(0, layer.h); 
    ctx.closePath();
  } else if (layer.type === 'TRIANGLE_RIGHT') {
    ctx.moveTo(0, 0); 
    ctx.lineTo(layer.w, layer.h); 
    ctx.lineTo(0, layer.h); 
    ctx.closePath();
  } else if (layer.type === 'TRIANGLE_SCALENE') {
    ctx.moveTo(layer.w / 3, 0); 
    ctx.lineTo(layer.w, layer.h); 
    ctx.lineTo(0, layer.h); 
    ctx.closePath();
  } else if (layer.type === 'CIRCLE' || layer.type === 'ELLIPSE') {
    ctx.ellipse(layer.w / 2, layer.h / 2, Math.abs(layer.w / 2), Math.abs(layer.h / 2), 0, 0, 2 * Math.PI);
  }
};