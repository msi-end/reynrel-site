// In-memory fixed-window limiter (single process). Put a shared store in front if you scale out.
export function rateLimit({ windowMs = 15 * 60 * 1000, max = 20, message = 'Too many requests. Please try again later.' } = {}) {
  const hits = new Map();
  setInterval(() => {
    const t = Date.now();
    for (const [k, v] of hits) if (v.reset < t) hits.delete(k);
  }, windowMs).unref();
  return (req, res, next) => {
    const key = `${req.ip}|${req.baseUrl}${req.path}`;
    const t = Date.now();
    let e = hits.get(key);
    if (!e || e.reset < t) hits.set(key, (e = { n: 0, reset: t + windowMs }));
    if (++e.n > max) {
      res.setHeader('Retry-After', Math.ceil((e.reset - t) / 1000));
      return res.status(429).json({ error: message });
    }
    next();
  };
}
