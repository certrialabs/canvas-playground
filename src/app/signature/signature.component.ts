import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

class Point {
  constructor(private _x: number, private _y: number) {}

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }
}

class RelativePoint {
  constructor(private _x: string, private _y: string) {}

  get x(): string {
    return this._x;
  }

  get y(): string {
    return this._y;
  }
}

class LineConfigs {
  constructor(private _width: number) {};

  get width(): number {
    return this._width;
  }
}

class Segment {
  constructor(private _start: RelativePoint, private _end: RelativePoint) {}

  get start(): RelativePoint {
    return this._start;
  }

  get end(): RelativePoint {
    return this._end;
  }
}

@Component({
  selector: 'app-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.less']
})
export class SignatureComponent implements OnInit, AfterViewInit {

  @ViewChild('myCanvas', {static: true}) canvasElRef: ElementRef;
  @ViewChild('mySVG', {static: true}) svgElRef: ElementRef;
  @ViewChild('svgWrapper', {static: true}) svgWrapperElRef: ElementRef;

  private mouseClicked = false;
  private previousPoint: Point = undefined;
  private privouseRelativePoint: RelativePoint = undefined;
  private lineConfigs = new LineConfigs(1);
  private savedData: any;
  private defaultCanvasSize = 1024;
  //segments: Array<Segment> = [new Segment(new Point(0, 0), new Point(100, 100)), new Segment(new Point(100, 100), new Point(50, 50))];
  segments: Array<Segment> = [];

  constructor() { }

  get canvas(): HTMLCanvasElement {
    return this.canvasElRef.nativeElement as HTMLCanvasElement;
  }

  get svg(): HTMLElement {
    return this.svgElRef.nativeElement;
  }

  get svgWrapper(): HTMLElement {
    return this.svgWrapperElRef.nativeElement;
  }

  get computedSizes(): {width: number, height: number} {
    const computedStyles = getComputedStyle(this.canvasElRef.nativeElement);
    return {
      width: parseInt(computedStyles.getPropertyValue('width'), 10),
      height: parseInt(computedStyles.getPropertyValue('height'), 10)
    };
  }

  get svgComputedSizes(): {width: number, height: number} {
    const computedStyles = getComputedStyle(this.svgWrapperElRef.nativeElement);
    return {
      width: parseInt(computedStyles.getPropertyValue('width'), 10),
      height: parseInt(computedStyles.getPropertyValue('height'), 10)
    };
  }

  ngOnInit() {
    fromEvent(window, 'resize')
    .pipe(
      debounceTime(20)
    )
    .subscribe(() => {
      //const computedSizes = this.computedSizes;
      //this.canvas.width = computedSizes.width;
      //this.canvas.height = computedSizes.height;
    });
    //const computedStyles = getComputedStyle(this.canvasElRef.nativeElement);
    //this.canvas.width = parseInt(computedStyles.getPropertyValue('width'), 10);
    //this.canvas.height = parseInt(computedStyles.getPropertyValue('height'), 10);
  }

  ngAfterViewInit() {
  }

  mouseup() {
    this.mouseClicked = false;
  }

  mousedown() {
    this.mouseClicked = true;
  }

  mouseout(event) {
    this.mouseClicked = false;
  }

  mousemove(event: MouseEvent) {
    this.drawSVG(event);
  }

  // For some reason when you repaint the svg it fires mouseout event.
  // We just prevent it and bind on the wrapper component.
  svgMouseout(event: Event) {
    event.stopPropagation();
  }

  drawCanvas(event: MouseEvent) {
    const currentPoint = new Point(event.x - this.canvas.offsetLeft, event.y - this.canvas.offsetTop);
    if (this.mouseClicked && this.previousPoint) {
      const context: CanvasRenderingContext2D = this.canvas.getContext('2d');
      context.moveTo(this.previousPoint.x, this.previousPoint.y);
      context.lineTo(currentPoint.x, currentPoint.y);
      context.lineWidth = this.lineConfigs.width;
      context.stroke();
    }

    this.previousPoint = currentPoint;
  }

  drawSVG(event: MouseEvent) {
    if (this.mouseClicked) {
      console.log("Drawing");
      const currentPoint = new Point(event.x - this.svgWrapper.offsetLeft, event.y - this.svgWrapper.offsetTop);
      const svgSizes = this.svgComputedSizes;
      const currentRelativePoint = new RelativePoint(((currentPoint.x / svgSizes.width) * 100) + '%', ((currentPoint.y / svgSizes.height) * 100) + '%');

      if (this.privouseRelativePoint) {
        this.segments.push(new Segment(this.privouseRelativePoint, currentRelativePoint));
      }
      this.privouseRelativePoint = currentRelativePoint;
    }
  }

  save() {
    const currWidth = this.canvas.width;
    const currHeight = this.canvas.height;

    this.savedData = this.canvas.toDataURL();
  }

  load() {
    const currWidth = this.canvas.width;
    const currHeight = this.canvas.height;
    const image = new Image();
    image.onload = () => {
      this.canvas.getContext('2d').drawImage(image, 0, 0);
    };
    image.src = this.savedData;
  }

  clear() {
    this.canvas.getContext('2d').clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private updateCanvasSize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
  }
}
