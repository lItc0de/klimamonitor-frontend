// import Stage from './stage';
// import VideoCanvas from './videoCanvas';

import timelapseSrc from '../ressources/Part1.mp4';
import zoomOutSrc from '../ressources/ZoomOut.mp4';
import zoomInSrc from '../ressources/ZoomIn.mp4';
import earthRotateSrc from '../ressources/EarthRotation.mp4';

const realityNewsModules = import.meta.glob('../ressources/news/Realität*.png');
const fictionNewsModules = import.meta.glob('../ressources/news/*_Fiktion.png');

type Direction = 'forwards' | 'backwards';

// type Stages = {
//   groundRotation: Stage;
//   zoomOut1: Stage;
//   timelapse: Stage;
//   zoomOut2: Stage;
//   earthRotation: Stage;
// };

type ControllerConfig = {
  totalDistance: number;
  maxDistance: number;
  minDistance: number;
};

class Controller {
  // private stages: Stages = {
  //   groundRotation: new Stage({
  //     startTime: 1,
  //     endTime: 17,
  //     stageNumber: 1,
  //     distanceSpanPercent: 20,
  //     playbackRate: 2,
  //     loop: true,
  //   }),
  //   zoomOut1: new Stage({
  //     startTime: 17,
  //     endTime: 23,
  //     stageNumber: 2,
  //     distanceSpanPercent: 20,
  //     playbackRate: 2,
  //     loop: false,
  //   }),
  //   timelapse: new Stage({
  //     startTime: 23,
  //     endTime: 37,
  //     stageNumber: 3,
  //     distanceSpanPercent: 20,
  //     playbackRate: 2,
  //     loop: true,
  //   }),
  //   zoomOut2: new Stage({
  //     startTime: 37,
  //     endTime: 54,
  //     stageNumber: 4,
  //     distanceSpanPercent: 20,
  //     playbackRate: 2,
  //     loop: false,
  //   }),
  //   earthRotation: new Stage({
  //     startTime: 54,
  //     endTime: 73,
  //     stageNumber: 5,
  //     distanceSpanPercent: 20,
  //     playbackRate: 2,
  //     loop: true,
  //   }),
  // };

  // private stages: Stages = {
  //   timelapse: new Stage({
  //     startTime: 0,
  //     endTime: 300,
  //     stageNumber: 1,
  //     distanceSpanPercent: 50,
  //     playbackRate: 1,
  //     loop: true,
  //   }),
  //   zoomOut1: new Stage({
  //     startTime: 300,
  //     endTime: 500,
  //     stageNumber: 2,
  //     distanceSpanPercent: 10,
  //     playbackRate: 1,
  //     loop: false,
  //   }),
  //   earthRotation: new Stage({
  //     startTime: 500,
  //     endTime: 800,
  //     stageNumber: 3,
  //     distanceSpanPercent: 40,
  //     playbackRate: 1,
  //     loop: true,
  //   }),
  // };

  // private videoCanvas: VideoCanvas;

  // private currentStage: Stage;
  // private desiredStage: Stage;
  // private previousStage: Stage | null;

  private totalDistance: number;
  private maxDistance: number;
  private minDistance: number;

  private distance: number;
  private previousDistance: number;

  private direction: Direction = 'forwards';
  // private previousDirection: Direction = 'forwards';

  timelapse: HTMLVideoElement;
  zoomOut: HTMLVideoElement;
  zoomIn: HTMLVideoElement;
  earthRotate: HTMLVideoElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  state = 0;

  news: HTMLImageElement[] = [];

  currentNews: CurrentNews[] = [];

  constructor(config: ControllerConfig) {
    this.timelapse = document.getElementById(
      'video-timelapse'
    ) as HTMLVideoElement;
    this.zoomOut = document.getElementById('video-zoomout') as HTMLVideoElement;
    this.zoomIn = document.getElementById('video-zoomin') as HTMLVideoElement;
    this.earthRotate = document.getElementById(
      'video-earthrotate'
    ) as HTMLVideoElement;

    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerWidth * 0.5625;
    const ctx = this.canvas.getContext('2d');
    if (ctx == null) throw new Error('Errorrr');
    this.ctx = ctx;

    this.ctx.font = '48px serif';
    this.ctx.fillStyle = 'white';

    this.canvas.addEventListener('click', () => {
      this.canvas.requestFullscreen();
    });

    // this.videoCanvas = videoCanvas;

    // this.currentStage = this.stages.groundRotation;
    // this.desiredStage = this.stages.groundRotation;

    // this.previousStage = null;

    this.totalDistance = config.totalDistance;
    this.maxDistance = config.maxDistance;
    this.minDistance = config.minDistance;

    this.distance = this.maxDistance;
    this.previousDistance = this.maxDistance;

    // if (!this.is100Percent(this.stages))
    //   throw new Error('More or less then 100%');

    // this.video.addEventListener('timeupdate', this.run);
    // this.video.playbackRate = -1;
    // this.video.currentTime = 12;

    // console.log(this.video.duration);

    // setInterval(this.run, 33);

    console.log('modules', newsModules);

    for (const path in newsModules) {
      const image = new Image();
      image.src = path;
      this.news.push(image);
    }
  }

