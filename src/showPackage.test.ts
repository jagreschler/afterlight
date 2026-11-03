import { unzipSync } from "fflate";
import { describe, expect, it } from "vitest";
import { buildShowZip } from "./showPackage";

const SHOW_NAME = "the-eagles-hotel-california";
const FSEQ_NAME = `${SHOW_NAME}.fseq`;
const WAV_NAME = `${SHOW_NAME}.wav`;
const NOTE_NAME = "README.txt";
const LIGHTSHOW_FOLDER = "LightShow";
const COPY_LINE = "Copy the .fseq and .wav files into the LightShow folder. Both files must have the same name.";
const OLD_FSEQ_NAME = "lightshow.fseq";
const FSEQ_BYTES = new Uint8Array([1, 2, 3, 4]);
const WAV_BYTES = new Uint8Array([5, 6, 7]);

describe("buildShowZip", () => {
  it("packs the named light show files and a USB note", () => {
    const zipped = buildShowZip(SHOW_NAME, FSEQ_BYTES, WAV_BYTES);
    const files = unzipSync(zipped);

    expect(sortedNames(files)).toEqual([FSEQ_NAME, NOTE_NAME, WAV_NAME].sort());
    expect(files[FSEQ_NAME]).toEqual(FSEQ_BYTES);
    expect(files[WAV_NAME]).toEqual(WAV_BYTES);

    const note = decode(files[NOTE_NAME]);
    expect(note).toContain(LIGHTSHOW_FOLDER);
    expect(note).toContain(COPY_LINE);
    expect(note).not.toContain(OLD_FSEQ_NAME);
  });
});

function sortedNames(files: Record<string, Uint8Array>): string[] {
  const names: string[] = [];
  for (const name of Object.keys(files)) {
    names.push(name);
  }
  names.sort();
  return names;
}

function decode(bytes: Uint8Array | undefined): string {
  if (bytes === undefined) {
    return "";
  }
  return new TextDecoder().decode(bytes);
}
