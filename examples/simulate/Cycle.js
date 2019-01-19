// @flow

import CellAutomata from 'cellauto/CellAutomata';
import { World } from 'cellauto/World';
import CopyPlus from 'cellauto/cells/CopyPlus';

const Cycle = (width: number, height: number) => {
  return new World({ width, height })
    .populateWith([{ class: CopyPlus, distribution: 100 }])
    .wrapVertical();
};

new CellAutomata(Cycle(200, 100), { maxSteps: 1000, cellSize: 10 }).start();
