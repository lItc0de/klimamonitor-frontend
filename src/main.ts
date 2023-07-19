import './style.css';

import { io } from 'socket.io-client';
import Controller from './controller';

const socket = io(import.meta.env.VITE_SOCKET_URL);

// distance in cm
const MAX_DISTANCE = 150;
const MIN_DISTANCE = 0.3;
const TOTAL_DISTANCE = MAX_DISTANCE - MIN_DISTANCE;

const controller = new Controller({
  maxDistance: MAX_DISTANCE,
  minDistance: MIN_DISTANCE,
  totalDistance: TOTAL_DISTANCE,
});

const init = async () => {
  await controller.init();

  socket.on('distance', (newDistance: number) => {
    controller.update(newDistance);
  });

  // controller.update(30);
};

init();

// distanceUp(MIN_DISTANCE, MAX_DISTANCE, controller.update);
// distanceDown(MIN_DISTANCE, MAX_DISTANCE, controller.update);
