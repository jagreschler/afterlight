import { strToU8, zipSync } from "fflate";

const FSEQ_NAME = "lightshow.fseq";
const WAV_NAME = "lightshow.wav";
const NOTE_NAME = "README.txt";

// Wording follows the USB steps in the teslamotors/light-show README.
const USB_NOTE = [
  "Format the USB drive as exFAT or FAT32 (MS-DOS FAT on a Mac). Do not use NTFS.",
  "At the root of the drive, create a folder named LightShow. The name is case sensitive.",
  "Copy lightshow.fseq and lightshow.wav into the LightShow folder. The file names must match.",
  "Plug the drive into a front USB port or the glovebox USB port.",
  "On the car, open Toybox, select Light Show, and tap Schedule Show.",
].join("\n");

export function buildShowZip(fseq: Uint8Array, wav: Uint8Array): Uint8Array {
  const files: Record<string, Uint8Array> = {};
  files[FSEQ_NAME] = fseq;
  files[WAV_NAME] = wav;
  files[NOTE_NAME] = strToU8(USB_NOTE);
  return zipSync(files);
}
