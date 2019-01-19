// @flow
import {
  BufferGeometry,
  BufferAttribute,
  Geometry,
  Line,
  LineBasicMaterial,
  Mesh,
  Points,
  PointsMaterial,
  OrthographicCamera,
  Vector3,
  Material,
} from 'three';
import Base from 'threeUtil/Base';
import { EffectComposer, RenderPass } from 'postprocessing';
import type { RGBA } from 'util/types';
import { World } from 'cellauto/World';

export default class CellAutomata<T, R: RGBA> extends Base {
  // public
  world: World<T, R>;
  cellSize: number;
  bufferThreshold: number;
  buffer: number;
  meshes: Mesh[][];
  maxSteps: ?number;
  drawBorder: boolean;
  spaceBetween: number;

  // Private
  _worldOffset: { x: number, y: number }; // just a memo

  // $FlowIssue
  constructor(world: World<T, R>, { maxSteps, cellSize, bufferThreshold }: Object) {
    super();
    this.world = world;

    // Configurable
    this.cellSize = cellSize || 10;
    this.maxSteps = maxSteps || Math.pow(10, 5);
    this.bufferThreshold = bufferThreshold || 0.01;
    this.drawBorder = true;
    this.spaceBetween = 1;

    this.camera = new OrthographicCamera(
      window.innerWidth / -2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight / -2,
      -10,
      10
    );
    this.buffer = 0;
    this.meshes = [...new Array(world.width).keys()].map(() =>
      [...new Array(world.height).keys()].map(() => null)
    );
    this._setMemo();
  }

  initialise(composer?: ?EffectComposer, renderPass?: ?RenderPass) {
    super.initialise(composer, renderPass);
    this._drawTheWorld(true);
    this._drawBorder();
  }

  update = (delta: number) => {
    this.buffer += delta;
    if (this.buffer > this.bufferThreshold) {
      return this._moveForward();
    }
  };

  noBorder(): CellAutomata<T, R> {
    this.drawBorder = false;
    return this;
  }

  havingSpaceBetween(n: number): CellAutomata<T, R> {
    this.spaceBetween = n;
    this._setMemo();
    return this;
  }

  _moveForward() {
    this.buffer = 0;
    this.world.step();
    this._drawTheWorld();
    if (this.maxSteps && this.world.stepsTaken >= this.maxSteps) {
      return Base.Signals.STOP;
    }
  }

  _drawBorder() {
    if (!this.drawBorder) {
      return;
    }
    // NB linewidth doesn't work on chrome
    const linewidth = 1;
    const xOff = (this.world.width * (this.cellSize + this.spaceBetween)) / 2;
    const zOff = (this.world.height * (this.cellSize + this.spaceBetween)) / 2;
    const border = new Geometry();
    border.vertices.push(new Vector3(-xOff - linewidth, -zOff - linewidth, 0));
    border.vertices.push(new Vector3(xOff + linewidth, -zOff - linewidth, 0));
    border.vertices.push(new Vector3(xOff + linewidth, zOff + linewidth, 0));
    border.vertices.push(new Vector3(-xOff - linewidth, zOff + linewidth, 0));
    border.vertices.push(new Vector3(-xOff - linewidth, -zOff - linewidth, 0));
    const material = new LineBasicMaterial({ color: 0x0, linewidth });
    const line = new Line(border, material);
    this.scene.add(line);
  }

  _drawTheWorld(forTheFirstTime: boolean = false) {
    const {
      world: { grid },
      meshes,
      scene,
      _squareAt,
    } = this;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        const rgba = grid[y][x].getView();
        if (forTheFirstTime) {
          const color = Base.rgbToHex(rgba.r, rgba.g, rgba.b);
          const point = new PointsMaterial({ color, size: this.cellSize, transparent: true });
          meshes[x][y] = _squareAt(x, y, point);
          scene.add(meshes[x][y]);
        } else {
          this.draw(rgba, meshes[x][y]);
        }
      }
    }
  }

  draw(rgba: R, m: Object) {
    const color = Base.rgbToHex(rgba.r, rgba.g, rgba.b);
    const opacity = typeof rgba.a === 'number' ? rgba.a : 1;
    if (m.material.color !== color) {
      m.material.color.setHex(color);
      m.material.needsUpdate = true;
    }
    if (m.material.opacity !== opacity) {
      m.material.opacity = opacity;
      m.material.needsUpdate = true;
    }
  }

  _squareAt = (x: number, y: number, mat: Material) => {
    const {
      cellSize,
      _worldOffset,
      world: { grid },
      spaceBetween,
    } = this;
    const x1 = x * (cellSize + spaceBetween) - _worldOffset.x;
    const y1 = (grid.length - 1 - y) * (cellSize + spaceBetween) - _worldOffset.y;
    const dot = new BufferGeometry();
    const pos = new Float32Array([x1, y1, 0]);
    dot.addAttribute('position', new BufferAttribute(pos, 3));
    return new Points(dot, mat);
  };

  _setMemo() {
    const {
      cellSize,
      spaceBetween,
      world: { width, height },
    } = this;
    const halfCell = (cellSize + spaceBetween) / 2;
    this._worldOffset = {
      x: width * halfCell - halfCell,
      y: height * halfCell - halfCell,
    };
  }
}
