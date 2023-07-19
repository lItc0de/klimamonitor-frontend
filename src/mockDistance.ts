const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const distanceDown = async (
  minDistance: number,
  maxDistance: number,
  callbackFn: (distance: number) => void
) => {
  for (let distance = maxDistance; distance > minDistance; distance--) {
    callbackFn(distance);
    await timer(500);
  }
};


export const distanceUp = async (
  minDistance: number,
  maxDistance: number,
  callbackFn: (distance: number) => void
) => {
  for (let distance = minDistance; distance < maxDistance; distance++) {
    callbackFn(distance);
    await timer(500);
  }
};
