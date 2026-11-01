// Model 3 and Model Y play the same 200-channel FSEQ as the other Teslas.
// teslamotors/light-show authors that file on the xLights "Model S" controller
// (MaxChannels 200). xLights counts from 1. This grid counts from 0.
//
// Headlights and turn signals are separate left/right outputs on 3/Y.
// These are not, so pulse does not use them: xLights 7–12 (channels 4–6)
// share one bulb, and xLights 17–20 (aux park and side markers) share another.
// Model 3 Standard Range+ has no front fog (xLights 15–16) and no aux park.
export const CHANNEL_COUNT = 200;

function xlights(channelNumber: number): number {
  return channelNumber - 1;
}

export const HEADLIGHTS = [
  xlights(1), // Left outer main beam
  xlights(2), // Right outer main beam
  xlights(3), // Left inner main beam
  xlights(4), // Right inner main beam
] as const;

export const TURN_SIGNALS = [
  xlights(13), // Left front turn
  xlights(14), // Right front turn
  xlights(23), // Left rear turn
  xlights(24), // Right rear turn
] as const;

export const LIGHTS = [...HEADLIGHTS, ...TURN_SIGNALS];
