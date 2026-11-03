import { strToU8, zipSync } from "fflate";

const NOTE_NAME = "README.txt";

// Wording follows the USB steps in the teslamotors/light-show README.
// Matching names such as show1.fseq and show1.wav are allowed.
const USB_NOTE = [
  "Format the USB drive as exFAT or FAT32 (MS-DOS FAT on a Mac). Do not use NTFS.",
  "At the root of the drive, create a folder named LightShow. The name is case sensitive.",
  "Copy the .fseq and .wav files into the LightShow folder. Both files must have the same name.",
  "Plug the drive into a front USB port or the glovebox USB port.",
  "On the car, open Toybox, select Light Show, and tap Schedule Show.",
].join("\n");

export function buildShowZip(name: string, fseq: Uint8Array, wav: Uint8Array): Uint8Array {
  const files: Record<string, Uint8Array> = {};
  files[`${name}.fseq`] = fseq;
  files[`${name}.wav`] = wav;
  files[NOTE_NAME] = strToU8(USB_NOTE);
  return zipSync(files);
}
