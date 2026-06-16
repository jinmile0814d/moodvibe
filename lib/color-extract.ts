import sharp from 'sharp';

interface ColorBucket {
  r: number;
  g: number;
  b: number;
  count: number;
}

function toHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(c => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, '0')).join('');
}

function luminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function toPastel(r: number, g: number, b: number): [number, number, number] {
  return [
    r + (255 - r) * 0.7,
    g + (255 - g) * 0.7,
    b + (255 - b) * 0.7,
  ];
}

export async function extractColorsFromCover(coverUrl: string): Promise<[string, string] | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(coverUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    const { data, info } = await sharp(buffer)
      .resize(64, 64, { fit: 'cover' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const bucketShift = 5;
    const buckets = new Map<number, ColorBucket>();

    for (let i = 0; i < info.width * info.height * 3; i += 3) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const lum = luminance(r, g, b);
      if (lum < 0.08 || lum > 0.92) continue;

      const key = ((r >> bucketShift) << 10) | ((g >> bucketShift) << 5) | (b >> bucketShift);

      const existing = buckets.get(key);
      if (existing) {
        existing.r += r;
        existing.g += g;
        existing.b += b;
        existing.count++;
      } else {
        buckets.set(key, { r, g, b, count: 1 });
      }
    }

    const sorted = [...buckets.values()]
      .filter(b => b.count > 8)
      .sort((a, b) => b.count - a.count);

    if (sorted.length < 2) return null;

    const c1 = sorted[0];
    const r1 = c1.r / c1.count;
    const g1 = c1.g / c1.count;
    const b1 = c1.b / c1.count;

    const c2 = sorted[1];
    const r2 = c2.r / c2.count;
    const g2 = c2.g / c2.count;
    const b2 = c2.b / c2.count;

    const [pr1, pg1, pb1] = toPastel(r1, g1, b1);
    const [pr2, pg2, pb2] = toPastel(r2, g2, b2);

    return [toHex(pr1, pg1, pb1), toHex(pr2, pg2, pb2)];
  } catch {
    return null;
  }
}
