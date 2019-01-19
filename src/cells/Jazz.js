// @flow
import { get } from 'lodash';
import type { RGBA } from 'util/types';
import Rule from 'cellauto/cells/NeighborRule';

export const Piano = (rule: number) => {
  const intervals: (?number)[][] = [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 5, 0],
    [0, 0, 0, 0, 6, -1],
    [0, 4, 0, 0, 1, 0],
    [0, 0, 0, 0, 4, 1],
    [0, 0, 4, 0, 1, 0],
    [0, 0, 4, 0, 0, 1],
    [0, 8, 0, 0, -2, -1],
    [0, 0, 0, 0, 0, 0],
    [0, 3, 5, 0, -2, -1],
    [0, 9, -1, 0, -2, -1],
    [0, 6, -3, 0, 1, 1],
    [0, 0, 0, 0, 0, 0],
    [0, 3, 3, 0, -2, 1],
    [0, 1, 2, 0, 1, 1],
    [0, 10, -2, 0, -2, -1],
    [0, 7, -1, 0, -2, 1],
    [0, 4, -1, 0, 3, -1],
    [0, 0, 0, 0, 0, 0],
    [0, 3, 0, 3, -2, 1],
    [1, 1, 1, 0, 3, -1],
    [1, 1, 1, 3, -2, 1],
  ];
  const rhythmStep = intervals[0].length;

  return class _JazzRule extends Rule(rule) {
    note: number = 77;
    patternIndex: number = Math.floor(Math.random() * intervals.length);
    noteOffset: number = 0;

    getView(): RGBA {
      const on = this.getValue();
      let midi = null;
      if (this.noteOffset > 0) {
        const off = [
          { note: this.note, velocity: 0, channel: 1 },
          { note: this.note + 12, velocity: 0, channel: 1 },
          { note: this.note - 12, velocity: 0, channel: 1 },
        ];
        this.note += this.noteOffset;
        midi = off.concat({
          note: this.note,
          velocity: Math.floor(35 + Math.random() * 60),
          channel: 1,
        });
      }
      if (this.note > 90) {
        this.note -= 12;
      } else if (this.note < 60) {
        this.note += 12;
      } else {
        this.note = this.note - 12 * (this.neighborhood() / 4);
      }
      return on ? { r: 0, g: 255, b: 0, midi } : { r: 0, g: 0, b: 0, midi };
    }

    step = (n: number): boolean => {
      const neigh = this.neighborhood();
      const localStep = n % rhythmStep;
      if (localStep === 0) {
        this.patternIndex = (neigh + n) % intervals.length;
      }
      this.noteOffset = get(intervals, [this.patternIndex, localStep]);
      return this.constructor.transitions[neigh];
    };
  };
};

export const Drum = (rule: number) => {
  const ride: boolean[][] = [
    [false, false, false, false, false, false],
    [false, false, false, false, false, true],
    [false, false, false, false, true, true],
    [false, false, true, false, true, true],
  ];

  return class _JazzRule extends Rule(rule) {
    static render(on: boolean) {
      return on ? { r: 255, g: 0, b: 0 } : { r: 0, g: 0, b: 0 };
    }
  };
};

export const Bass = (rule: number) => {
  const patterns = [0, 5, -2, 3, -4, 1, 6, -1, 4, -3, 2, -5];
  const root = 48;

  return class _JazzRule extends Rule(rule) {
    nextIndex: number = 77;
    note: number = 0;
    neigh: number;
    n: number = 0;

    getView(): RGBA {
      const on = this.getValue();
      const midi = [];
      if (this.n === 2) {
        midi.push({ note: patterns[this.note] + root, velocity: 0, channel: 2 });

        this.note = (this.note + 1) % patterns.length;

        if (this.neigh < 3) {
          midi.push({ note: patterns[this.note] + root - 1, velocity: 50, channel: 2 });
        } else if (this.neigh < 6) {
          midi.push({ note: patterns[this.note] + root + 1, velocity: 50, channel: 2 });
        }
      }
      if (this.n === 4) {
        if (this.neigh < 1) {
          midi.push({ note: patterns[this.note] + root - 1, velocity: 50, channel: 2 });
        } else if (this.neigh < 2) {
          midi.push({ note: patterns[this.note] + root + 1, velocity: 50, channel: 2 });
        }
      }
      if (this.n === 5) {
        midi.push({ note: patterns[this.note] + root + 1, velocity: 0, channel: 2 });
        midi.push({ note: patterns[this.note] + root - 1, velocity: 0, channel: 2 });
        midi.push({ note: patterns[this.note] + root, velocity: 50, channel: 2 });
      }
      return on ? { r: 255, g: 0, b: 0, midi } : { r: 0, g: 0, b: 0, midi };
    }

    step = (n: number): boolean => {
      const neigh = this.neighborhood();
      this.n = n % 6;
      this.neigh = neigh;
      this.nextIndex = (neigh + n) % patterns.length;
      return this.constructor.transitions[neigh];
    };
  };
};
