# Base image
FROM oven/bun:latest

# 작업 디렉토리 설정
WORKDIR /app

# 필수 패키지 설치 (Python, 빌드 도구, Cairo 라이브러리)
RUN apt-get update && apt-get install -y \
  python3 \
  build-essential \
  libcairo2-dev \
  libpango1.0-dev \
  pkg-config \
  --no-install-recommends

# 불필요한 APT 캐시 삭제 (이미지 크기 최적화)
RUN rm -rf /var/lib/apt/lists/*

# 프로젝트 파일 복사
COPY package.json . 
COPY bun.lock .

# 의존성 설치
RUN bun install --production

# 소스 코드 복사
COPY src src

# 실행 명령
CMD ["bun", "src/index.ts"]
