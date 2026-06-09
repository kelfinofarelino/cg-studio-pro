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