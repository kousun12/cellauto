// @flow
import CellAutomata from 'cellauto/CellAutomata';
import { World } from 'cellauto/World';
import Forest from 'cellauto/cells/Forest';

const ForestFire = (width: number, height: number) => {
  return new World({ width, height })
    .populateWith([{ class: Forest, distribution: 100 }])
    .wrapEdges();
};

new CellAutomata(ForestFire(110, 80), { maxSteps: 1000, cellSize: 10 })
  .havingSpaceBetween(2)
  .start();
