import { mkdir, readFile, writeFile } from "node:fs/promises";

const width = 64;
const height = 64;
const radius = 14;
const bitmapHeaderSize = 40;
const xorRowSize = width * 4;
const andRowSize = Math.ceil(width / 32) * 4;
const imageSize = bitmapHeaderSize + xorRowSize * height + andRowSize * height;
const output = Buffer.alloc(6 + 16 + imageSize);

function insideRoundedSquare(x, y) {
  const nearHorizontalEdge = x >= radius && x < width - radius;
  const nearVerticalEdge = y >= radius && y < height - radius;
  if (nearHorizontalEdge || nearVerticalEdge) return true;

  const centerX = x < radius ? radius : width - radius - 1;
  const centerY = y < radius ? radius : height - radius - 1;
  return Math.hypot(x - centerX, y - centerY) <= radius;
}

function distanceToSegment(x, y, startX, startY, endX, endY) {
  const dx = endX - startX;
  const dy = endY - startY;
  const lengthSquared = dx * dx + dy * dy;
  const projection = Math.max(
    0,
    Math.min(1, ((x - startX) * dx + (y - startY) * dy) / lengthSquared),
  );
  return Math.hypot(x - (startX + projection * dx), y - (startY + projection * dy));
}

function pixelAt(x, y) {
  if (!insideRoundedSquare(x, y)) return [0, 0, 0, 0];

  const isLeftStem = x >= 13 && x <= 19 && y >= 17 && y <= 47;
  const isRightStem = x >= 35 && x <= 41 && y >= 17 && y <= 47;
  const isDiagonal = distanceToSegment(x, y, 18, 18, 36, 46) <= 3.4;
  const isSlash = distanceToSegment(x, y, 48, 47, 57, 17) <= 2.5;

  if (isSlash) return [216, 255, 114, 255];
  if (isLeftStem || isRightStem || isDiagonal) return [255, 253, 247, 255];
  return [23, 33, 29, 255];
}

// ICONDIR and ICONDIRENTRY.
output.writeUInt16LE(0, 0);
output.writeUInt16LE(1, 2);
output.writeUInt16LE(1, 4);
output[6] = width;
output[7] = height;
output.writeUInt16LE(1, 10);
output.writeUInt16LE(32, 12);
output.writeUInt32LE(imageSize, 14);
output.writeUInt32LE(22, 18);

// BITMAPINFOHEADER. ICO stores the XOR and transparency-mask heights together.
const bitmapOffset = 22;
output.writeUInt32LE(bitmapHeaderSize, bitmapOffset);
output.writeInt32LE(width, bitmapOffset + 4);
output.writeInt32LE(height * 2, bitmapOffset + 8);
output.writeUInt16LE(1, bitmapOffset + 12);
output.writeUInt16LE(32, bitmapOffset + 14);
output.writeUInt32LE(xorRowSize * height, bitmapOffset + 20);

const xorOffset = bitmapOffset + bitmapHeaderSize;
const andOffset = xorOffset + xorRowSize * height;

for (let sourceY = 0; sourceY < height; sourceY += 1) {
  const targetY = height - sourceY - 1;
  for (let x = 0; x < width; x += 1) {
    const [red, green, blue, alpha] = pixelAt(x, sourceY);
    const pixelOffset = xorOffset + targetY * xorRowSize + x * 4;
    output[pixelOffset] = blue;
    output[pixelOffset + 1] = green;
    output[pixelOffset + 2] = red;
    output[pixelOffset + 3] = alpha;

    if (alpha === 0) {
      output[andOffset + targetY * andRowSize + Math.floor(x / 8)] |=
        1 << (7 - (x % 8));
    }
  }
}

const destination = new URL("../src/app/favicon.ico", import.meta.url);
const checkOnly = process.argv.includes("--check");

if (checkOnly) {
  const committed = await readFile(destination).catch(() => null);
  if (!committed?.equals(output)) {
    console.error("Committed favicon.ico does not match the deterministic generator.");
    process.exitCode = 1;
  } else {
    console.log(`Verified deterministic favicon.ico (${width}x${height}).`);
  }
} else {
  await mkdir(new URL("../src/app/", import.meta.url), { recursive: true });
  await writeFile(destination, output);
  console.log(
    `Generated ${destination.pathname} (${output.length} bytes, ${width}x${height}).`,
  );
}
