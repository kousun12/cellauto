import Cell from './Base';

export default class Opening extends Cell<boolean> {
  static getInitialState(): boolean {
    return Math.random() > 0.4;
  }
  step = () => {
    const openNeighbors = this.neighborsWhere(c => c.getValue()).length;
    return (this.getValue() && openNeighbors >= 4) || openNeighbors >= 6;
  };
}
