// Tesla xLights model "Model S" from github.com/teslamotors/light-show.
// xLights numbers channels from 1. The light grid numbers them from 0.
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
