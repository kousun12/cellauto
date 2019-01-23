// @flow
import Cell from './Base';
import { get, reverse } from 'lodash';
import type { RGBA } from 'util/types';

type O = { state: boolean };

const toBin8 = (rule: number) => {
  const bin = [...rule.toString(2)].map(s => parseInt(s, 10));
  if (bin.length < 8) {
    bin.unshift(...[...new Array(8 - bin.length)].map(() => 0));
  }
  return reverse(bin);
};

export default (rule: number) => {
  return class _NeighborRule extends Cell<boolean, RGBA, O> {
    static transitions: boolean[] = toBin8(rule).map(i => i === 1);
    static getInitialState(opts?: O): boolean {
      return get(opts, 'state', Math.random() > 0.5);
    }

    static render(on: boolean) {
      return on ? { r: 245, g: 189, b: 145 } : { r: 255, g: 255, b: 255, a: 0.01 };
    }

    step = (): boolean => {
      return this.constructor.transitions[this.neighborhood()];
    };

    neighborhood = (): number => {
      const {
        neighbors: { left, right },
      } = this;
      // NB assume left + right are own type cell $FlowIssue
      return (left.getValue() ? 4 : 0) + (this.getValue() ? 2 : 0) + (right.getValue() ? 1 : 0);
    };
  };
};
