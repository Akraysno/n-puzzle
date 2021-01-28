import { Injectable } from "@angular/core";
import { NPuzzleAlgo } from '../__models/enums/n-puzzle-algo.enum';
import { NPuzzleHeuristics } from "../__models/enums/n-puzzle-heuristics.enum";
//import { Heuristics } from "./new/heuristics";
import { NPuzzle, TileMove } from "../__models/n-puzzle.entity";
import * as moment from 'moment'
import * as _ from 'lodash'
import { Observable } from "rxjs";
import { NPuzzleFinalState } from "../__models/enums/n-puzzle-final-state.enum";
import { PriorityQueue } from "../_classes/priority-queue.class";
import { Node } from "../_classes/node.class";
import { State } from "../_classes/state.class";

export type DistHeuristic = (board: number[], final: number[], size: number) => number;
export type Solver = (board: State, heuristic: DistHeuristic) => any; // Set return type

@Injectable()
export class NPuzzleService {
  solvers: { [id: string]: Solver; } = {
    //[NPuzzleAlgo.ASTAR]: NPuzzleSolvers.aStar,
    //[NPuzzleAlgo.SLOW_ASTAR]: NPuzzleSolvers.aStarStandard,
    //[NPuzzleAlgo.WEIGHTED_ASTAR]: NPuzzleSolvers.aStarWeighted,
    //[NPuzzleAlgo.BEST_FIRST]: NPuzzleSolvers.bestFirst,
  };
  heuristics: { [key: string]: DistHeuristic } = {
    //[NPuzzleHeuristics.HAMMING]: Heuristics.hamming,
    //[NPuzzleHeuristics.CARTESIAN]: Heuristics.cartesian,
    //[NPuzzleHeuristics.MANHATTAN]: Heuristics.manhattan,
    //[NPuzzleHeuristics.LINEAR_CONFLICT]: Heuristics.linearConflict,
  }

  constructor() { }

  resolvePuzzle(type: NPuzzleAlgo, size: number, startState: number[], finalState: number[]): Observable<NPuzzle> {
    return new Observable(obs => {
      console.log(type, size, startState, finalState)
      this.checkPuzzle(startState, size, false)
      this.checkPuzzle(finalState, size, true)
      let nPuzzle = new NPuzzle()
      nPuzzle.final = finalState
      nPuzzle.origin = startState
      nPuzzle.type = type
      nPuzzle.size = size
      nPuzzle.solvable = this.validateInversions(size, startState, finalState)
      console.log(nPuzzle)
      if (nPuzzle.solvable) {
        let startTime = moment()
        let search = new SearchUsingAStar(new State(_.flatten(nPuzzle.origin), _.flatten(nPuzzle.final)), new State(_.flatten(nPuzzle.final), _.flatten(nPuzzle.final)))
        let solution = search.search()
        let operations = solution.map(s => new TileMove(s.state.swip, s.state.moveDirection))
        nPuzzle.nbMoves = solution.length
        nPuzzle.operations = operations
        nPuzzle.nbCloseList = search.closedList.size
        nPuzzle.nbOpenList = search.openList.count()
        nPuzzle.duration = moment().diff(startTime)
        obs.next(nPuzzle)
        obs.complete()
      } else {
        obs.error(`Le puzzle ne peut pas être résolu`)
      }
    })
  }

  checkPuzzle(puzzle: number[], size: number, isFinalBoard: boolean = false): boolean {
    if (
      size < 1 ||
      ((size * size) !== puzzle.length)
    ) {
      //throw new BadRequestException(`La taille de l'état ${isFinalBoard ? 'final' : 'de départ'} ne correspond pas à la taille indiquée`)
    }

    // Verify numbers in board
    let numbersList = puzzle.map(v => v).sort((a, b) => a > b ? 1 : -1)
    numbersList.forEach((num: number, index: number) => {
      if (num !== index) {
        //throw new BadRequestException(`Les nombres de l'état ${isFinalBoard ? 'final' : 'de départ'} sont incorrects`)
      }
    });

    return true
  }





  generateRandomBoard(size?: number): number[] {
    if (!size || size <= 0) {
      size = 3
    }
    let tmpArray: number[] = Array(Math.pow(size, 2)).fill(-1).map((v, i) => i)
    let shuffleArray: number[] = []
    while (tmpArray.length > 0) {
      let r = Math.floor(Math.random() * tmpArray.length);
      shuffleArray.push(tmpArray.splice(r, 1)[0])
    }
    return shuffleArray
  }