  async init() {
    await this.setSrc(this.timelapse, timelapseSrc);
    await this.setSrc(this.zoomOut, zoomOutSrc);
    await this.setSrc(this.zoomIn, zoomInSrc);
    await this.setSrc(this.earthRotate, earthRotateSrc);

    this.populateCurrentNews();

    this.timelapse.addEventListener('ended', () => {
      if (this.state === 0) {
        this.timelapse.style.zIndex = '1';
        this.timelapse.play();
        return;
      }

      this.timelapse.style.zIndex = '-1';
      this.zoomOut.style.zIndex = '1';
      this.zoomOut.play();
    });

    this.zoomOut.addEventListener('ended', () => {
      if (this.state === 1) {
        this.zoomOut.style.zIndex = '-1';
        this.earthRotate.style.zIndex = '1';
        this.earthRotate.play();
        return;
      }

      this.zoomOut.style.zIndex = '-1';
      this.zoomIn.style.zIndex = '1';
      this.zoomIn.play();
    });

    this.zoomIn.addEventListener('ended', () => {
      if (this.state === 0) {
        this.zoomIn.style.zIndex = '-1';
        this.timelapse.style.zIndex = '1';
        this.timelapse.play();
        return;
      }

      this.zoomIn.style.zIndex = '-1';
      this.zoomOut.style.zIndex = '1';
      this.zoomOut.play();
    });

    this.earthRotate.addEventListener('ended', () => {
      if (this.state === 0) {
        this.earthRotate.style.zIndex = '-1';
        this.zoomIn.style.zIndex = '1';
        this.zoomIn.play();
        return;
      }

      this.earthRotate.style.zIndex = '1';
      this.earthRotate.play();
    });

    this.timelapse.style.zIndex = '1';
    this.timelapse.play();
  }

  // private play(video: HTMLVideoElement) {
  //   this.timelapse.style.zIndex = '-1';
  //   this.zoomOut.style.zIndex = '-1';
  //   this.earthRotate.style.zIndex = '-1';
  //   video.style.zIndex = '1';
  //   video.play();
  // }

  private async setSrc(video: HTMLVideoElement, src: string) {
    return new Promise((resolve) => {
      video.addEventListener('loadeddata', resolve);
      video.requestVideoFrameCallback(() => this.captureFrame(video));
      video.src = src;
      video.controls = false;
      video.playbackRate = 2;
      video.width = window.innerWidth;
      video.height = window.innerWidth * 0.5625;
    });
  }

  private captureFrame = (video: HTMLVideoElement) => {
    if (this.canvas.width !== window.innerWidth) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerWidth * 0.5625;
    }

    this.ctx.drawImage(
      video,
      0,
      0,
      window.innerWidth,
      window.innerWidth * 0.5625
    );
    // this.ctx.fillText(`width: ${window.innerWidth} | height: ${window.innerHeight}`, 10, 50);
    // this.ctx.fillText(`width: ${video.width} | height: ${video.height}`, 10, 200);

    this.drawNews();

