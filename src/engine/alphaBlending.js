export function applyAlphaBlending(ctx, mode = 'source-over') {
  ctx.globalCompositeOperation = mode;
}