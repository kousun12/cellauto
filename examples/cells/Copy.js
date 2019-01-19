// @flow
import Cell from './Base';
import { get } from 'lodash';
import type { RGBA } from 'util/types';

type MooreDir = 'top' | 'bottom' | 'right' | 'left';
type VonNeumannDir = 'topRight' | 'topLeft' | 'bottomLeft' | 'bottomRight';
type Dir = MooreDir | VonNeumannDir;

export default <T>(dir: Dir, initialState: T) => {
  return class _Copy extends Cell<T, *, *> {
    static getInitialState(): T {
      return initialState;
    }
    // TODO fix this
    static render(on: T) {
      return on ? { r: 158, g: 90, b: 216 } : { r: 255, g: 255, b: 255, a: 0.01 };
    }
    step = (): * => {
      return this.neighbors[dir] && this.neighbors[dir].getValue();
    };
  };
};
