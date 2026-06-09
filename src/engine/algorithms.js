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