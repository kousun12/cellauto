// @flow
import { get } from 'lodash';
import Queue from 'util/Queue';
import type { DirectionName } from 'cellauto/World';
import type { RGBA } from 'util/types';
type Neighborhood<T, R> = { [DirectionName]: ?Cell<T, R> };
type DelayedAction<T, R> = { steps: number, action: (Cell<T, R>) => void };

const HEX_RE = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
const HEX_FULL_RE = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

export default class Cell<T, R = RGBA, O = null> {
  static memory: number = 1;
  x: number;
  y: number;
  delays: DelayedAction<T, R>[] = [];
  neighbors: Neighborhood<T, R> = {};
  state: Queue<T>;
  buffer: T;

  constructor(x: number, y: number, options?: O) {
    this.x = x;
    this.y = y;

    // State queue is memories + current state
    this.state = new Queue(this.constructor.memory + 1);
    this.state.enqueue(this.constructor.getInitialState(options));
    this.buffer = this.getValue();
  }

  previousState(): ?T {
    return this.state.back(1);
  }

  getValue(): T {
    // $FlowIssue - we should always have a value
    return this.state.back();
  }

  getView(): R {
    return this.constructor.render(this.getValue());
  }

  static getInitialState(fromOpts?: O): T {
    throw Error('unimplemented');
  }

  static render(val: T): R {
    throw Error('unimplemented');
  }

  step = (number: number): T => {
    throw Error('unimplemented');
  };

  flushBuffer = () => {
    this.state.enqueue(this.buffer);
  };

  prepare = () => {};

  // $FlowIssue
  surroundingCells = (): Cell<T, R>[] => Object.values(this.neighbors).filter(n => n);

  findNeighbor = (predicate: (Cell<T, R>) => boolean): ?Cell<T, R> =>
    this.surroundingCells().find(n => predicate(n));

  neighborsWhere = (predicate: (Cell<T, R>) => boolean): Cell<T, R>[] =>
    this.surroundingCells().filter(n => predicate(n));

  getNeighborValue = (name: DirectionName): any => {
    const n = get(this.neighbors, name);
    return n && n.getValue();
  };

  addDelay = (steps: number, action: (Cell<T, R>) => void) => {
    this.delays.push({ steps, action });
  };

  neighborAvgFor = (numMap: (Cell<T, R>) => number) => {
    const s = this.surroundingCells();
    return s.map(n => numMap(n)).reduce((memo, c) => memo + c, 0) / s.length;
  };

  static hexToRgb(hex: string, a?: number = 1) {
    hex = hex.replace(HEX_RE, (m, r, g, b) => r + r + g + g + b + b);
    const result = HEX_FULL_RE.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
          a,
        }
      : null;
  }
}
