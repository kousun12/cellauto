// @flow
import { get } from 'lodash';
import Cell from './Base';
import type { RGBA } from 'util/types';

type State = number;
export default class CopyPlus extends Cell<State, RGBA> {
  static values = 7;
  static Colors = [
    { r: 104, g: 104, b: 104 },
    { r: 211, g: 101, b: 97 },
    { r: 33, g: 205, b: 42 },
    { r: 255, g: 252, b: 103 },
    { r: 101, g: 107, b: 200 },
    { r: 255, g: 119, b: 255 },
    { r: 64, g: 192, b: 183 },
  ];

  static getInitialState(): State {
    return Math.floor(Math.random() * CopyPlus.values);
  }

  step = (): State => {
    const {
      neighbors: { bottom, top, left, right },
    } = this;
    const v = this.getValue();
    const target = v === CopyPlus.values - 1 ? 0 : v + 1;
    const copy = [bottom, top, left, right].find(
      n => n instanceof CopyPlus && n.getValue() === target
    );
    if (copy) {
      return copy.getValue();
    } else {
      return v;
    }
  };

  prepare = () => {};

  static render(value: State) {
    return CopyPlus.Colors[value];
  }
}
