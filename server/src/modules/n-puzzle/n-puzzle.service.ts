import { Injectable, BadRequestException, flatten } from '@nestjs/common';
import * as _ from 'lodash'
import * as moment from 'moment'
import { NPuzzle, TileMove } from '../../../../shared/models/n-puzzle.entity'
import { NPuzzleAlgo } from '../../../../shared/models/enums/n-puzzle-algo.enum';
import { TileMoveDirection } from '../../../../shared/models/enums/tile-move-direction.enum';
import { NPuzzleFinalState } from '../../../../shared/models/enums/n-puzzle-final-state.enum'

/**
 * Weigthed A* => https://github.com/hjlkon/A-star-algorithm/blob/main/weighted_A_star_Algorithm.m
 */

const USE_PYTHON = false

class ResolveStats {
    unsolvable: number = 0
    solved: number = 0
    tooManyTime: NPuzzle[] = []
    tooManyTimeCount: number = 0
    lessThanOne: number = 0
    rightTime: number = 0
    finished: number = 0
    totalDuration: number = 0
    maxDuration: number = 0
}

@Injectable()
export class NPuzzleService {
    constructor() {
        moment().locale('fr')
    }

    /**
     * Resolve a puzzle
     * 
     * @param dto 
     */
    async resolvePuzzle(type: NPuzzleAlgo, size: number, startState: number[], finalState: number[]): Promise<NPuzzle> {
        const resolveCurrent = async (search: SearchUsingAStar) => {
            return new Promise(async (resolve, reject) => {
                let solution = await search.search()
                let operations = solution.map(s => new TileMove(s.state.swip, s.state.moveDirection))
                resolve(operations)
            })
        }
        console.log(type, size, startState, finalState)
        this.checkPuzzle(startState, size, false)
        this.checkPuzzle(finalState, size, true)
        let nPuzzle = new NPuzzle()
        nPuzzle.final = finalState
        nPuzzle.origin = startState
        nPuzzle.type = type
        nPuzzle.size = size
        nPuzzle.solvable = await this.validateInversions(size, startState, finalState)
        console.log(nPuzzle)
        if (!nPuzzle.solvable) {
            throw new BadRequestException(`Le puzzle ne peut pas être résolu`)
        }
        let startTime = moment()
        let search = new SearchUsingAStar(new State(_.flatten(nPuzzle.origin), _.flatten(nPuzzle.final)), new State(_.flatten(nPuzzle.final), _.flatten(nPuzzle.final)))
        let solution: TileMove[] = (await resolveCurrent(search)) as TileMove[]
        nPuzzle.nbMoves = solution.length
        nPuzzle.operations = solution
        nPuzzle.nbCloseList = search.closedList.size
        nPuzzle.nbOpenList = search.openList.count()
        nPuzzle.duration = moment().diff(startTime)
        return nPuzzle
    }

    async getSolvability(boardSize: number, board: number[], final: number[]): Promise<boolean> {
        let isSolvable: boolean = false
        if (boardSize % 2 !== 0) {
            let count: number = 0;
            for (let i = 0; i < board.length - 1; i++) {
                for (let j = i + 1; j < board.length; j++) {
                    let index = final.indexOf(j)
                    if (board[i] !== 0 && final[index] !== 0 && board[i] > final[index]) {
                        process.env.DEBUG === 'true' ? console.log(board[i], final[index], board[j]) : 0
                        count++;
                    }
                }
            }
            isSolvable = count % 2 === 0
        } else {

        }
        return isSolvable
    }

    async validateInversions(boardSize: number, board: number[], finalBoard: number[]) {
        let start: number[][] = _.chunk(board, boardSize)
        let final: number[][] = _.chunk(finalBoard, boardSize)
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

    /**
     * Check if puzzle is a valid board
     * 
     * @param puzzle 
     */
    checkPuzzle(puzzle: number[], size: number, isFinalBoard: boolean = false): boolean {
        if (
            size < 1 ||
            ((size * size) !== puzzle.length)
        ) {
            throw new BadRequestException(`La taille de l'état ${isFinalBoard ? 'final' : 'de départ'} ne correspond pas à la taille indiquée`)
        }

        // Verify numbers in board
        let numbersList = puzzle.map(v => v).sort((a, b) => a > b ? 1 : -1)
        numbersList.forEach((num: number, index: number) => {
            if (num !== index) {
                throw new BadRequestException(`Les nombres de l'état ${isFinalBoard ? 'final' : 'de départ'} sont incorrects`)
            }
        });

        return true
    }


    chunkArray(arr: any[], size: number) {
        let resultArray: any[][] = []
        let nbRow: number = Math.ceil(arr.length / size)
        for (let i = 0; i < nbRow; i++) {
            let index = i * size
            resultArray.push(arr.slice(index, index + size))
        }
        return resultArray
    }

    flattenArray(arr: any[][]) {
        let resultArray: any[] = []
        for (let cell of arr) {
            resultArray = resultArray.concat(cell)
        }
        return resultArray
    }
}

export class State {
    private _emptyTileIndex: number
    private _arr: number[]
    private _numRowsOrCols: number
    private _neighbours: Map<number, number[]> = new Map<number, number[]>();
    private _swip: number
    private _moveDirection: TileMoveDirection
    private _goal: number[]

