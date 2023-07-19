import './style.css';
// import videoSrc from '../ressources/Trial_2.mp4';
import { io } from 'socket.io-client';
import Controller from './controller';
// import { distanceDown, distanceUp } from './mockDistance';
// import VideoCanvas from './videoCanvas';

// const socket = io('http://localhost:3000');
const socket = io('https://raspberrypi.local:3000');

// distance in cm
const MAX_DISTANCE = 150;
const MIN_DISTANCE = 0.3;
const TOTAL_DISTANCE = MAX_DISTANCE - MIN_DISTANCE;

const controller = new Controller({
  maxDistance: MAX_DISTANCE,
  minDistance: MIN_DISTANCE,
  totalDistance: TOTAL_DISTANCE,
});

await controller.init();

socket.on('distance', (newDistance: number) => {
  controller.update(newDistance);
});


controller.update(30);
// distanceUp(MIN_DISTANCE, MAX_DISTANCE, controller.update);
// distanceDown(MIN_DISTANCE, MAX_DISTANCE, controller.update);
