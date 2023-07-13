import './style.css';
import videoSrc from '../ressources/FullVideo.mp4';
import { io } from 'socket.io-client';
import Controller from './controller';

// const socket = io('http://localhost:3000');
const socket = io('https://raspberrypi.local:3000');

// distance in cm
const MAX_DISTANCE = 150;
const MIN_DISTANCE = 0.3;
const TOTAL_DISTANCE = MAX_DISTANCE - MIN_DISTANCE;

document.querySelector<HTMLDivElement>('#video-container')!.innerHTML = `
<video
  id="video"
  src="${videoSrc}"
  controls="false"
  crossorigin="anonymous"
  width="100%"
  height="100%"
  muted="muted"
/>
`;

const video = document.getElementById('video') as HTMLVideoElement;

video.addEventListener('loadeddata', () => {
  video.controls = false;

  const controller = new Controller(video, {
    maxDistance: MAX_DISTANCE,
    minDistance: MIN_DISTANCE,
    totalDistance: TOTAL_DISTANCE,
  });

  // const setVideoTime = (distance: number): void => {
  //   const rawTime = Number(((distance * duration) / TOTAL_DISTANCE).toFixed(6));
  //   const time = Math.max(0, Math.min(duration, rawTime));
  //   console.log(time);

  //   controller.updateCurrentTime(time);
  // };

  socket.on('distance', (newDistance: number) => {
    controller.update(newDistance);
  });
});
