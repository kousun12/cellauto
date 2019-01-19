// @flow
import CellAutomata from 'cellauto/CellAutomata';
import { World } from 'cellauto/World';
import Prisoner from 'cellauto/cells/Prisoner';

const Prisoners = (width: number, height: number) => {
  return new World({ width, height })
    .populateWith([
      { class: Prisoner, distribution: 25, options: { strategy: 'ALL-D' } },
      { class: Prisoner, distribution: 25, options: { strategy: 'ALL-C' } },
      { class: Prisoner, distribution: 0, options: { strategy: 'RAND' } },
      { class: Prisoner, distribution: 25, options: { strategy: 'TFT' } },
      { class: Prisoner, distribution: 25, options: { strategy: 'PAV' } },
    ])
    .wrapEdges();
};

new CellAutomata(Prisoners(110, 70), { maxSteps: 1000, cellSize: 8 }).noBorder().start();
