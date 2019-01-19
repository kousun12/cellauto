// @flow

import Cell from 'cellauto/cells/Base';
type Offset = { x: number, y: number };

export const Directions: { [string]: { offset: Offset } } = {
  topLeft: { offset: { x: -1, y: -1 } },
  top: { offset: { x: 0, y: -1 } },
  topRight: { offset: { x: 1, y: -1 } },
  left: { offset: { x: -1, y: 0 } },
  right: { offset: { x: 1, y: 0 } },
  bottomLeft: { offset: { x: -1, y: 1 } },
  bottom: { offset: { x: 0, y: 1 } },
  bottomRight: { offset: { x: 1, y: 1 } },
};

export type DirectionName = $Keys<typeof Directions>;

export const opposingDir = (d: DirectionName): DirectionName => {
  switch (d) {
    case 'topLeft':
      return 'bottomRight';
    case 'top':
      return 'bottom';
    case 'topRight':
      return 'bottomLeft';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    case 'bottomLeft':
      return 'topRight';
    case 'bottom':
      return 'top';
    case 'bottomRight':
      return 'topLeft';
    default:
      throw Error();
  }
};

type Distribution<T, R> = {
  // $FlowIssue
  class: $Subtype<Cell<T, R>>,
  distribution: number,
  options?: any,
};

export class World<T, R = null> {
  stepsTaken: number = 0;
  static DEFAULT_SIZE = 24;

  width: number;
  height: number;
  grid: Cell<T, R>[][];

  // $FlowIssue
  constructor({ width, height }: Object) {
    this.width = width || World.DEFAULT_SIZE;
    this.height = height || World.DEFAULT_SIZE;
    this.grid = [...new Array(this.height).keys()].map(() =>
      // $FlowIssue
      [...new Array(this.width).keys()].map(() => undefined)
    );
  }

  populateWith = (distributions: Distribution<T, R>[]): World<T, R> => {
    this.stepsTaken = 0;
    const byDist = distributions.sort((a, b) => (a.distribution > b.distribution ? 1 : -1));
    let runningTotal = 0;
    for (let i = 0; i < byDist.length; i++) {
      runningTotal += byDist[i].distribution;
      byDist[i].distribution = runningTotal;
    }
    if (runningTotal !== 100) {
      throw Error('Does not add up');
    }
    this.grid = [];
    for (let y = 0; y < this.height; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.width; x++) {
        const random = Math.random() * 100;
        const cellType = byDist.find(d => random <= d.distribution);
        if (cellType) {
          const c = new cellType.class(x, y, cellType.options);
          this.grid[y][x] = c;
        } else {
          // Should never happen
          throw Error('No cell type');
        }
      }
    }
    this._setNeighbors();
    return this;
  };

  step = (steps: number = 1): World<T, R> => {
    for (let i = 0; i < steps; i++) {
      this._stepOnce();
    }
    return this;
  };

  terraform<T2, R2>(transpose: (Cell<T, R>, number, number) => Cell<T2, R2>): World<T2, R2> {
    let newWorld: World<T2, R2>;
    newWorld = new World({ width: this.width, height: this.height });
    this._forEachCell((cell, x, y) => {
      newWorld.grid[y][x] = transpose(cell, x, y);
    });
    newWorld._setNeighbors();
    return newWorld;
  }

  extendDown(by: number): World<T, R> {
    let newWorld: World<T, R>;
    newWorld = new World({ width: this.width, height: this.height + by });
    this._forEachCell((cell, x, y) => {
      newWorld.grid[y][x] = cell;
    });
    return newWorld;
  }

  extendRight(by: number): World<T, R> {
    let newWorld: World<T, R>;
    newWorld = new World({ width: this.width + by, height: this.height });
    this._forEachCell((cell, x, y) => {
      newWorld.grid[y][x] = cell;
    });
    return newWorld;
  }

  // $FlowIssue
  wrapHorizontal = (): World<T, R> => {
    this.wrapNeighbors(['topLeft', 'left', 'bottomLeft', 'topRight', 'right', 'bottomRight'], {
      onRows: [0, this.width - 1],
    });
    return this;
  };

  // $FlowIssue
  wrapVertical = (): World<T, R> => {
    this.wrapNeighbors(['topLeft', 'top', 'topRight', 'bottomLeft', 'bottom', 'bottomRight'], {
      onColumns: [0, this.height - 1],
    });
    return this;
  };

  wrapNeighbors = (
    directions: DirectionName[],
    { onRows, onColumns }: Object = {}
  ): World<T, R> => {
    this._forEachCell(cell => {
      for (const direction of directions) {
        if (Array.isArray(onRows) && !onRows.includes(cell.x)) {
          continue;
        }
        if (Array.isArray(onColumns) && !onColumns.includes(cell.y)) {
          continue;
        }
        if (cell.neighbors[direction] === null) {
          const offset = Directions[direction].offset;
          const xIndex = this._indexWrapped(cell.x + offset.x, this.width);
          const yIndex = this._indexWrapped(cell.y + offset.y, this.height);
          cell.neighbors[direction] = this.grid[yIndex][xIndex];
        }
      }
    });
    return this;
  };

  _indexWrapped = (i: number, overflow: number) => {
    if (i < 0) {
      return overflow - 1;
    } else if (i >= overflow) {
      return 0;
    } else {
      return i;
    }
  };

  // $FlowIssue
  wrapEdges = (): World<T, R> => {
    this.wrapHorizontal();
    this.wrapVertical();
    return this;
  };

  // Private

  _stepOnce = () => {
    // Prepare phase
    this._forEachCell(c => c.prepare());

    // then process phase
    this._forEachCell((cell: Cell<T, R>) => {
      if (this.stepsTaken < cell.constructor.memory) {
        cell.buffer = cell.getValue();
      } else {
        cell.buffer = cell.step(this.stepsTaken);
      }
      for (let i = 0; i < cell.delays.length; i++) {
        cell.delays[i].steps--;
        if (cell.delays[i].steps <= 0) {
          cell.delays[i].action(cell);
          cell.delays.splice(i, 1);
          i--;
        }
      }
    });

    this._forEachCell(c => c.flushBuffer());

    // Log step taken
    this.stepsTaken++;
  };

  _setNeighbors = () => {
    this._forEachCell((cell: Cell<T, R>) => {
      for (const direction in Directions) {
        const offset = Directions[direction].offset;
        const xIndex = cell.x + offset.x;
        const yIndex = cell.y + offset.y;
        if (xIndex < 0 || yIndex < 0 || xIndex >= this.width || yIndex >= this.height) {
          cell.neighbors[direction] = null;
        } else {
          cell.neighbors[direction] = this.grid[yIndex][xIndex];
        }
      }
    });
  };

  _forEachCell(fn: (Cell<T, R>, x: number, y: number) => void) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.grid[y][x];
        fn(cell, x, y);
      }
    }
  }
}