  generateFinalBoard(size: number, type: NPuzzleFinalState = NPuzzleFinalState.SPIRAL): number[] {
    let final: number[][] = []
    if (type === NPuzzleFinalState.LINE) {
      let len = Math.pow(size, 2)
      let finalBoard: number[] = Array(len).fill(0, 0, len).map((v, i) => (i + 1) === len ? 0 : (i + 1))
      final = this.chunkArray(finalBoard, size)
    } else if (type === NPuzzleFinalState.SPIRAL) {
      final = Array(size).fill(null, 0, size).map(row => {
        return Array(size).fill(-1, 0, size)
      })

      let nbCase: number = size * size
      let dirIsHoriz: boolean = true
      let x: number = 0
      let y: number = 0
      let xNeg: boolean = false
      let yNeg: boolean = false
      let nbCaseFilled: number = 0

      while (nbCase !== nbCaseFilled) {
        final[x][y] = nbCaseFilled + 1 < nbCase ? nbCaseFilled + 1 : 0
        if (dirIsHoriz === true) {
          if (y < size - 1) {
            if (final[x][y + (yNeg ? -1 : 1)] === -1) {
              y += (yNeg ? -1 : 1)
            } else {
              x += (xNeg ? -1 : 1)
              dirIsHoriz = false
              yNeg = !yNeg
            }
          } else {
            x += (xNeg ? -1 : 1)
            dirIsHoriz = false
            yNeg = !yNeg
          }
        } else {
          if (x < size - 1) {
            if (final[x + (xNeg ? -1 : 1)][y] === -1) {
              x += (xNeg ? -1 : 1)
            } else {
              y += (yNeg ? -1 : 1)
              dirIsHoriz = true
              xNeg = !xNeg
            }
          } else {
            y += (yNeg ? -1 : 1)
            dirIsHoriz = true
            xNeg = !xNeg
          }
        }
        nbCaseFilled++
      }
      final
    }
    return this.flattenArray(final)
  }

  validateInversions(boardSize: number, board: number[], finalBoard: number[]) {
    let start: number[][] = this.chunkArray(board, boardSize)
    let final: number[][] = this.chunkArray(finalBoard, boardSize)
    const findD = () => {
      let xi: number
      let yi: number
      let xf: number
      let yf: number
      for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
          if (start[i][j] === 0) {
            xi = j
            yi = i
            break
          }
        }
      }
      if (boardSize % 2 !== 0) {
        xf = Math.ceil(boardSize / 2)
        yf = Math.ceil(boardSize / 2)
      } else {
        xf = boardSize / 2 - 1
        yf = boardSize / 2
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

  private chunkArray(arr: any[], size: number) {
    let resultArray: any[][] = []
    let nbRow: number = Math.ceil(arr.length / size)
    for (let i = 0; i < nbRow; i++) {
      let index = i * size
      resultArray.push(arr.slice(index, index + size))
    }
    return resultArray
  }

  private flattenArray(arr: any[][]) {
    let resultArray: any[] = []
    for (let cell of arr) {
      resultArray = resultArray.concat(cell)
    }
    return resultArray
  }

}


/*
export class NPuzzleSolvers {

  static aStarStandard(start: State, heuristic: DistHeuristic): any { // Set return type
    const opened = new PriorityQueue();
    const closed = new Map<string, number>();
    let nb_tries = 0;
    opened.insert(start, start.totalDist(heuristic));
    while (!opened.isEmpty()) {
      nb_tries += 1;
      const state_e = opened.getAndRemoveTop();
      if (state_e.get_h(heuristic) === 0) {
        return [state_e, nb_tries, opened.count() + closed.size];
      }
      closed.set(state_e.hash(), state_e.g);
      for (const state of state_e.expand()) {
        const similar_state: State | undefined = opened.get(state);
        if (similar_state) {
          if (state.g < similar_state.g) {
            opened.insert(state, state.totalDist(heuristic));
          }
          continue;
        }
        const closed_dist = closed.get(state.hash());
        if (typeof closed_dist !== 'undefined') {
          if (state.g < closed_dist) {
            opened.insert(state, state.totalDist(heuristic));
            closed.delete(state.hash());
          }
          continue;
        }
        opened.insert(state, state.totalDist(heuristic));
      }
    }
    throw 'impossible';
  }


  static _aStar(start: State, heuristic: DistHeuristic): any { // Set return type
    const opened = new PriorityQueue();
    const closed = new Map<string, number>();
    let nb_tries = 0;
    opened.insert(start, start.totalDist(heuristic));
    while (!opened.isEmpty()) {
      nb_tries += 1;
      const state_e = opened.getAndRemoveTop();
      if (state_e.get_h(heuristic) === 0) {
        return [state_e, nb_tries, opened.count() + closed.size];
      }
      const state_e_hash = state_e.hash();
      const closed_dist = closed.get(state_e_hash);
      if (typeof closed_dist !== 'undefined' && state_e.g >= closed_dist) {
        continue;
      }
      closed.set(state_e_hash, state_e.g);
      for (const state of state_e.expand()) {
        opened.insert(state, state.totalDist(heuristic));
      }
    }
    throw 'impossible';
  }
  static aStar(start: State, heuristic: DistHeuristic): any { // Set return type
    const opened = new PriorityQueue();
    const closed = new Map<string, number>();
    let nb_tries = 0;
    opened.insert(start, start.totalDist(heuristic));
    while (!opened.isEmpty()) {
      nb_tries += 1;
      const state_e = opened.getAndRemoveTop();
      if (state_e.get_h(heuristic) === 0) {
        return [state_e, nb_tries, opened.count() + closed.size];
      }
      const state_e_hash = state_e.hash();
      const closed_dist = closed.get(state_e_hash);
      if (typeof closed_dist !== 'undefined' && state_e.g >= closed_dist) {
        continue;
      }
      closed.set(state_e_hash, state_e.g);
      for (const state of state_e.expand()) {
        opened.insert(state, state.totalDist(heuristic));
      }
    }
    throw 'impossible';
  }

  static aStarInterractive(start: State, heuristic: DistHeuristic): Generator<[State, string], State, unknown> {
    const opened = new PriorityQueue();
    const closed = new Map<string, number>();
    opened.insert(start, start.totalDist(heuristic));
    while (!opened.isEmpty()) {
      const state_e = opened.getAndRemoveTop();
      const state_e_hash = state_e.hash();
      const closed_dist = closed.get(state_e_hash);
      if (typeof closed_dist !== 'undefined' && state_e.g >= closed_dist) {
        continue;
      }
      if (state_e.get_h(heuristic) === 0) {
        return state_e;
      }
      yield[state_e, 'opened: ' + opened.count() + ' closed: ' + closed.size];
      closed.set(state_e_hash, state_e.g);
      for (const state of state_e.expand()) {
        opened.insert(state, state.totalDist(heuristic));
      }
    }
    throw 'impossible';
  }

  static bestFirst(start: State, heuristic: DistHeuristic): any { // Set return type
    const opened = new PriorityQueue();
    const closed = new Map<string, number>();
    let nb_tries = 0;
    opened.insert(start, start.get_h(heuristic));
    while (!opened.isEmpty()) {
      nb_tries += 1;
      const state_e = opened.getAndRemoveTop();
      const state_e_hash = state_e.hash();
      const closed_dist = closed.get(state_e_hash);
      if (typeof closed_dist !== 'undefined' && state_e.g >= closed_dist) {
        continue;
      }
      if (state_e.get_h(heuristic) === 0) {
        return [state_e, nb_tries, opened.count() + closed.size];
      }
      // console.log('state:', state_e);
      // console.log('opened:', opened.size(), 'closed:', closed.size);
      closed.set(state_e_hash, state_e.g);
      for (const state of state_e.expand()) {
        opened.insert(state, state.get_h(heuristic));
      }
    }
    throw 'impossible';
  }

  static aStarWeighted(start: State, heuristic: DistHeuristic): any { // Set return type

  }
}
*/

export class SearchUsingAStar {
  root: Node
  start: State
  goal: State
  solution: Node[] = []
  solved: boolean = false
  openList: PriorityQueue = new PriorityQueue()
  closedList: Set<String> = new Set()

