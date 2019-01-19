// @flow
import { invert } from 'lodash';
import Cell from './Base';
import type { RGBA } from 'util/types';

type _Types = 'open' | 'tree' | 'embers' | 'fireLow' | 'fireMed' | 'fireHigh';

export default class Forest extends Cell<number, RGBA> {
  static pIgnite = 0.0009;
  static pGrow = 0.01;

  static States: { [_Types]: number } = {
    open: 0,
    tree: 1,
    fireLow: 2,
    fireMed: 3,
    fireHigh: 4,
    embers: 5,
  };
  static StateKeys: { [number]: _Types } = invert(Forest.States);

  static getInitialState() {
    return 0;
  }

  static render(value: number) {
    switch (Forest.StateKeys[value]) {
      case 'open':
        return this.hexToRgb('#000', 0);
      case 'tree':
        return this.hexToRgb('#5fa754');
      case 'embers':
        return this.hexToRgb('#d23c49', 0.1);
      case 'fireLow':
        return this.hexToRgb('#d23c49', 0.3);
      case 'fireMed':
        return this.hexToRgb('#d23c49', 0.5);
      case 'fireHigh':
        return this.hexToRgb('#d23c49');
      default:
        throw Error();
    }
  }

  step = (): number => {
    switch (Forest.StateKeys[this.getValue()]) {
      case 'open':
        if (Math.random() <= Forest.pGrow) {
          return Forest.States.tree;
        } else {
          return Forest.States.open;
        }
      case 'tree':
        if (this.findNeighbor(c => c.getValue() === Forest.States.fireHigh)) {
          return Forest.States.fireHigh;
        } else if (Math.random() <= Forest.pIgnite) {
          return Forest.States.fireHigh;
        } else {
          return Forest.States.tree;
        }
      case 'embers':
        return Forest.States.open;
      case 'fireLow':
        return Forest.States.open;
      case 'fireMed':
        return Forest.States.fireLow;
      case 'fireHigh':
        return Forest.States.fireMed;
      default:
        throw Error();
    }
  };
}
