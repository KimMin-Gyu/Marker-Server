import express from "express";
import { createCanvas, registerFont } from "canvas";
import fs from "fs";
import path from "path";
import { loadImage } from "canvas";
const app = express();
const port = 3000;

const service = {
  createMarker: async (price) => {
    const text = (price || "334") + "원"; // 기본값
    const padding = 20;
    const textSize = 40;
    const bubbleWidth = 220;
    const bubbleHeight = 80;
    const pointerHeight = 15;

    // 캔버스 크기 결정
    const width = bubbleWidth + padding * 2;
    const height = bubbleHeight + pointerHeight + 40;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");
    registerFont(path.resolve("./fonts/Pretendard-Bold.otf"), {
      family: "Pretendard",
    });

    // 그림자 설정
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 5;

    // 배경 (말풍선)
    ctx.fillStyle = "white";
    ctx.roundRect(padding, padding, bubbleWidth, bubbleHeight, 20);
    ctx.fill();

    ctx.shadowColor = "transparent";

    // 말풍선 꼬리
    ctx.beginPath();
    ctx.moveTo(width / 2 - 10, bubbleHeight + padding);
    ctx.lineTo(width / 2, bubbleHeight + padding + pointerHeight);
    ctx.lineTo(width / 2 + 10, bubbleHeight + padding);
    ctx.closePath();
    ctx.fill();

    // 테두리
    ctx.strokeStyle = "rgba(255,255,255,1)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 텍스트
    ctx.fillStyle = "black";
    ctx.font = `bold ${textSize}px Pretendard`;
    ctx.fillText(
      text,
      padding + 90,
      padding + bubbleHeight / 1.5,
      bubbleWidth - 80
    );

    // 로고
    const logo = await loadImage(path.resolve("./logo.png"));
    ctx.drawImage(logo, padding + 20, padding + 16, 50, 50);

    return canvas;
  },
};

const cache = new Map();

// 마커 생성 API
app.get("/marker", async (req, res) => {
  const price = req.query.price || 334;

  console.log("request");

  const cacheKey = `marker-${price}`;

  if (cache.has(cacheKey)) {
    const canvas = cache.get(cacheKey);
    canvas.createPNGStream().pipe(res);
    return;
  }

  const canvas = await service.createMarker(price);
  cache.set(cacheKey, canvas);
  res.setHeader("Content-Type", "image/png");

  canvas.createPNGStream().pipe(res);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
