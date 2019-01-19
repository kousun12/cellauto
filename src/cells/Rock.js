// @flow
import Cell from './Base';
import type { RGBA } from 'util/types';
import Water from 'cellauto/cells/Water';

export default class Rock extends Cell<boolean, RGBA> {
  static getInitialState(): boolean {
    return false;
  }

  static render(plants: boolean) {
    return plants ? { r: 60, g: 120, b: 56 } : { r: 17, g: 10, b: 0 };
  }

  step = (): boolean => {
    const {
      neighbors: { top, bottom },
    } = this;
    if (top instanceof Water && bottom instanceof Rock) {
      return Boolean(top && top.getValue() === 0);
    } else {
      return false;
    }
  };
}
