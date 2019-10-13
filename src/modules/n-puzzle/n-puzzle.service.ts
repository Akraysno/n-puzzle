import { Component, BadRequestException, flatten } from '@nestjs/common';
import { ResolvePuzzleDto } from './dto/resolve-puzzle.dto';
import * as _ from 'lodash'
import * as moment from 'moment'
import { NPuzzle, TileMove } from '../_entities/n-puzzle/n-puzzle.entity'
import { NPuzzleAlgo } from '../_entities/n-puzzle/enums/n-puzzle-algo.enum';
import { TileMoveDirection } from 'modules/_entities/n-puzzle/enums/tile-move-direction.enum';

@Component()
export class NPuzzleService {
    constructor() { 
        this.defaultRun()
    }

    async defaultRun() {
        let puzzle = '3\n2 3 7\n8 0 4\n6 5 1'
        let solution = await this.resolvePuzzle(puzzle, NPuzzleAlgo.MANHATTAN)
        console.log(`Finish in ${solution.duration} millisecondes`)
    }

    /**
     * Resolve a puzzle
     * 
     * @param dto 
     */
    async resolvePuzzle(puzzle: string, type: NPuzzleAlgo) { //: Promise<NPuzzle> {
        let fileChecker: FileChecker = this.checkFile(puzzle)
        let finalBoard: number[][] = this.generateFinalBoard(fileChecker.size);
        let nPuzzle = new NPuzzle()
        let startTime = moment()
        nPuzzle.final = _.flatten(finalBoard)
        nPuzzle.origin = _.flatten(fileChecker.board)
        nPuzzle.type = type
        nPuzzle.size = fileChecker.size
        console.log('Start is : \n', this.boardToString(fileChecker.board))
        console.log('Goal is  : \n', this.boardToString(finalBoard))
        //nPuzzle = this.solve(nPuzzle)
        //return nPuzzle
        let search = new SearchUsingAStar(new State(_.flatten(nPuzzle.origin), _.flatten(nPuzzle.final)), new State(_.flatten(nPuzzle.final), _.flatten(nPuzzle.final)))
        let solution = await search.search()
        nPuzzle.nbMoves = solution.length - 1 // do not count start state
        nPuzzle.operations = solution.map(s => new TileMove(s.state.swip, s.state.moveDirection))
        nPuzzle.duration = moment().diff(startTime)
        return nPuzzle
    }

    /**
     * Check if file is a valid board
     * 
     * @param fileString 
     */
    checkFile(fileString: string): FileChecker {
        let fileLines: string[] = _.compact(fileString.split('\n').map(line => {
            line = line.trim()
            if (!(line.length && line[0] === '#')) {
                return line
            }
        }))
        let lineSize = fileLines.shift().trim()
        let size = parseInt(lineSize)
        if (size < 1 || size.toString() !== lineSize) {
            throw new BadRequestException('Mauvait format de fichier')
        }
        if (fileLines.length !== size) {
            throw new BadRequestException('La taille du puzzle et le nombre de lignes ne correspondent pas')
        }

        let board: number[][] = []

        for (let line of fileLines) {
            let numbersStr = line.split(' ')
            let numbers = numbersStr.map(n => {
                let num = parseInt(n.trim())
                return num
            }).filter(n => n >= 0)
            board.push(numbers)
        }

        for (let line of board) {
            if (line.length !== size) {
                throw new BadRequestException('La taille du puzzle et la longueur des lignes ne correspondent pas')
            }
        }

        // Verify numbers in board
        let numbersList = _.flattenDeep(board).sort((a, b) => a > b ? 1 : -1)
        numbersList.forEach((num: number, index: number) => {
            if (num !== index) {
                throw new BadRequestException('Les nombres sur la plateau sont incorrect')
            }
        });

        return new FileChecker(size, board)
    }

    /**
     * Generate final board for a specified size
     * 
     * @param size 
     */
    generateFinalBoard(size: number): number[][] {
        let defaultBoard = true
        let final: number[][] = []
        if (defaultBoard === true) {
            let len = Math.pow(size, 2)
            let finalBoard: number[] = Array(len).fill(0, 0, len).map((v, i) => (i + 1) === len ? 0 : (i + 1))
            final = _.chunk(finalBoard, size)
        } else {
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
        return final
    }

    /**
     * Transform board to string ready to print
     * 
     * @param board 
     */
    boardToString(board: number[][]): string {
        let numLen = Math.pow(board.length, 2).toString().length
        let b: string = ''
        for (let r of board) {
            let s: string = (b.length ? '\n' : '') + '\t'
            for (let n of r) {
                let ns = n.toString()
                while (ns.length < numLen) {
                    ns = ' ' + ns
                }
                s += ns + ' '
            }
            b += s
        }
        return b
    }
}

class FileChecker {
    size: number
    board: number[][]

    constructor(size: number, board: number[][]) {
        this.size = size
        this.board = board
    }
}

export class TileCoords {
    row: number
    cell: number
}

class OptionList {
    dist?: number
    len?: number
    fScore?: number
    board?: number[][]
    parent?: number[][]

    constructor(value?: OptionList) {
        this.dist = value.dist
        this.len = value.len
        this.fScore = value.fScore
        this.board = value.board
        this.parent = value.parent
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
            console.log('Construct from array')
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
            this.emptyTileIndex = args._emptyTileIndex;
            this.arr = new Array(this.numRowsOrCols * this.numRowsOrCols)
                .fill(0)
                .map((value: number, index: number) => {
                    if (args.arr[index] === 0) {
                        this.emptyTileIndex = index
                    }
                    return args.arr[index]
                })
        }
        this._goal = goal
        this.createGraphForNPuzzle()
    }

