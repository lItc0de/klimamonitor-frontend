import Store from "./store";

class VideoCanvas {
  private video?: HTMLVideoElementWithCaptureStream;
  private videoSrc: string;

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private frames: string[] = [];
  // private store: Store;
  currentFrameIndex = 0;
  totalFrames = 0;

  constructor(videoSrc: string) {
    this.checkIfSupported();
    this.videoSrc = videoSrc;
    // this.store = new Store('1');

    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    const ctx = this.canvas.getContext('2d');
    if (ctx == null) throw new Error('Missing canvas context');
    this.ctx = ctx;

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerWidth * 0.5625;
  }

  videoToFrames(): Promise<void> {
    return new Promise<void>(async (reslove) => {
      // if (!this.store.needsUpdate) {
      //   this.frames = this.store.frames;
      //   return reslove();
      // }

      this.video = await this.getVideoEl();

      this.video.requestVideoFrameCallback(this.captureFrame);
      this.video.addEventListener('ended', () => {
        console.log('Total frames:', this.frames.length);
        this.totalFrames = this.frames.length;
        // this.store.update(this.frames);
        reslove();
      });

      this.video.controls = false;
      this.video.playbackRate = 5;
      this.video.play();
    });
  }

  private async getVideoEl(): Promise<HTMLVideoElementWithCaptureStream> {
    return new Promise((resolve) => {
      const video = document.getElementById(
        'video'
      ) as HTMLVideoElementWithCaptureStream;
      video.src = this.videoSrc;
      video.addEventListener('loadeddata', () => resolve(video));
    });
  }

  private captureFrame = () => {
    if (this.video == null) return;

    this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    const dataUrl = this.canvas.toDataURL('image/png');
    this.frames.push(dataUrl.replace(/^data:image\/(png|jpg);base64,/, ""))
    // const imageData = this.ctx.getImageData(
    //   0,
    //   0,
    //   this.canvas.width,
    //   this.canvas.height
    // );
    // this.frames.push(imageData);
    this.video.requestVideoFrameCallback(this.captureFrame);
  };

  private drawCurrentFrame() {
    const img = new Image;
    img.addEventListener('load', () => {
      this.ctx.drawImage(img, 0, 0);
    })

    const dataUrl = this.frames[this.currentFrameIndex];
    img.src = "data:image/png;base64," + dataUrl;
  }

  nextFrame = () => {
    this.currentFrameIndex = Math.min(
      this.frames.length - 1,
      this.currentFrameIndex + 1
    );
    // this.ctx.putImageData(this.frames[this.currentFrameIndex], 0, 0);
    this.drawCurrentFrame();
  };

  previousFrame = () => {
    this.currentFrameIndex = Math.max(0, this.currentFrameIndex - 1);
    // this.ctx.putImageData(this.frames[this.currentFrameIndex], 0, 0);
    this.drawCurrentFrame();
  };

  jumpToFrame = (frameNum: number) => {
    if (frameNum < 0 || frameNum > this.frames.length - 1) return;

    this.currentFrameIndex = frameNum;
    // this.ctx.putImageData(this.frames[this.currentFrameIndex], 0, 0);
    this.drawCurrentFrame();
  };

  // private frameWriteableStream() {
  //   const _this = this;
  //   const queueingStrategy = new CountQueuingStrategy({ highWaterMark: 1 });

  //   return new WritableStream(
  //     {
  //       write(chunk: VideoFrame) {
  //         console.log('Write');

  //         return new Promise((resolve) => {
  //           _this.frames.push(chunk);
  //           _this.ctx.drawImage(chunk, 0, 0);

  //           resolve();
  //         });
  //       },
  //       close() {
  //         console.log('finished', _this.frames.length);
  //       },
  //       abort(err) {
  //         console.error('Stream error:', err);
  //       },
  //     },
  //     queueingStrategy
  //   );
  // }

  private checkIfSupported() {
    if (
      'MediaStreamTrackProcessor' in window &&
      'MediaStreamTrackGenerator' in window
    ) {
      // Insertable streams for `MediaStreamTrack` is supported.
    } else {
      alert('This browser ist not supported 😢');
      throw new Error('Browser is not supported');
    }
  }
}

export default VideoCanvas;
