import timelapseSrc from '../ressources/Part1.mp4';
import zoomOutSrc from '../ressources/ZoomOut.mp4';
import zoomInSrc from '../ressources/ZoomIn.mp4';
import earthRotateSrc from '../ressources/EarthRotation.mp4';

const realityNewsModules = import.meta.glob('../ressources/news/Realit*.png');
const fictionNewsModules = import.meta.glob('../ressources/news/*_Fiktion.png');

type ControllerConfig = {
  totalDistance: number;
  maxDistance: number;
  minDistance: number;
};

class Controller {
  private totalDistance: number;
  private maxDistance: number;
  private minDistance: number;

  private distance: number;

  private timelapse: HTMLVideoElement;
  private zoomOut: HTMLVideoElement;
  private zoomIn: HTMLVideoElement;
  private earthRotate: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private state = 0;
  private newsTime = 0;
  private prevNewsType: 'realityNews' | 'fictionNews' = 'fictionNews';

  private realityNews: HTMLImageElement[] = [];
  private fictionNews: HTMLImageElement[] = [];

  private currentNews: HTMLImageElement[] = [];

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

    this.totalDistance = config.totalDistance;
    this.maxDistance = config.maxDistance;
    this.minDistance = config.minDistance;

    this.distance = this.maxDistance;

    this.addNews();
  }

  private async addNews() {
    console.log('reality modules', realityNewsModules);
    console.log('fiction modules', fictionNewsModules);

    for (const path in realityNewsModules) {
      const image = new Image();
      const imgSrc = await realityNewsModules[path]() as { default: string };
      image.src = imgSrc.default;
      this.realityNews.push(image);
    }

    for (const path in fictionNewsModules) {
      const image = new Image();
      const imgSrc = await fictionNewsModules[path]() as { default: string };
      image.src = imgSrc.default;
      this.fictionNews.push(image);
    }
  }

  async init() {
    await this.setSrc(this.timelapse, timelapseSrc);
    await this.setSrc(this.zoomOut, zoomOutSrc);
    await this.setSrc(this.zoomIn, zoomInSrc);
    await this.setSrc(this.earthRotate, earthRotateSrc);

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
        if (this.currentNews.length > 0) this.currentNews = [];
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

    this.drawNews();

    video.requestVideoFrameCallback(() => this.captureFrame(video));
  };

  update = (newDistance: number) => {
    this.updateDistance(newDistance);
    this.updateState();
  };

  private drawNews() {
    if (this.earthRotate.paused) return;

    if (this.currentNews.length === 0 || this.newsTime >= 500) {
      const newNews = this.getRandomNewNews();
      if (newNews !== null) this.currentNews.push(newNews);
      else this.currentNews = [];

      this.newsTime = 0;
    }

    this.currentNews.forEach((image, i) => {
      if (i < this.currentNews.length - 3) return;

      const imageWidth = image.width;
      const imageHeight = image.height;
      const width = innerWidth / 4;
      const height = (imageHeight * width) / imageWidth;
      const { x, y } = this.getPosition(i, width, height);
      this.ctx.drawImage(image, x, y, width, height);
    });

    this.newsTime += 1;
  }

  private getRandomNewNews(): HTMLImageElement | null {
    const newsType: 'realityNews' | 'fictionNews' = this.prevNewsType === 'fictionNews' ? 'realityNews' : 'fictionNews';
    this.prevNewsType = newsType;

    const relevantNews = this[newsType].filter((item) =>
      !this.currentNews.includes(item));

    if (relevantNews.length === 0) return null;

    return relevantNews[Math.floor(Math.random() * relevantNews.length)];
  }

  private getPosition(
    index: number,
    iw: number,
    ih: number
  ): { x: number; y: number } {
    const width = window.innerWidth;
    const height = width * 0.5625;

    let x = 0;
    let y = 0;

    let padding = width * 0.06;

    const i = (index + 1) % 3;

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

  private updateDistance(newDistance: number) {
    this.distance = Math.max(
      0,
      Math.min(this.totalDistance, newDistance - this.minDistance)
    );
    console.log('Update distance:', this.distance);
  }
}

export default Controller;
