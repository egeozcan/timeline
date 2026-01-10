export interface TimelineEventData {
  date: string;
  imageSrc?: string;
  title?: string;
  description?: string;
}

export interface EventLayout {
  el: HTMLElement;
  date: string;
  width: number;
  height: number;
  x: number;
  y: number;
  side?: 'left' | 'right';
}

export interface MarkerData {
  line: { x1: number; y1: number; x2: number; y2: number };
  text: { content: string | number; x: number; y: number; anchor: string };
}

export interface SVGData {
  axisPath: string;
  connectors: string[];
  dots: { cx: number; cy: number }[];
  markers: MarkerData[];
}