    public set arr(arr: number[]) { this._arr = arr }
    public get arr(): number[] { return this._arr }

    public get swip(): number { return this._swip }
    public get moveDirection(): TileMoveDirection { return this._moveDirection }
    public get goal(): number[] { return this._goal }

    public set numRowsOrCols(numRowsOrCols: number) { this._numRowsOrCols = numRowsOrCols }
    public get numRowsOrCols(): number { return this._numRowsOrCols }

    public set emptyTileIndex(emptyTileIndex: number) { this._emptyTileIndex = emptyTileIndex }
    public get emptyTileIndex(): number { return this._emptyTileIndex }

    constructor(args: any, goal: number[]) {
        if (typeof (args) === 'number') {
            this.numRowsOrCols = args
            this.arr = new Array(this.numRowsOrCols * this.numRowsOrCols)
                .fill(0)
                .map((value: number, index: number) => {
                    if (index === 0) {
                        this.emptyTileIndex = index
                    }
                    return index
                })
        } else if (Array.isArray(args)) {
            this.numRowsOrCols = Math.sqrt(args.length);
            this.arr = new Array(this.numRowsOrCols * this.numRowsOrCols)
                .fill(0)
                .map((value: number, index: number) => {
                    if (args[index] === 0) {
                        this.emptyTileIndex = index
                    }
                    return args[index]
                })
        } else {
            this.numRowsOrCols = args.numRowsOrCols;
            this.emptyTileIndex = args.emptyTileIndex;
            this.arr = new Array(this.numRowsOrCols * this.numRowsOrCols)
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
        } else if (diff === this.numRowsOrCols) {
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

            let gx: number = index % this.numRowsOrCols
            let gy: number = Math.floor(index / this.numRowsOrCols)

            let x: number = goalIndex % this.numRowsOrCols;
            let y: number = Math.floor(goalIndex / this.numRowsOrCols);

            let mancost: number = Math.abs(x - gx) + Math.abs(y - gy);
            cost += mancost;

        }
        return cost;
    }

    public getNeighbours(id: number): number[] {
        return this._neighbours.get(id);
    }

    public getNeighboursForIndex(index: number): number[] {
        let i = Math.floor(index / this.numRowsOrCols)
        let j = Math.floor(index % this.numRowsOrCols)
        let li: number[] = []
        if ((i - 1) >= 0) {
            li.push(this.arr[((i - 1) * this.numRowsOrCols) + j])
        }
        if ((i + 1) < this.numRowsOrCols) {
            li.push(this.arr[((i + 1) * this.numRowsOrCols) + j])
        }
        if ((j - 1) >= 0) {
            li.push(this.arr[(i * this.numRowsOrCols) + (j - 1)])
        }
        if ((j + 1) < this.numRowsOrCols) {
            li.push(this.arr[(i * this.numRowsOrCols) + (j + 1)])
        }
        return li
    }

    public createGraphForNPuzzle(): void {
        let numRowsOrCols: number = this.numRowsOrCols
        let arr: number[] = this.arr

        for (let i = 0; i < numRowsOrCols; i++) {
            for (let j = 0; j < numRowsOrCols; j++) {
                let index: number = i * numRowsOrCols + j
                let li: number[] = []
                if (i - 1 >= 0) {
                    li.push(arr[(i - 1) * numRowsOrCols + j])
                }
                if (i + 1 < numRowsOrCols) {
                    li.push(arr[(i + 1) * numRowsOrCols + j]);
                }
                if (j - 1 >= 0) {
                    li.push(arr[i * numRowsOrCols + (j - 1)]);
                }
                if (j + 1 < numRowsOrCols) {
                    li.push(arr[i * numRowsOrCols + (j + 1)]);
                }
                this._neighbours.set(index, li)
            }
        }

    }
}

// Neighbours class.
/// this is the class that creates and holds the graph relationship for the 8 puzzle and the empty slot.
/// note that for this simple configuration the 8 puzzle graph is hardcoded.
export class Neighbours {
    private _edges: Map<number, number[]> = new Map();
    private _instance: Neighbours = null;

    constructor() { }

