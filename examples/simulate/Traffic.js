// @flow
import CellAutomata from 'cellauto/CellAutomata';
import { World } from 'cellauto/World';
import Highway from 'cellauto/cells/Highway';

const Traffic = (width: number, height: number) => {
  return new World({ width, height })
    .populateWith([
      { class: Highway, distribution: 25, options: { state: 'down' } },
      { class: Highway, distribution: 25, options: { state: 'right' } },
      { class: Highway, distribution: 50, options: { state: 'open' } },
    ])
    .wrapEdges();
};

new CellAutomata(Traffic(100, 50), { maxSteps: 1000, cellSize: 10 }).start();