    public equals(tileA: State, tileB: State): boolean {
        return tileA.arr.toString() === tileB.arr.toString()
    }

    public findEmptyTileIndex(): number {
        return this.arr.findIndex(value => value === 0)
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
        console.log('cost', cost)
        return cost;
    }

    public getNeighbours(id: number): number[] {
        return this._neighbours.get(id);
    }

    public createGraphForNPuzzle(): void {
        let numRowsOrCols: number = this.numRowsOrCols
        let arr: number[] = this.arr


        //console.log(this.createGridToPrint())

        for (let i = 0; i < numRowsOrCols; i++) {
            for (let j = 0; j < numRowsOrCols; j++) {
                let index: number = i * numRowsOrCols + j
                //console.log(`current index : ${index}, value ${arr[index]}`)
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
                //console.log(`current index : ${index}, value ${arr[index]}, li: [${li.join(', ')}]`)
                this._neighbours.set(index, li)
            }
        }

    }

    public createGridToPrint() {
        let arr: number[][] = _.chunk(this.arr, this.numRowsOrCols)

        let numLen = this.numRowsOrCols.toString().length
        let b: string = ''
        for (let r of arr) {
            let s: string = (b.length ? '\n' : '') + '\t'
            for (let n of r) {
                let ns = n.toString()
                while (ns.length < numLen) {
                    ns = ' ' + ns
                }
                s += ns + ' '
            }
            b += s
        }
        return b
    }
}

// Neighbours class.
/// this is the class that creates and holds the graph relationship for the 8 puzzle and the empty slot.
/// note that for this simple configuration the 8 puzzle graph is hardcoded.
export class Neighbours {
    private _edges: Map<number, number[]> = new Map<number, number[]>();
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
                console.log(index, li)
                this._edges.set(index, li)
                console.log(this._edges.keys())
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
        console.log(str)
        //Debug.Log(str.ToString());
    }
}

// A rudimentary PriorityQueue implementation.
// it does not cater for performance or efficiency.
export class PriorityQueue {
    // The items and priorities.
    private _nodes: Node[] = []

    // Return the number of items in the queue.
    public count(): number {
        return this._nodes.length;
    }

    public maxCost(): number {
        return Math.max(...this._nodes.map(v => v.cost))
    }

    public minCost(): number {
        return Math.min(...this._nodes.map(v => v.cost))
    }

    // Add an item to the queue.
    public add(n: Node): void {
        this._nodes.push(n)
        this._nodes = this._nodes.sort((a, b) => a.cost < b.cost ? 1 : -1)
    }

    // Get the item with the highest priority (in our case the lowest cost)
    public getAndRemoveTop(): Node {
        // Find the hightest priority.
        let bestIndex: number = 0;
        let bestPriority: number = this._nodes[0].cost;
        for (let i = 1; i < this.count(); i++) {
            if (bestPriority > this._nodes[i].cost) {
                bestPriority = this._nodes[i].cost;
                bestIndex = i;
            }
        }

        return this._nodes.splice(bestIndex, 1).shift()
    }
}

// The A Star search alogorithm implementation for solving 8 puzzle problem.
// This is implemented as a coroutine for Unity. 
//IEnumerator
export class SearchUsingAStar {
    root: Node
    start: State
    goal: State

    constructor(start: State, goal: State) {
        this.start = start
        this.goal = goal
        this.root = new Node(start, 0, null);
    }

    isClosed(state: State, closedlist: Node[]) {
        return closedlist.map(n => n.state.arr.toString()).indexOf(state.arr.toString()) !== -1
    }

    async search() {
        let openlist: PriorityQueue = new PriorityQueue();
        let closedlist: Node[] = []
        openlist.add(this.root);
        closedlist.push(this.root);

        let solved: boolean = false
        let solution: Node[] = []

        console.log('OPEN LIST RESTANTE : ', openlist.count())
        while (openlist.count() > 0 && !solved) {
            let current: Node = openlist.getAndRemoveTop();
            console.log('PARENT : \n', current.parent ? current.parent.state.createGridToPrint() : '\n')
            console.log('CURRENT [' + current.state.swip + '] : \n', current.state.createGridToPrint())
            console.log('GOAL :\n', this.goal.createGridToPrint())
            console.log('DEPTH : ' + current.depth)
            console.log('COST : ', current.cost, '[', openlist.minCost(), ' -> ', openlist.maxCost(), ']')
            if (this.goal.equals(current.state, this.goal)) {
                // fil the solution.
                let s: Node = current;
                do {
                    solution.unshift(s);
                    s = s.parent;
                } while (s != null);

                let nbMove = solution.length - 1 // don't count start state
                console.log(`Solution found..\nTotal moves needed : ${nbMove}`);

                solved = true;
                break;
            }

            let zero: number = current.state.findEmptyTileIndex();
            let neighbours: number[] = current.state.getNeighbours(zero);
            console.log('Voisins: ', neighbours)

            for (let next of neighbours) {
                let state: State = new State(current.state, current.state.goal);
                //console.log(`Swip tile ${next}`)
                state.swapWithEmpty(next);
                //SwapTiles(next, state, false);
                console.log('Liste fermees: ', closedlist.length)
                if (!this.isClosed(state, closedlist)) {
                    //console.log('Add to openList')
                    let n: Node = new Node(state, current.depth + 1);
                    n.parent = current;
                    openlist.add(n);
                    closedlist.push(n);
                    //n.Print(++s_lineNum);
                } else {
                    //console.log('Already explore')
                }
                await new Promise(
                    (resolve, reject) => {
                        setTimeout(() => {
                            resolve()
                        }, 1)
                    })
            }
        }

        return solution
    }

}

