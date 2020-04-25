export interface ChartDataPoint {
  x: number | string;
  y: number;
}

export interface YAxisPoint {
  position: number;
  label: number;
}

export type OrderedPair = [number, number];

export interface SvgElementObject {
  viewBox: OrderedPair;
  svgHeight: number;
  svgWidth: number;
}

export type YAxisLabelFromPoint = (point: YAxisPoint) => string;
export type XAxisLabelFromInfo = (
  maxChartDataPoint: ChartDataPoint,
  distanceFromMaxChartDataPoint: number
) => string;
