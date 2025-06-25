export class PositionUpdater {

  private readonly setPositionFn;
  private intervalId?: NodeJS.Timeout;
  private readonly currentPosition: [number, number, number,boolean];
  private readonly transitionDuration = 500;
  private readonly transitionSteps = 50;

  constructor(setPositionFn: (position: [number, number, number,boolean]) => void, currentPosition: [number, number, number,boolean]) {
    this.setPositionFn = setPositionFn;
    this.currentPosition = currentPosition;
  }

  updatePosition(targetPosition: [number, number, number]) {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    const positionDeltaForStep = [
      (targetPosition[0] - this.currentPosition[0]) / this.transitionSteps,
      (targetPosition[1] - this.currentPosition[1]) / this.transitionSteps,
      (targetPosition[2] - this.currentPosition[2]) / this.transitionSteps
    ]
    let stepCount = 0;
    let currentPosition = this.currentPosition;
    this.intervalId = setInterval(() => {
      stepCount++;
      if (stepCount >= this.transitionSteps) {
        clearInterval(this.intervalId!);
        return;
      }
      currentPosition = [
        currentPosition[0] + positionDeltaForStep[0],
        currentPosition[1] + positionDeltaForStep[1],
        currentPosition[2] + positionDeltaForStep[2],
        true
      ];
      this.setPositionFn(currentPosition);
    }, this.transitionDuration / this.transitionSteps);
  }
}
