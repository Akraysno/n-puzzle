import { Observable } from "rxjs"
import { NPuzzleAlgo } from "../__models/enums/n-puzzle-algo.enum"
import { NPuzzleHeuristics } from "../__models/enums/n-puzzle-heuristics.enum"
import { TileMoveDirection } from "../__models/enums/tile-move-direction.enum"
import { DistHeuristic, Heuristics } from "./heuristics.class"
import { PriorityQueue } from "./priority-queue.class"
import { NPuzzleSolver, Solvers } from "./solvers.class"
import { ExecTime } from "./utils.class"
import { Result } from "./result.class"
import { TileMove } from "../__models/n-puzzle.entity"

export type ClosedList = Set<String>
export type OpenedList = PriorityQueue

export class State {
  public emptyTileIndex: number
  public board: number[] = []
  public final: number[] = []
  public size: number = 0
  public swapNumber: number
  public moveDirection: TileMoveDirection
  public g: number;
  public h: number;
  public w: number;
  public parent: State
  public cost: number
  public depth: number
  public isSolvable: boolean
  private _algo: NPuzzleAlgo
  private _heuristic: NPuzzleHeuristics
  private _execTime: ExecTime
  private _closedList: ClosedList
  private _openedList: OpenedList
  private _result: Result
  private _move: TileMove

  public get closedList() { return this._closedList }
  public get openedList() { return this._openedList }
  public get execTime() { return this._execTime }
  public get algo() { return this._algo }
  public get heuristic() { return this._heuristic }
  public get result() { return this._result }
  public get move() { return this._move }

  constructor(board: number[], final: number[], size: number, parent: State = null, move?: TileMove) {
    this.board = board
    this.final = final
    this.size = size
    this.parent = parent
    this._move = move
    this.g = parent ? parent.g + 1 : 0
    this.w = parent ? parent.w : 1
  }

  /**
   * Function to replace lodash's function _.chunk()
   * 
   * @param arr Array to chunk
   * @param size Max size of each chunk
   */
  private _chunkArray(arr: any[], size: number) {
    let resultArray: any[][] = []
    let nbRow: number = Math.ceil(arr.length / size)
    for (let i = 0; i < nbRow; i++) {
      let index = i * size
      resultArray.push(arr.slice(index, index + size))
    }
    return resultArray
  }

  /**
   * Function to replace lodash's function _.flatten()
   * 
   * @param arr Array to flatten
   */
  private _flattenArray(arr: any[][]) {
    let resultArray: any[] = []
    for (let cell of arr) {
      resultArray = resultArray.concat(cell)
    }
    return resultArray
  }

  static equals(stateA: State, stateB: State): boolean {
    return stateA.board.toString() === stateB.board.toString()
  }

  public findEmptyTileIndex(): number {
    return this.board.indexOf(0)
  }

  public * neighbours(): IterableIterator<State> {
    const newState = (a: number, b: number, direction: TileMoveDirection) => {
      let newBoard = [...this.board];
      newBoard[a] = this.board[b];
      newBoard[b] = this.board[a];
      return new State(newBoard, [...this.final], this.size, this, new TileMove(this.board[b], direction));
    }

    let zeroIndex: number = this.findEmptyTileIndex()
    // Not on first line
    if (zeroIndex - this.size >= 0) {
      yield newState(zeroIndex, zeroIndex - this.size, TileMoveDirection.TOP);
    }
    // Not on last line
    if (zeroIndex + this.size < this.board.length) {
      yield newState(zeroIndex, zeroIndex + this.size, TileMoveDirection.BOTTOM);
    }
    // Not on right column
    if (zeroIndex % this.size != this.size - 1) {
      yield newState(zeroIndex, zeroIndex + 1, TileMoveDirection.RIGHT);
    }
    // Not on left column
    if (zeroIndex % this.size != 0) {
      yield newState(zeroIndex, zeroIndex - 1, TileMoveDirection.LEFT);
    }
  }

  public getHeuristicValue(f: DistHeuristic): number {
    if (!this.h) {
      this.h = f(this.board, this.final, this.size);
    }
    return this.h;
  }

  /** @returns g(n) + w * h(n) */
  public getDist(f: DistHeuristic): number {
    return this.g + this.w * this.getHeuristicValue(f);
  }

  /**
   * Get all parents for current State
   */
  public getHistory(): State[] {
    let solution: State[] = []
    // fill the solution.
    let s: State = this;
    do {
      solution.unshift(s);
      s = s.parent;
    } while (s != null);
    let nbMove = solution.length - 1 // don't count start state
    console.log(`Solution found.. Total moves needed : ${nbMove}`)
    return solution
  }

