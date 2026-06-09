export function handleSelection(layers, mx, my) {
  for (let i = layers.length - 1; i >= 0; i--) {
    const l = layers[i];
    if (mx >= l.x && mx <= l.x + l.w && my >= l.y && my <= l.y + l.h) {
      return i;
    }
  }
  return -1;
}