  constructor(start: State, goal: State) {
    this.start = start
    this.goal = goal
    this.root = new Node(start, 0, null);
  }

  isClosed(state: State) {
    return !!this.closedList.has(state.arr.toString())
  }

  addToCloseList(node: Node) {
    let key = node.state.arr.toString()
    this.closedList.add(key)
  }

  search() {
    this.openList = new PriorityQueue();
    this.openList.add(this.root);
    this.addToCloseList(this.root);
    let solution: Node[] = []

    while (this.openList.count() > 0) {
      let current: Node = this.openList.getAndRemoveTop();
      if (this.goal.equals(current.state, this.goal)) {
        // fill the solution.
        let s: Node = current;
        do {
          solution.unshift(s);
          s = s.parent;
        } while (s != null);
        let us = solution.map(uss => {
          return {
            cost: uss.cost,
            depth: uss.depth,
            board: uss.state.arr
          }
        })
        console.log(JSON.stringify(us))
        let nbMove = solution.length - 1 // don't count start state
        console.log(`Solution found.. [${this.closedList.size}]\nTotal moves needed : ${nbMove}`)
        this.solution = solution
        this.solved = true
        break
      }

      let zero: number = current.state.findEmptyTileIndex();
      let neighbours: number[] = current.state.getNeighboursForIndex(zero)

      for (let next of neighbours) {
        let state: State = new State(current.state, current.state.goal);
        state.swapWithEmpty(next);
        if (!this.isClosed(state)) {
          let n: Node = new Node(state, current.depth + 1);
          n.parent = current;
          this.openList.add(n);
          this.addToCloseList(n)
        }
      }
    }
    return this.solution
  }

}