    video.requestVideoFrameCallback(() => this.captureFrame(video));
  };

  // private get currentStageNumber(): number {
  //   return this.currentStage.stageNumber;
  // }

  // private get previousStageNumber(): number {
  //   return this.previousStage?.stageNumber || 0;
  // }

  update = (newDistance: number) => {
    this.updateDistance(newDistance);
    this.updateDirection();
    // this.updateDesiredStage();
    this.updateState();
  };

  private populateCurrentNews() {
    this.currentNews.push({
      image: this.news[0],
      time: 0,
    });

    this.currentNews.push({
      image: this.news[1],
      time: 0,
    });

    this.currentNews.push({
      image: this.news[2],
      time: 0,
    });
  }

  private drawNews() {
    if (this.earthRotate.paused) return;

    this.currentNews.forEach((news, i) => {
      const screentime = 1000;
      if (news.time > screentime + (screentime / 3) * i) {
        news.image = this.getRandomNewNews();
        news.time = 0;
      }

      const imageWidth = news.image.width;
      const imageHeight = news.image.height;
      const width = innerWidth / 4;
      const height = (imageHeight * width) / imageWidth;
      const { x, y } = this.getPosition(i, width, height);
      this.ctx.drawImage(news.image, x, y, width, height);
      news.time += 1;
    });
  }

  private getRandomNewNews(): HTMLImageElement {
    const relevantNews = this.news.filter(
      (item) => !this.currentNews.map(({ image }) => image).includes(item)
    );
    return relevantNews[Math.floor(Math.random() * relevantNews.length)];
  }

  private getPosition(
    i: number,
    iw: number,
    ih: number
  ): { x: number; y: number } {
    const width = window.innerWidth;
    const height = width * 0.5625;

    let x = 0;
    let y = 0;

    let padding = width * 0.06;

    if (i === 0) x= padding, y = padding ;
    if (i === 1) {
      x = window.innerWidth - (iw + padding);
      y =  height / 2 - ih;
    }
    if (i === 2) {
      x = (width / 2) - (iw / 1.5)
      y =  height - (ih + padding);
    }

    return { x, y };
  }

  private updateState() {
    if (this.state === 0 && this.distance < 120) {
      this.state = 1;
    }

    if (this.state === 1 && this.distance >= 120) {
      this.state = 0;
    }
  }

  private handleVideos() {
    console.log('HandleVideos with new state:', this.state);

    if (this.state === 0) {
      if (this.timelapse.paused) {
        this.timelapse.play();
      }

      if (!this.earthRotate.paused) {
        const onZoomOutEnded = () => {
          this.zoomOut.removeEventListener('ended', onZoomOutEnded);

          this.zoomOut.style.zIndex = '-1';
          this.timelapse.style.zIndex = '1';
          this.earthRotate.style.zIndex = '-1';
          this.timelapse.play();

          this.earthRotate.pause();
          this.earthRotate.currentTime = 0;

          this.zoomOut.pause();
          this.zoomOut.currentTime = 0;
        };

        const onEarthRotateEnded = () => {
          this.earthRotate.removeEventListener('ended', onEarthRotateEnded);
          this.zoomOut.addEventListener('ended', onZoomOutEnded);

          this.zoomOut.style.zIndex = '1';
          this.earthRotate.style.zIndex = '-1';
          this.timelapse.style.zIndex = '-1';
          this.zoomOut.play();

          this.earthRotate.pause();
          this.earthRotate.currentTime = 0;

          this.timelapse.pause();
          this.timelapse.currentTime = 0;
        };
        this.earthRotate.addEventListener('ended', onEarthRotateEnded);
      }

      if (!this.zoomOut.paused) {
        const onZoomOutEnded = () => {
          this.zoomOut.removeEventListener('ended', onZoomOutEnded);

          this.timelapse.style.zIndex = '1';
          this.zoomOut.style.zIndex = '-1';
          this.earthRotate.style.zIndex = '-1';
          this.timelapse.play();

          this.earthRotate.pause();
          this.earthRotate.currentTime = 0;

          this.zoomOut.pause();
          this.zoomOut.currentTime = 0;
        };

        this.zoomOut.addEventListener('ended', onZoomOutEnded);
      }
    }

    if (this.state === 1) {
      if (this.earthRotate.paused) {
        this.earthRotate.play();
      }

      if (!this.timelapse.paused) {
        const onZoomOutEnded = () => {
          this.zoomOut.removeEventListener('ended', onZoomOutEnded);

          this.earthRotate.style.zIndex = '1';
          this.timelapse.style.zIndex = '-1';
          this.zoomOut.style.zIndex = '-1';
          this.earthRotate.play();

          this.timelapse.pause();
          this.timelapse.currentTime = 0;

          this.zoomOut.pause();
          this.zoomOut.currentTime = 0;
        };

        const onTimelapseEnded = () => {
          this.timelapse.removeEventListener('ended', onTimelapseEnded);
          this.zoomOut.addEventListener('ended', onZoomOutEnded);

          this.zoomOut.style.zIndex = '1';
          this.earthRotate.style.zIndex = '-1';
          this.timelapse.style.zIndex = '-1';
          this.zoomOut.play();

          this.earthRotate.pause();
          this.earthRotate.currentTime = 0;

          this.timelapse.pause();
          this.timelapse.currentTime = 0;
        };
        this.timelapse.addEventListener('ended', onTimelapseEnded);
      }

      if (!this.zoomOut.paused) {
        const onZoomOutEnded = () => {
          this.zoomOut.removeEventListener('ended', onZoomOutEnded);

          this.earthRotate.style.zIndex = '1';
          this.timelapse.style.zIndex = '1';
          this.zoomOut.style.zIndex = '-1';
          this.earthRotate.play();

          this.timelapse.pause();
          this.timelapse.currentTime = 0;

          this.zoomOut.pause();
          this.zoomOut.currentTime = 0;
        };

        this.zoomOut.addEventListener('ended', onZoomOutEnded);
      }
    }
  }

  // private run = () => {
  //   if (this.direction === 'forwards') {
  //     this.handleForwards();
  //   } else {
  //     this.handleBackwards();
  //   }

  //   // this.updateCurrentStage();

  //   // if (this.currentStage === this.desiredStage) {
  //   //   if (this.direction === 'forwards') {
  //   //     const needsJump =
  //   //       this.videoCanvas.currentFrameIndex >= this.currentStage.endTime;

  //   //     if (needsJump && this.currentStage.loop) {
  //   //       this.videoCanvas.jumpToFrame(this.currentStage.startTime);
  //   //     }

  //   //     return;
  //   //   }

  //   //   if (this.direction === 'backwards') {
  //   //     const needsJump =
  //   //       this.videoCanvas.currentFrameIndex <= this.currentStage.startTime;

  //   //     if (needsJump && this.currentStage.loop) {
  //   //       this.videoCanvas.jumpToFrame(this.currentStage.endTime);
  //   //     }

  //   //     return;
  //   //   }
  //   // }

  //   // if (this.currentStage.stageNumber > this.desiredStage.stageNumber) {
  //   //   if (this.direction === 'forwards') {
  //   //     const needsJump =
  //   //       this.videoCanvas.currentFrameIndex >= this.currentStage.endTime;

  //   //     if (needsJump && this.currentStage.loop) {
  //   //       this.videoCanvas.jumpToFrame(this.currentStage.startTime);
  //   //     }
  //   //   }
  //   //   return;
  //   // }

  //   // if (this.currentStage.stageNumber < this.desiredStage.stageNumber) {
  //   //   if (this.direction === 'backwards') {
  //   //     const needsJump =
  //   //       this.videoCanvas.currentFrameIndex <= this.currentStage.startTime;

  //   //     if (needsJump && this.currentStage.loop) {
  //   //       this.videoCanvas.jumpToFrame(this.currentStage.endTime);
  //   //     }
  //   //   }
  //   //   return;
  //   // }

  //   // console.log('run', {
  //   //   curr: this.video.currentTime,
  //   //   dur: this.video.duration,
  //   // });
  // };

  // private handleForwards() {
  //   this.videoCanvas.nextFrame();

  //   console.log({ frame: this.videoCanvas.currentFrameIndex, distance: this.distance });

  //   if (this.videoCanvas.currentFrameIndex >= 54 && this.distance >= 120) {
  //     this.videoCanvas.jumpToFrame(0);
  //   }

  //   if (this.videoCanvas.currentFrameIndex >= 386 && this.distance < 120) {
  //     this.videoCanvas.jumpToFrame(240);
  //   }
  // }

  // private handleBackwards() {
  //   this.videoCanvas.previousFrame();
  // }

  private updateDirection() {
    const distanceDiff = Math.abs(this.previousDistance - this.distance);
    if (distanceDiff < 10) return;

    const newDirection =
      this.distance >= this.previousDistance ? 'backwards' : 'forwards';

    if (newDirection !== this.direction) {
      this.direction = newDirection;
      console.log(this.direction);
    }
  }

  private updateDistance(newDistance: number) {
    this.distance = Math.max(
      0,
      Math.min(this.totalDistance, newDistance - this.minDistance)
    );
    console.log('Update distance:', this.distance);
  }

  // private updateCurrentStage() {
  //   const newStage = Object.values(this.stages).find(
  //     ({ startTime, endTime }) => {
  //       return (
  //         startTime <= this.videoCanvas.currentFrameIndex &&
  //         endTime > this.videoCanvas.currentFrameIndex
  //       );
  //     }
  //   );

  //   if (newStage != null && newStage !== this.currentStage) {
  //     this.currentStage = newStage;
  //     console.log('set Stage:', newStage);
  //   }
  // }

  // private updateDesiredStage() {
  //   const percent = 100 - (this.distance * 100) / this.totalDistance;

  //   Object.values(this.stages).reduce((partialPercentage, stage) => {
  //     const percentageSum = partialPercentage + stage.distanceSpanPercent;
  //     if (this.desiredStage === stage) return percentageSum;

  //     if (percent >= partialPercentage && percent <= percentageSum) {
  //       this.desiredStage = stage;
  //       console.log('new desired stage', stage);
  //     }

  //     return percentageSum;
  //   }, 0);
  // }

  // private is100Percent(stages: Stages) {
  //   const totalPercent = Object.values(stages).reduce(
  //     (partialSum, stage) => partialSum + stage.distanceSpanPercent,
  //     0
  //   );

  //   return totalPercent === 100;
  // }
}

export default Controller;
