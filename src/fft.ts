// Real samples in, magnitude of the lower half of the spectrum out.
// The length must be a power of two. 2048 is the size the analyzer uses.
export function magnitudeSpectrum(samples: Float32Array): Float32Array {
  const size = samples.length;
  const real = new Float32Array(size);
  const imag = new Float32Array(size);

  for (let index = 0; index < size; index += 1) {
    const hann = 0.5 * (1 - Math.cos((2 * Math.PI * index) / size));
    real[index] = (samples[index] ?? 0) * hann;
  }

  transform(real, imag);

  const bins = size / 2;
  const magnitude = new Float32Array(bins);
  for (let bin = 0; bin < bins; bin += 1) {
    magnitude[bin] = Math.hypot(real[bin] ?? 0, imag[bin] ?? 0);
  }
  return magnitude;
}

function transform(real: Float32Array, imag: Float32Array): void {
  const size = real.length;
  reverseBits(real, imag);

  for (let length = 2; length <= size; length *= 2) {
    const half = length / 2;
    const angle = (-2 * Math.PI) / length;
    for (let start = 0; start < size; start += length) {
      for (let offset = 0; offset < half; offset += 1) {
        const even = start + offset;
        const odd = even + half;
        const twiddle = angle * offset;
        const wr = Math.cos(twiddle);
        const wi = Math.sin(twiddle);
        const oddReal = (real[odd] ?? 0) * wr - (imag[odd] ?? 0) * wi;
        const oddImag = (real[odd] ?? 0) * wi + (imag[odd] ?? 0) * wr;
        const evenReal = real[even] ?? 0;
        const evenImag = imag[even] ?? 0;
        real[even] = evenReal + oddReal;
        imag[even] = evenImag + oddImag;
        real[odd] = evenReal - oddReal;
        imag[odd] = evenImag - oddImag;
      }
    }
  }
}

function reverseBits(real: Float32Array, imag: Float32Array): void {
  const size = real.length;
  for (let index = 1, reversed = 0; index < size; index += 1) {
    let bit = size >> 1;
    while (reversed & bit) {
      reversed ^= bit;
      bit >>= 1;
    }
    reversed ^= bit;
    if (index < reversed) {
      swap(real, index, reversed);
      swap(imag, index, reversed);
    }
  }
}

function swap(values: Float32Array, left: number, right: number): void {
  const saved = values[left] ?? 0;
  values[left] = values[right] ?? 0;
  values[right] = saved;
}
