// @flow
import { get } from 'lodash';
import CellAutomata from 'cellauto/CellAutomata';
import { World } from 'cellauto/World';
import NeighborRule from 'cellauto/cells/NeighborRule';
import Copy from 'cellauto/cells/Copy';
import type { RGBA } from 'util/types';

const Rule = (rule: number) => (width: number, height: number): World<boolean, RGBA> => {
  const k = NeighborRule(rule);
  const cp = Copy('top', false);
  return new World({ width, height: 1 })
    .populateWith([{ class: k, distribution: 100 }])
    .extendDown(height - 1)
    .terraform((c, x, y) => (c === undefined ? new cp(x, y) : c))
    .wrapEdges();
};

const lastPath = window.location.pathname.match(/\/(\w+)$/);
const asInt = parseInt(get(lastPath, 1), 10);
const r = asInt || 30;

new CellAutomata(Rule(r)(128, 80), { maxSteps: 1000, cellSize: 8 }).noBorder().start();