  /**
   * Check if current puzzle is correctly formatted
   */
  checkPuzzle(): Observable<boolean> {
    return new Observable((obs) => {
      if (this.size < 1) {
        obs.error('Taille du puzzle incorrecte.')
      } else if (this.size * this.size !== this.board.length) {
        obs.error(`La taille de l'état de départ ne correspond pas à la taille indiquée.`)
      } else if (this.size * this.size !== this.final.length) {
        obs.error(`La taille de l'état final ne correspond pas à la taille indiquée.`)
      } else {
        let startNumberList = this.board.map(v => v).sort((a, b) => a > b ? 1 : -1)
        let failIndex = startNumberList.findIndex((val: number, index: number) => val !== index)
        if (failIndex !== -1) {
          obs.error(`Les nombres de l'état de départ sont incorrects.`)
        } else {
          let finalNumberList = this.final.map(v => v).sort((a, b) => a > b ? 1 : -1)
          let failIndex = finalNumberList.findIndex((val: number, index: number) => val !== index)
          if (failIndex !== -1) {
            obs.error(`Les nombres de l'état final sont incorrects.`)
          } else {
            obs.next(true)
            obs.complete()
          }
        }
      }
    })
  }

  /**
   * Verify solvability of current State
   */
  validateInversions() {
    let start: number[][] = this._chunkArray(this.board, this.size)
    let final: number[][] = this._chunkArray(this.final, this.size)
    const findD = () => {
      let xi: number
      let yi: number
      let xf: number
      let yf: number
      for (let i = 0; i < this.size; i++) {
        for (let j = 0; j < this.size; j++) {
          if (start[i][j] === 0) {
            xi = j
            yi = i
            break
          }
        }
      }
      if (this.size % 2 !== 0) {
        xf = Math.ceil(this.size / 2)
        yf = Math.ceil(this.size / 2)
      } else {
        xf = this.size / 2 - 1
        yf = this.size / 2
      }
      let d = Math.abs(xf - xi) + Math.abs(yf - yi)
      return d
    }
    const findP = () => {
      let tab: number[] = []
      let p: number = 0
      for (let line of start) {
        tab = tab.concat(line)
      }
      let finalTab: number[] = []
      for (let line of final) {
        finalTab = finalTab.concat(line)
      }

      for (let i = 0; i < tab.length; i++) {
        for (let j = 0; j < tab.length; j++) {
          if (finalTab.indexOf(tab[i]) > finalTab.indexOf(tab[j])) {
            let tmp = tab[j]
            tab[j] = tab[i]
            tab[i] = tmp
            p++
          }
        }
      }
      return p
    }

    return (findD() % 2) === (findP() % 2)
  }

  /**
   * Function use to validate and solve puzzle.
   * 
   * @param solver Function use to solve puzzle
   * @param heuristic Function use to calculate costs
   * @param moveslog 
   * @returns Array of State objects 
   */
  public solve(solver: NPuzzleAlgo, heuristic: NPuzzleHeuristics, weight: number = 1): Observable<Result> {
    this._algo = solver
    this._heuristic = heuristic
    this.w = weight
    return new Observable(obs => {
      this.checkPuzzle().subscribe(() => {
        this.isSolvable = this.validateInversions()
        if (this.isSolvable) {
          const s: NPuzzleSolver = Solvers.solvers[solver];
          const h: DistHeuristic = Heuristics.heuristics[heuristic];
          if (!s) {
            obs.error(`L'algorithme de résolution '${solver}' n'existe pas.`)
          } else if (!h) {
            obs.error(`L'heuristique '${heuristic}' n'existe pas.`)
          } else {
            //resolve
            this._execTime = new ExecTime();
            this._execTime.start();
            this._openedList = new PriorityQueue()
            this._closedList = new Set()
            const finalState = s(this, h, this.openedList, this.closedList);
            if (finalState) {
              console.log(finalState)
              let totalTime = this._execTime.finish();
  
              console.log("Took " + totalTime + " ms.");
              this._result = new Result(this, finalState)
              obs.next(this.result)
              obs.complete()
            } else {
              obs.error(`Aucune solution trouvé pour cette configuration`)
            }
          }
        } else {
          obs.error(`Le puzzle ne peut pas être résolu.`)
        }
      }, err => obs.error(err))
    })
  }

  public toString(): string {
    const max_len = this.board.reduce((acc, x) => acc > x ? acc : x).toString().length;
    let out = "";
    out += "# Permutations done: " + this.g + "\n";
    out += "# Heuristic distance to finish: " + this.h + "\n";
    out += this.size + "\n";
    this.board.forEach((x, i) => {
      let x_str = x.toString();
      while (x_str.length < max_len)
        x_str += ' ';
      if ((i + 1) % this.size === 0) {
        out += x_str + "\n";
      } else {
        out += x_str + " ";
      }
    });
    return out;
  }

  public getClosedListKey(): string {
    return this.board.toString()
  }

}