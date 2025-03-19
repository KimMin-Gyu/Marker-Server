import { Elysia } from "elysia";
import { createCanvas, registerFont, loadImage } from "canvas";
import path from "path";

const app = new Elysia();
const cache = new Map();

const FONT_PATH = path.join(import.meta.dir, "fonts", "Pretendard-Bold.otf");

registerFont(FONT_PATH, { family: "Pretendard" });

const LOGO_PATH = path.join(import.meta.dir, "logo.png");

let logoImage: any = null;

const service = {
  loadLogo: async () => {
    if (!logoImage) {
      logoImage = await loadImage(LOGO_PATH);
    }
  },

  createMarker: async (price: number) => {
    const text = `${price || 334}원`;
    const scale = 0.5;

    const padding = 20 * scale;
    const textSize = 40 * scale;
    const bubbleWidth = 220 * scale;
    const bubbleHeight = 80 * scale;
    const pointerHeight = 15 * scale;

    const width = bubbleWidth + padding * 2;
    const height = bubbleHeight + pointerHeight + 40 * scale;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    ctx.shadowColor = "rgba(0, 0, 0, 0.2)";
    ctx.shadowBlur = 15 * scale;
    ctx.shadowOffsetY = 5 * scale;

    // 말풍선 배경
    ctx.fillStyle = "white";
    ctx.roundRect(padding, padding, bubbleWidth, bubbleHeight, 20 * scale);
    ctx.fill();

    // 삼각형 포인터
    ctx.shadowColor = "transparent";
    ctx.beginPath();
    ctx.moveTo(width / 2 - 10 * scale, bubbleHeight + padding);
    ctx.lineTo(width / 2, bubbleHeight + padding + pointerHeight);
    ctx.lineTo(width / 2 + 10 * scale, bubbleHeight + padding);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,1)";
    ctx.lineWidth = 2 * scale;
    ctx.stroke();

    // 가격 텍스트
    ctx.fillStyle = "black";
    ctx.font = `bold ${textSize}px Pretendard`;
    ctx.fillText(
      text,
      padding + 90 * scale,
      padding + bubbleHeight / 1.5,
      bubbleWidth - 80 * scale
    );

    // 로고 이미지 추가
    if (logoImage) {
      ctx.drawImage(
        logoImage,
        padding + 20 * scale,
        padding + 16 * scale,
        50 * scale,
        50 * scale
      );
    }

    return canvas.toBuffer();
  },
};

app
  .onStart(service.loadLogo) // 서버 시작 시 로고 로드
  .get("/marker", async ({ query, set }) => {
    const price = Number(query.price) || 334;
    const cacheKey = `marker-${price}`;

    if (cache.has(cacheKey)) {
      set.headers["Content-Type"] = "image/png";
      return new Response(cache.get(cacheKey));
    }

    const buffer = await service.createMarker(price);
    cache.set(cacheKey, buffer);

    set.headers["Content-Type"] = "image/png";
    return new Response(buffer);
  })
  .listen(3000, () => {
    console.log(`Server running at http://localhost:3000`);
  });
