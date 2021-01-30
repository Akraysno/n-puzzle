import { TileMoveDirection } from "../__models/enums/tile-move-direction.enum"
import * as _ from 'lodash'
import { DistHeuristic } from "./heuristics.class"

export class State {
  private _emptyTileIndex: number
  private _arr: number[]
  private _size: number
  private _swip: number
  private _moveDirection: TileMoveDirection
  private _goal: number[]
  public g: number;
  public h: number;

  public set arr(arr: number[]) { this._arr = arr }
  public get arr(): number[] { return this._arr }

  public get swip(): number { return this._swip }
  public get moveDirection(): TileMoveDirection { return this._moveDirection }
  public get goal(): number[] { return this._goal }

  public set size(size: number) { this._size = size }
  public get size(): number { return this._size }

  public set emptyTileIndex(emptyTileIndex: number) { this._emptyTileIndex = emptyTileIndex }
  public get emptyTileIndex(): number { return this._emptyTileIndex }

  constructor(args: State | number[], goal: number[]) {
    if (Array.isArray(args)) {
      this.size = Math.sqrt(args.length);
      this.arr = new Array(this.size * this.size)
        .fill(0)
        .map((value: number, index: number) => {
          if (args[index] === 0) {
            this.emptyTileIndex = index
          }
          return args[index]
        })
    } else {
      this.size = args.size;
      this.emptyTileIndex = args.emptyTileIndex;
      this.g = args.g ? args.g + 1 : 0
      this.arr = new Array(this.size * this.size)
        .fill(0)
        .map((value: number, index: number) => args.arr[index])
    }
    this._goal = goal
  }

  public equals(tileA: State, tileB: State): boolean {
    return tileA.arr.toString() === tileB.arr.toString()
  }

  public findEmptyTileIndex(): number {
    return this.arr.indexOf(0)
  }

  public randomize(): void {
    let randomizedArray: number[] = []
    let currentArray: number[] = _.cloneDeep(this.arr)
    while (currentArray.length) {
      let index = Math.floor(Math.random() * currentArray.length)
      randomizedArray.push(currentArray.splice(index, 1).shift())
    }
    this.arr = randomizedArray
  }

  public swapWithEmpty(number: number): void {
    let index = this.arr.indexOf(number)
    if (index === -1) {
      return
    }

    let diff = this.emptyTileIndex - index
    if (diff === -1) {
      this._moveDirection = TileMoveDirection.RIGHT
    } else if (diff === 1) {
      this._moveDirection = TileMoveDirection.LEFT
    } else if (diff === this.size) {
      this._moveDirection = TileMoveDirection.TOP
    } else {
      this._moveDirection = TileMoveDirection.BOTTOM
    }
    let tmp: number = this.arr[index];
    this.arr[index] = this.arr[this.emptyTileIndex];
    this.arr[this.emptyTileIndex] = tmp;
    this.emptyTileIndex = index;
    this._swip = number
  }

  // TODO: Fix calc cost
  public getManhattanCost(): number {
    let goal = this._goal
    let cost: number = 0

    for (let [index, num] of this.arr.entries()) {
      if (num === 0) {
        continue
      }

      let goalIndex = goal.indexOf(num)
      if (goalIndex === index) {
        continue
      }

      let gx: number = index % this.size
      let gy: number = Math.floor(index / this.size)

      let x: number = goalIndex % this.size;
      let y: number = Math.floor(goalIndex / this.size);

      let mancost: number = Math.abs(x - gx) + Math.abs(y - gy);
      cost += mancost;

    }
    return cost;
  }

  public getNeighboursForIndex(index: number): number[] {
    let i = Math.floor(index / this.size)
    let j = Math.floor(index % this.size)
    let li: number[] = []
    if ((i - 1) >= 0) {
      li.push(this.arr[((i - 1) * this.size) + j])
    }
    if ((i + 1) < this.size) {
      li.push(this.arr[((i + 1) * this.size) + j])
    }
    if ((j - 1) >= 0) {
      li.push(this.arr[(i * this.size) + (j - 1)])
    }
    if ((j + 1) < this.size) {
      li.push(this.arr[(i * this.size) + (j + 1)])
    }
    return li
  }

  public getHeuristicValue(f: DistHeuristic): number {
    if (!this.h) {
      this.h = f(this.arr, this.goal, this.size);
    }
    return this.h;
  }

  /** @returns g(n) + h(n), also called fScore(n) */
  public getDist(f: DistHeuristic): number {
    return this.g + this.getHeuristicValue(f);
  }


}