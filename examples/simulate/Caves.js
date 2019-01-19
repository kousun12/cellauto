// @flow
import CellAutomata from 'cellauto/CellAutomata';
import { World } from 'cellauto/World';
import Opening from 'cellauto/cells/Opening';
import Water from 'cellauto/cells/Water';
import Rock from 'cellauto/cells/Rock';

const Caves = (width: number, height: number) => {
  return new World({ width, height })
    .populateWith([{ class: Opening, distribution: 100 }])
    .step(Math.max(8, Math.max(width, height) / 10))
    .terraform(c => (c.getValue() ? new Water(c.x, c.y) : new Rock(c.x, c.y)));
};

new CellAutomata(Caves(120, 100), { maxSteps: 1000, cellSize: 10 }).havingSpaceBetween(0).start();