    public set instance(instance: Neighbours) { this._instance = instance }
    public get instance(): Neighbours { return this._instance || new Neighbours() }

    public getNeighbours(id: number): number[] {
        return this._edges.get(id);
    }

    public createGraphForNPuzzle(rowsOrCols: number): void {
        for (let i = 0; i < rowsOrCols; i++) {
            for (let j = 0; j < rowsOrCols; j++) {
                let index: number = i * rowsOrCols + j
                let li: number[] = []
                if (i - 1 >= 0) {
                    li.push((i - 1) * rowsOrCols + j)
                }
                if (i + 1 < rowsOrCols) {
                    li.push((i + 1) * rowsOrCols + j);
                }
                if (j - 1 >= 0) {
                    li.push(i * rowsOrCols + j - 1);
                }
                if (j + 1 < rowsOrCols) {
                    li.push(i * rowsOrCols + j + 1);
                }
                this._edges.set(index, li)
            }
        }
    }
}

// class Node
/// <summary>
/// A class to hold the State of the 8 puzzle. This is used to create the solution.
/// Node not only holds the state of the 8 puzzle but also the cost associated with the specific state.
/// </summary>
export class Node {
    private _state: State
    private _parent: Node
    private _cost: number
    private _depth: number

    public set state(state: State) { this._state = state }
    public get state(): State { return this._state }

    public set parent(parent: Node) { this._parent = parent }
    public get parent(): Node { return this._parent }

    public set cost(cost: number) { this._cost = cost }
    public get cost(): number { return this._cost }

    public set depth(depth: number) { this._depth = depth }
    public get depth(): number { return this._depth }


    constructor(state: State, depth: number = 0, parent: Node = null) {
        this.state = state;
        this.cost = /*_state.GethammingCost() + */this.state.getManhattanCost() + depth;
        this.parent = parent;
        this.depth = depth;
    }

    // comparison operator based on the cost of the nodes. 
    // This can be used for sorting nodes based on the cost of 
    // the state that it holds.
    public isSuperior(n1: Node, n2: Node): boolean {
        return n1.cost > n2.cost;
    }

    public isInferior(n1: Node, n2: Node): boolean {
        return n1.cost < n2.cost;
    }

    // print the node into the Debug log.
    public print(lineNum: number): void {
        let str: string = ''
        str += `${lineNum} -`
        str += `Node { `
        for (let elem of this.state.arr) {
            str += `${elem}`
        }
        str += ` | D: ${this.depth}, MD: ${this.cost} }`
    }
}

// A rudimentary PriorityQueue implementation.
// it does not cater for performance or efficiency.
export class PriorityQueue {
    // The items and priorities.
    private _nodes: Map<number, Node[]> = new Map()

    // Return the number of items in the queue.
    public count(): number {
        let count = 0
        this._nodes.forEach((nodes, index) => count += nodes.length);
        return count
    }

    public maxCost(): number {
        return Array.from(this._nodes.keys()).pop()
    }

    public minCost(): number {
        return Array.from(this._nodes.keys()).shift()
    }

    // Add an item to the queue.
    public add(n: Node): void {
        let key = n.cost
        let pack = this._nodes.get(key)
        if (!pack) {
            pack = []
        }
        pack.push(n)
        this._nodes.set(key, pack)
    }

    // Get the item with the highest priority (in our case the lowest cost)
    public getAndRemoveTop(): Node {
        let key = this.minCost()
        let pack = this._nodes.get(key)
        let node = pack.shift()
        if (!pack.length) {
            this._nodes.delete(key)
        }

        return node
    }
}

// The A Star search alogorithm implementation for solving 8 puzzle problem.
// This is implemented as a coroutine for Unity. 
//IEnumerator
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
        //return !!this.closedList.get(state.arr.toString())
        return !!this.closedList.has(state.arr.toString())
    }

    addToCloseList(node: Node) {
        let key = node.state.arr.toString()
        //this.closedList.set(key, node)
        this.closedList.add(key)
    }

    async search() {
        this.openList = new PriorityQueue();
        this.openList.add(this.root);
        this.addToCloseList(this.root);
        let solution: Node[] = []
        let solutionRunning: number = 0

        const testSolution = async (): Promise<Node[]> => {
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
                return solution
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

            let memoryUsageStr = `${this.openList.count()} ${this.closedList.size}`
            const used = process.memoryUsage();
            for (let key in used) {
                memoryUsageStr += `\t${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`
            }
            console.log(memoryUsageStr)
        }

        const stackRun = async () => {
            if (solutionRunning < 8 && this.openList.count() > 0 && !solution.length) {
                let s = await testSolution()
                if (!s || !s.length) {
                    return await stackRun()
                }
                return s
            }
        }

        solution = await stackRun()
        return solution
    }

}

