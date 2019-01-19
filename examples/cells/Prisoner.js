// @flow
import { get, maxBy } from 'lodash';
import Cell from './Base';
import type { RGBA } from 'util/types';
import type { DirectionName } from 'cellauto/World';
import { opposingDir } from 'cellauto/World';

type Strategy = 'ALL-D' | 'ALL-C' | 'RAND' | 'TFT' | 'PAV';
type Move = 'C' | 'D';
const SCORES = {
  DC: 3,
  CC: 2,
  DD: 1,
  CD: 0,
};

type T = {
  strategy: Strategy,
  opponent: { [DirectionName]: Move },
};

type O = { strategy: Strategy };

export default class Prisoner extends Cell<T, RGBA, O> {
  scoreMemo: number;
  scoreMemoIndex: number = -1;
  static getInitialState(opts?: O): T {
    const strategy = get(opts, 'strategy', this.randomStrategy());
    return { strategy, opponent: {} };
  }

  static render(strat: T): RGBA {
    switch (strat.strategy) {
      case 'ALL-D':
        return Cell.hexToRgb('#CC4955');
      case 'ALL-C':
        return Cell.hexToRgb('#47cc2f');
      case 'RAND':
        return Cell.hexToRgb('#505050');
      case 'TFT':
        return Cell.hexToRgb('#6c4b32');
      case 'PAV':
        return Cell.hexToRgb('#3c6ea9');
    }
    throw Error('n/a');
  }

  step = (i: number): T => {
    const maxN = maxBy(this.surroundingCells(), c => c.score(i));
    if (maxN && maxN.score(i) > this.score(i)) {
      this.buffer.strategy = maxN.getValue().strategy;
    }
    return this.buffer;
  };

  score = (i: number): number => {
    if (self.scoreMemoIndex !== i) {
      this.scoreMemoIndex = i;
      this.scoreMemo = Object.keys(this.neighbors).reduce((p, c) => {
        const om = get(this.neighbors, [c, 'buffer', 'opponent', opposingDir(c)]);
        const plus = SCORES[this.buffer.opponent[c] + om];
        return p + plus;
      }, 0);
    }
    return this.scoreMemo;
  };

  prepare = () => {
    switch (this.getValue().strategy) {
      case 'ALL-D':
        Object.keys(this.neighbors).forEach(n => {
          this.buffer.opponent[n] = 'D';
        });
        return;
      case 'ALL-C':
        Object.keys(this.neighbors).forEach(n => {
          this.buffer.opponent[n] = 'C';
        });
        return;
      case 'RAND':
        Object.keys(this.neighbors).forEach(n => {
          this.buffer.opponent[n] = Prisoner.randomMove();
        });
        return;
      case 'TFT':
        Object.keys(this.neighbors).forEach(n => {
          let opponentMove = this._getOpponentMove(n);
          this.buffer.opponent[n] = opponentMove || 'C';
        });
        return;
      case 'PAV':
        Object.keys(this.neighbors).forEach(n => {
          let opponentMove = this._getOpponentMove(n);
          switch (opponentMove) {
            case 'C':
              this.buffer.opponent[n] = this.buffer.opponent[n] || 'C';
              break;
            case 'D':
              this.buffer.opponent[n] = Prisoner.flopMove(this.buffer.opponent[n]) || 'C';
              break;
            default:
              this.buffer.opponent[n] = 'C';
              break;
          }
        });
        return;
      default:
        throw Error('no');
    }
  };

  _getOpponentMove = (dir: DirectionName): ?Move => {
    return get(this.getNeighborValue(dir), ['opponent', opposingDir(dir)]);
  };

  static randomStrategy(): Strategy {
    return ['ALL-D', 'ALL-C', 'RAND', 'TFT', 'PAV'][Math.floor(Math.random() * 5)];
  }

  static randomMove(): Move {
    return ['C', 'D'][Math.floor(Math.random() * 2)];
  }

  static flopMove(m: ?Move): ?Move {
    if (m) {
      return m === 'C' ? 'D' : 'C';
    }
    return null;
  }
}
