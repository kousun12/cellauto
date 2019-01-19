// @flow
import { get } from 'lodash';
import WebMidi from 'webmidi';
import CellAutomata from 'cellauto/CellAutomata';
import Jazz from 'cellauto/worlds/Jazz';
import { World } from 'cellauto/World';
import type { RGBA } from 'util/types';

type Midi = { note: number, velocity: number, channel: number };
type RGBAM = RGBA & { midi?: Midi | Midi[] };

const lastPath = window.location.pathname.match(/\/(\w+)$/);
const r = parseInt(get(lastPath, 1), 10) || 30;

let output;
const rhythmSteps = 6;

class JazzAutomata<T, R: RGBAM> extends CellAutomata<T, R> {
  tempo: number = 120;

  constructor(world: World<T, RGBAM>, opts: Object) {
    super(world, opts);
  }

  draw(rgba: R, m: Object) {
    super.draw(rgba, m);
    if (output && rgba.midi) {
      if (Array.isArray(rgba.midi)) {
        rgba.midi.forEach(midi =>
          output.playNote(midi.note, midi.channel, { velocity: midi.velocity / 127 })
        );
      } else {
        output.playNote(rgba.midi.note, rgba.midi.channel, { velocity: rgba.midi.velocity / 127 });
      }
    }
  }

  _moveForward() {
    super._moveForward();
    const step = this.world.stepsTaken % rhythmSteps;
    // TODO make these dynamic (euclidean rhythm?)
    if (step === 2 || step === 5) {
      this.bufferThreshold = (60 / this.tempo) * (1 / 3);
    } else if (step === 0 || step === 3) {
      this.bufferThreshold = (60 / this.tempo) * (4 / 15);
    } else {
      this.bufferThreshold = (60 / this.tempo) * (2 / 5);
    }
  }
}

WebMidi.enable((e: any) => {
  if (e) {
    console.warn('error with webmidi', e);
  } else {
    if (WebMidi.outputs.length > 0) {
      output = WebMidi.outputs[0];
    }
  }
});

new JazzAutomata(Jazz(r)(64, 24), { maxSteps: 1000, cellSize: 24 }).start();
