(() => {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  let width = 0;
  let height = 0;
  let frame = 0;
  let targetX = 0;
  let targetY = 0;
  let offsetX = 0;
  let offsetY = 0;

  // 固定坐标，避免刷新后星图随机变化。
  const points = [
    [.07, .13, 1.5], [.19, .21, 2],   [.33, .10, 1.3],
    [.46, .19, 2.2], [.67, .12, 1.5], [.84, .18, 2],
    [.95, .29, 1.2], [.11, .40, 1.2], [.25, .36, 2.7],
    [.40, .43, 1.4], [.55, .33, 2.4], [.73, .42, 1.7],
    [.88, .48, 2.7], [.06, .67, 1.6], [.19, .76, 2.1],
    [.37, .66, 1.4], [.51, .79, 2.3], [.65, .67, 1.3],
    [.78, .84, 2],   [.94, .72, 1.4], [.13, .90, 1],
    [.31, .91, 1.3], [.58, .94, 1.1], [.91, .94, 1]
  ];

  const constellation = [
    [1, 8], [8, 11], [11, 14], [14, 17],
    [8, 9], [9, 12], [12, 18], [18, 17],
    [3, 10], [10, 11], [5, 6]
  ];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    draw(0);
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);

    offsetX += (targetX - offsetX) * .045;
    offsetY += (targetY - offsetY) * .045;

    const cx = width * .48 + offsetX * .5;
    const cy = height * .5 + offsetY * .5;
    const radius = Math.min(width * .43, height * .41);

    // 观测坐标环
    ctx.strokeStyle = "rgba(89, 117, 105, .28)";
    ctx.lineWidth = 1;

    [1, .72, .43].forEach(scale => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * scale, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-.32);
    ctx.beginPath();
    ctx.ellipse(
      0, 0,
      radius * 1.17,
      radius * .43,
      0, 0, Math.PI * 2
    );
    ctx.strokeStyle = "rgba(170, 100, 77, .46)";
    ctx.stroke();
    ctx.restore();

    ctx.setLineDash([3, 7]);
    ctx.beginPath();
    ctx.moveTo(cx - radius * 1.1, cy);
    ctx.lineTo(cx + radius * 1.1, cy);
    ctx.moveTo(cx, cy - radius * 1.1);
    ctx.lineTo(cx, cy + radius * 1.1);
    ctx.strokeStyle = "rgba(89, 117, 105, .18)";
    ctx.stroke();
    ctx.setLineDash([]);

    // 星座连线
    ctx.strokeStyle = "rgba(130, 100, 78, .32)";
    constellation.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(
        points[a][0] * width + offsetX,
        points[a][1] * height + offsetY
      );
      ctx.lineTo(
        points[b][0] * width + offsetX,
        points[b][1] * height + offsetY
      );
      ctx.stroke();
    });

    // 星点
    points.forEach(([x, y, starRadius], index) => {
      const pulse = reduceMotion.matches
        ? 1
        : .9 + Math.sin(time * .00065 + index * 1.8) * .1;

      ctx.beginPath();
      ctx.arc(
        x * width + offsetX,
        y * height + offsetY,
        starRadius * pulse,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = index % 5 === 0
        ? "rgba(170, 100, 77, .78)"
        : "rgba(56, 91, 78, .68)";
      ctx.fill();
    });

    // 少量十字星
    [8, 11, 18].forEach(index => {
      const [x, y] = points[index];
      const px = x * width + offsetX;
      const py = y * height + offsetY;

      ctx.beginPath();
      ctx.moveTo(px - 8, py);
      ctx.lineTo(px + 8, py);
      ctx.moveTo(px, py - 8);
      ctx.lineTo(px, py + 8);
      ctx.strokeStyle = "rgba(170, 100, 77, .48)";
      ctx.stroke();
    });
  }

  function animate(time) {
    draw(time);
    frame = requestAnimationFrame(animate);
  }

  const observatory = canvas.parentElement;

  observatory.addEventListener("pointermove", event => {
    if (reduceMotion.matches) return;

    const rect = canvas.getBoundingClientRect();
    targetX = ((event.clientX - rect.left) / rect.width - .5) * 22;
    targetY = ((event.clientY - rect.top) / rect.height - .5) * 22;
  }, { passive: true });

  observatory.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
  });

  function updateMotion() {
    cancelAnimationFrame(frame);
    targetX = targetY = offsetX = offsetY = 0;

    if (reduceMotion.matches) {
      draw(0);
    } else {
      frame = requestAnimationFrame(animate);
    }
  }

  window.addEventListener("resize", resize);
  reduceMotion.addEventListener("change", updateMotion);

  resize();
  updateMotion();
})();
