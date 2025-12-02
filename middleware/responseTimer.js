// middlewares/responseTimer.js
export function responseTimer(req, res, next) {
  const start = process.hrtime(); // high-precision timer

  res.on("finish", () => {
    const diff = process.hrtime(start);
    const timeInMs = diff[0] * 1000 + diff[1] / 1e6;
    console.log(`${req.method} ${req.originalUrl} took ${timeInMs.toFixed(2)} ms`);
  });

  next();
}
