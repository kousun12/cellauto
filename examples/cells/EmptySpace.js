import Cell from './Base';

export default class EmptySpace extends Cell<null> {
  static getInitialState() {
    return null;
  }
  static render() {
    return { r: 0, g: 0, b: 0 };
  }
  step = () => {};
  getValue = () => null;
  prepare = () => {};
}
