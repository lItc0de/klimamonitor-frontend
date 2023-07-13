import Stage from './stage';

type Direction = 'forwards' | 'backwards';

type Stages = {
  groundRotation: Stage;
  zoomOut1: Stage;
  timelapse: Stage;
  zoomOut2: Stage;
  earthRotation: Stage;
};

type ControllerConfig = {
  totalDistance: number;
  maxDistance: number;
  minDistance: number;
};

class Controller {
  private stages: Stages = {
    groundRotation: new Stage({
      startTime: 1,
      endTime: 17,
      stageNumber: 1,
      distanceSpanPercent: 20,
      playbackRate: 3,
      loop: true,
    }),
    zoomOut1: new Stage({
      startTime: 17,
      endTime: 23,
      stageNumber: 2,
      distanceSpanPercent: 20,
      playbackRate: 3,
      loop: false,
    }),
    timelapse: new Stage({
      startTime: 23,
      endTime: 37,
      stageNumber: 3,
      distanceSpanPercent: 20,
      playbackRate: 3,
      loop: true,
    }),
    zoomOut2: new Stage({
      startTime: 37,
      endTime: 54,
      stageNumber: 4,
      distanceSpanPercent: 20,
      playbackRate: 3,
      loop: false,
    }),
    earthRotation: new Stage({
      startTime: 54,
      endTime: 74,
      stageNumber: 5,
      distanceSpanPercent: 20,
      playbackRate: 3,
      loop: true,
    }),
  };

  private video: HTMLVideoElement;

  private currentStage: Stage;
  private previousStage: Stage | null;

  private totalDistance: number;
  private maxDistance: number;
  private minDistance: number;

  private distance: number;
  private previousDistance: number;

  private direction: Direction = 'forwards';
  private previousDirection: Direction = 'forwards';

  constructor(video: HTMLVideoElement, config: ControllerConfig) {
    this.video = video;

    this.currentStage = this.stages.groundRotation;
    this.previousStage = null;

    this.totalDistance = config.totalDistance;
    this.maxDistance = config.maxDistance;
    this.minDistance = config.minDistance;

    this.distance = this.maxDistance;
    this.previousDistance = this.maxDistance;

    if (!this.is100Percent(this.stages))
      throw new Error('More or less then 100%');

    this.video.addEventListener('timeupdate', this.run);
    this.video.playbackRate = 0.1;
    this.video.play();

    // console.log(this.video.duration);

    // setInterval(this.run, 50);
  }

  private get currentStageNumber(): number {
    return this.currentStage.stageNumber;
  }

  private get previousStageNumber(): number {
    return this.previousStage?.stageNumber || 0;
  }

  private run = () => {
    const needsJump = this.video.currentTime >= this.currentStage.endTime;

    console.log('Bla', {
      curr: this.video.currentTime,
      dur: this.video.duration,
    });

    if (needsJump && this.currentStage.loop)
      this.updateCurrentTime(this.currentStage.startTime);
  };

  update(newDistance: number) {
    this.updateDistance(newDistance);
    this.updateDirection();
    this.updateStage();
  }

  private updateDirection() {
    const distanceDiff = Math.abs(this.previousDistance - this.distance);
    if (distanceDiff < 10) return;

    this.direction =
      this.distance >= this.previousDistance ? 'backwards' : 'forwards';
    console.log(this.direction);
  }

  private updateCurrentTime(newTime: number) {
    this.video.currentTime = newTime;
  }

  private updateDistance(newDistance: number) {
    this.distance = Math.max(
      0,
      Math.min(this.totalDistance, newDistance - this.minDistance)
    );
    console.log('Update distance:', this.distance);
  }

  private updateStage() {
    const percent = 100 - (this.distance * 100) / this.totalDistance;

    Object.values(this.stages).reduce((partialPercentage, stage) => {
      const percentageSum = partialPercentage + stage.distanceSpanPercent;
      if (this.currentStage === stage) return percentageSum;

      if (percent >= partialPercentage && percent <= percentageSum) {
        this.previousStage = this.currentStage;
        this.currentStage = stage;
      }

      return percentageSum;
    }, 0);

    this.changePlaybackRate(this.currentStage.playbackRate);

    console.log('Update stage:', {
      percent,
      stage: this.currentStage.stageNumber,
    });
  }

  private changePlaybackRate(newPlaybackRate: number) {
    this.video.playbackRate = newPlaybackRate;
  }

  private is100Percent(stages: Stages) {
    const totalPercent = Object.values(stages).reduce(
      (partialSum, stage) => partialSum + stage.distanceSpanPercent,
      0
    );

    return totalPercent === 100;
  }
}

export default Controller;
