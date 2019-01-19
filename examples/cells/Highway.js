// @flow
import { get } from 'lodash';
import Cell from './Base';
import type { RGBA } from 'util/types';

type Car = 'down' | 'right';
type State = Car | 'open';

type O = { state: State };
export default class Highway extends Cell<State, RGBA, O> {
  static Colors = {
    down: { r: 64, g: 134, b: 210 },
    right: { r: 210, g: 60, b: 73 },
    open: { r: 40, g: 40, b: 40, a: 0.1 },
  };

  static getInitialState(opts?: O): State {
    return get(opts, 'state', this._randomState());
  }

  step = (number: number): State => {
    const turn: Car = number % 2 === 0 ? 'down' : 'right';
    const {
      neighbors: { top, left, bottom, right },
    } = this;

    if (turn === 'down') {
      // debugger;
    }
    const incoming = turn === 'down' ? top : left;
    // Inbound
    if (incoming && this.getValue() === 'open' && incoming.getValue() === turn) {
      return turn;
    }

    const outgoing = turn === 'down' ? bottom : right;
    // Outbound
    if (outgoing && this.getValue() === turn && outgoing.getValue() === 'open') {
      return 'open';
    }
    return this.getValue();
  };

  prepare = () => {};

  static render(value: State) {
    return Highway.Colors[value];
  }

  static _randomState() {
    return ['down', 'right', 'open'][Math.floor(Math.random() * 3)];
  }
}
