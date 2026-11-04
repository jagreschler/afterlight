import { access, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { build } from "vite";
import { describe, expect, it } from "vitest";

const PROJECT = process.cwd();
const FRONT = "tesla-model-3-front";
const PLACES = ["public/tesla-model-3-front.jpg", "src/assets/tesla-model-3-front.jpg"];
const BUILD_MS = 20000;

describe("car photo file names", () => {
  it("keeps the same emitted file name for the same photo bytes", async () => {
    const bytes = await readFile(await sourcePhoto());
    const first = await emittedFrontName(bytes);
    const second = await emittedFrontName(bytes);
    expect(second).toBe(first);
  }, BUILD_MS);

  it("emits a different file name when the photo bytes change", async () => {
    const bytes = await readFile(await sourcePhoto());
    const changed = Uint8Array.from(bytes);
    const last = changed.length - 1;
    const bite = changed[last];
    if (bite === undefined) {
      throw new Error("empty photo");
    }
    changed[last] = bite === 0 ? 1 : 0;
    const first = await emittedFrontName(bytes);
    const second = await emittedFrontName(changed);
    expect(second).not.toBe(first);
  }, BUILD_MS);
});

async function sourcePhoto(): Promise<string> {
  for (const relative of PLACES) {
    const path = join(PROJECT, relative);
    try {
      await access(path);
      return path;
    } catch {
      continue;
    }
  }
  throw new Error("missing front photo");
}

async function emittedFrontName(bytes: Uint8Array): Promise<string> {
  const photoPath = await sourcePhoto();
  const original = await readFile(photoPath);
  const outDir = await mkdtemp(join(tmpdir(), "afterlight-photo-"));
  try {
    await writeFile(photoPath, bytes);
    await build({
      root: PROJECT,
      logLevel: "silent",
      build: {
        outDir,
        emptyOutDir: true,
        minify: false,
        cssMinify: false,
        reportCompressedSize: false,
      },
    });
    const names = await jpgNames(outDir);
    const front = names.find((name) => name.includes(FRONT));
    if (front === undefined) {
      throw new Error(`missing front photo in ${names.join(", ")}`);
    }
    return front;
  } finally {
    await writeFile(photoPath, original);
    await rm(outDir, { recursive: true, force: true });
  }
}

async function jpgNames(dir: string): Promise<string[]> {
  const names: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await jpgNames(path);
      names.push(...nested);
    } else if (entry.name.endsWith(".jpg")) {
      names.push(entry.name);
    }
  }
  return names;
}
