import "./style.css";
import videoSrc from "../ressources/video.mov?url";

const MAX_DISTANCE = 3500;
const MIN_DISTANCE = 3;
const TOTAL_DISTANCE = MAX_DISTANCE - MIN_DISTANCE;

document.querySelector<HTMLDivElement>("#video-container")!.innerHTML = `
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

const video = document.getElementById("video") as HTMLVideoElement;

video.addEventListener("loadeddata", () => {
  const duration = video.duration;
  console.log("duration", duration);

  video.controls = false;

  const setVideoTime = (distance: number): void => {
    const rawTime = Number(((distance * duration) / TOTAL_DISTANCE).toFixed(6));
    const time = Math.max(0, Math.min(duration, rawTime));
    console.log(time);

    video.currentTime = time;
  };

  let distance = 3;

  setInterval(() => {
    setVideoTime(distance);
    distance += 50;
  }, 500);
});
