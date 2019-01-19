// @flow
import Cell from './Base';
import type { RGBA } from 'util/types';

export default class Water extends Cell<number, RGBA> {
  static waterLevels = 9;

  static colors: RGBA[] = [...new Array(Water.waterLevels + 1).keys()].map(i => ({
    r: i < Water.waterLevels ? 40 : 40,
    g: i < Water.waterLevels ? 164 : 102,
    b: i < Water.waterLevels ? 209 : 154,
    a: i / Water.waterLevels,
  }));

  static getInitialState() {
    return Math.floor(Math.random() * Water.waterLevels);
  }

  static render(value: number) {
    return Water.colors[value];
  }

  step = () => {
    const {
      neighbors: { bottom, bottomLeft, bottomRight, left, right },
    } = this;
    if (this.buffer === 0) {
      return this.buffer;
    }
    if (bottom instanceof Water && this.hasWater() && bottom.isNotFull()) {
      const amt = Math.min(this.buffer, bottom.freeSpace());
      this.buffer -= amt;
      bottom.buffer += amt;
      return this.buffer;
    }

    [bottomLeft, bottomRight, right, left].forEach(c => {
      if (c instanceof Water && this.hasWater() && c.isNotFull()) {
        const amt = Math.min(this.buffer, Math.ceil(c.freeSpace() / 2));
        this.buffer -= amt;
        c.buffer += amt;
      }
    });

    return this.buffer;
  };

  freeSpace = (): number => Water.waterLevels - this.buffer;
  isEmpty = (): boolean => this.buffer === 0;
  isFull = (): boolean => this.buffer >= Water.waterLevels;
  isNotFull = (): boolean => !this.isFull();
  hasWater = (): boolean => !this.isEmpty();
}
