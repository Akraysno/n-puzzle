import { Component, BadRequestException, flatten } from '@nestjs/common';
import { ResolvePuzzleDto } from './dto/resolve-puzzle.dto';
import * as _ from 'lodash'
import * as moment from 'moment'
import * as fs from 'fs'
import { NPuzzle, TileMove } from '../_entities/n-puzzle/n-puzzle.entity'
import { NPuzzleAlgo } from '../_entities/n-puzzle/enums/n-puzzle-algo.enum';
import { TileMoveDirection } from 'modules/_entities/n-puzzle/enums/tile-move-direction.enum';
import { spawn } from 'child_process'

@Component()
export class NPuzzleService {
    constructor() {
        setTimeout(() => this.loopRun(1, 10, 0, -1), 5000)
    }

    async loopRun(counter: number, limit: number, finished: number, maxDuration:number) {
        let duration = -1
        try {
            duration = await this.defaultRun()
        } catch (e) {
            console.log(` ===> ${e.message ? e.message.message || e.toString() : e.toString()}`,)
            counter--
        }
        finished++
        maxDuration = duration > maxDuration ? duration : maxDuration
        if(counter < limit) {
            console.log(`\n${counter}---------------[${finished}]  --  ${moment().format('LLL')}\n`)
            counter++
            await this.loopRun(counter, limit, finished, maxDuration)
        } else {
            console.log(`\n ===>  FINISH : Duration max is ${maxDuration}ms for ${finished} puzzles`)
        }
    }

    async defaultRun() {
        let puzzle = await this.generateRandomBoard(3)//'3\n7 8 2\n0 4 6\n3 5 1'//'3\n2, 5, 7\n 0, 3, 4\n 6, 1, 8'//
        process.env.DEBUG === 'true' ? console.log(puzzle) : 0
        let solution = await this.resolvePuzzle(puzzle, NPuzzleAlgo.MANHATTAN)
        return 0
        console.log(`Finish in ${solution.duration} millisecondes`)
        return solution.duration
    }

    /**
     * Resolve a puzzle
     * 
     * @param dto 
     */
    async resolvePuzzle(puzzle: string, type: NPuzzleAlgo) { //: Promise<NPuzzle> {
        let fileChecker: FileChecker = this.checkFile(puzzle)
        let finalBoard: number[][] = this.generateFinalBoard(fileChecker.size);
        console.log('Start is : \n', this.boardToString(fileChecker.board))
        //console.log('Goal is  : \n', this.boardToString(finalBoard))
        let isSolvable: boolean = await this.validateInversions(fileChecker.size, _.flatten(fileChecker.board), _.flatten(finalBoard))
        if (!isSolvable) {
            throw new BadRequestException('Le puzzle ne peut être résolu')
        }
        process.env.DEBUG === 'true' ? console.log(isSolvable, await this.getSolvability(fileChecker.size, _.flatten(fileChecker.board), _.flatten(finalBoard))) : 0
        //throw new BadRequestException()
        let nPuzzle = new NPuzzle()
        nPuzzle.final = _.flatten(finalBoard)
        nPuzzle.origin = _.flatten(fileChecker.board)
        nPuzzle.type = type
        nPuzzle.size = fileChecker.size
        process.env.DEBUG === 'true' ? console.log('Start is : \n', this.boardToString(fileChecker.board)) : 0
        process.env.DEBUG === 'true' ? console.log('Goal is  : \n', this.boardToString(finalBoard)) : 0
        //nPuzzle = this.solve(nPuzzle)
        //return nPuzzle
        let startTime = moment()
        let python = true
        if (python) {
            let py = spawn('python3', ['./scripts/puzzle-resolver.py', _.flatten(nPuzzle.origin), _.flatten(nPuzzle.final)])
            py.stdout.on('data', (data) => { 
                console.log('DATAAAAAAAAAA--------------------------------------------------------', _.flatten(nPuzzle.origin))
                console.log(data.toString())
                return 
            })
        } else {
            let search = new SearchUsingAStar(new State(_.flatten(nPuzzle.origin), _.flatten(nPuzzle.final)), new State(_.flatten(nPuzzle.final), _.flatten(nPuzzle.final)))
            let solution = await search.search()
            nPuzzle.nbMoves = solution.length - 1 // do not count start state
            nPuzzle.operations = solution.map(s => new TileMove(s.state.swip, s.state.moveDirection))
            nPuzzle.duration = moment().diff(startTime)
            return nPuzzle
        }
    }

    /**
     * Generate random board for the given size
     * 
     * @param size
     */
    async generateRandomBoard(size?: number): Promise<string> {
        if (!size || size <= 0) {
            size = 3
        }
        let tmpArray: number[] = Array(Math.pow(size, 2)).fill(-1).map((v, i) => i)
        let shuffleArray: number[] = [] 
        while (tmpArray.length > 0) {
            let r = Math.floor(Math.random() * tmpArray.length);
            shuffleArray.push(tmpArray.splice(r, 1)[0])
        }
        let chunkedArray: string[] = _.chunk(shuffleArray, size).map((chunk: number[])=> chunk.join(' '))
        let board: string = `${size}\n${chunkedArray.join('\n')}`
        return board
    }

    async getSolvability (boardSize: number, board: number[], final: number[]): Promise<boolean> { 
        let isSolvable: boolean = false
        if (boardSize % 2 !== 0) {
            let count: number = 0; 
            for (let i = 0; i < board.length - 1; i++) {
                for (let j = i+1; j < board.length; j++) {
                    let index = final.indexOf(j) 
                    if (board[i] !== 0 && final[index] !== 0 && board[i] > final[index]) {
                        process.env.DEBUG === 'true' ? console.log(board[i] , final[index] , board[j]) : 0
                        count++; 
                    }
                }
            }
            process.env.DEBUG === 'true' ? console.log(count, count % 2) : 0
            isSolvable = count % 2 === 0
        } else {

        }
        return isSolvable
    } 

    async validateInversions(boardSize: number, board: number[], final: number[]) {
        let size = boardSize * boardSize - 1
        let CountNumberOfRegularInversions = (toCheck: number[]) => {
            let num: number = 0;
            for (let i = 0; i < size; i++) {
                if (toCheck[i] !== 0) {
                    for (let j = i + 1; j < size + 1; j++) {
                        if (toCheck[j] !== 0 && toCheck[i] > toCheck[j]) {
                            num++;
                        }
                    }
                }
            }
            return num;
        }

        let numberOfInversions: number = CountNumberOfRegularInversions(board)
        let numberOfInversionsSolution: number = CountNumberOfRegularInversions(final)
        let chunkedBoard: number[][] = _.chunk(board, boardSize)
        let chunkedFinal: number[][] = _.chunk(final, boardSize)
        console.log('numberOfInversions', numberOfInversions)
        console.log('numberOfInversionsSolution', numberOfInversionsSolution)

        let start0Index: number = -1;
        let goal0Index: number = -1;

        for (let i = 0; i < chunkedBoard.length; i++) {
            start0Index = chunkedBoard[i].findIndex(c => c === 0);
            if (start0Index > -1) {
                start0Index = i * chunkedBoard.length + start0Index;
                break;
            }
        }
        for (let i = 0; i < chunkedFinal.length; i++) {
            goal0Index = chunkedFinal[i].findIndex(c => c == 0);
            if (goal0Index > -1) {
                goal0Index = i * chunkedFinal.length + goal0Index;
                break;
            }
        }
        if (chunkedBoard.length % 2 == 0) { // In this case, the row of the '0' tile matters
            numberOfInversions += start0Index / chunkedBoard.length;
            numberOfInversionsSolution += goal0Index / chunkedFinal.length;
        }

        if (numberOfInversions % 2 != numberOfInversionsSolution % 2) {
            return false//throw new BadRequestException("Unsolvable puzzle");
        }
        return true
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
        let defaultBoard = false
        let final: number[][] = []
        if (defaultBoard) {
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
     * Search a tile in the board passed in params
     * Returns the coordinates of the found tile
     * 
     * @param board 
     * @param search 
     */
    searchNumberInBoard(board: number[][], search: number): TileCoords {
        let coords = new TileCoords()
        for (let [index, row] of board.entries()) {
            let searchIndex: number = row.indexOf(search)
            if (searchIndex !== -1) {
                coords.row = index
                coords.cell = searchIndex
                break ;
            }
        }
        return coords
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
            process.env.DEBUG === 'true' ? console.log('Construct from array') : 0
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
        process.env.DEBUG === 'true' ? console.log('cost', cost) : 0
        return cost;
    }

    public getNeighbours(id: number): number[] {
        return this._neighbours.get(id);
    }

    public createGraphForNPuzzle(): void {
        let numRowsOrCols: number = this.numRowsOrCols
        let arr: number[] = this.arr

        //process.env.DEBUG === 'true' ? console.log(this.createGridToPrint()) : 0

        for (let i = 0; i < numRowsOrCols; i++) {
            for (let j = 0; j < numRowsOrCols; j++) {
                let index: number = i * numRowsOrCols + j
                //process.env.DEBUG === 'true' ? console.log(`current index : ${index}, value ${arr[index]}`) : 0
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
                //process.env.DEBUG === 'true' ? console.log(`current index : ${index}, value ${arr[index]}, li: [${li.join(', ')}]`) : 0
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
                process.env.DEBUG === 'true' ? console.log(index, li) : 0
                this._edges.set(index, li)
                process.env.DEBUG === 'true' ? console.log(this._edges.keys()) : 0
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
        process.env.DEBUG === 'true' ? console.log(str) : 0
        //Debug.Log(str.ToString());
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
        this._nodes.forEach(nodes => count += nodes.length );
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
        // Find the hightest priority.
        /*let bestIndex: number = 0;
        let bestPriority: number = this._nodes[0].cost;
        for (let i = 1; i < this.count(); i++) {
            if (bestPriority > this._nodes[i].cost) {
                bestPriority = this._nodes[i].cost;
                bestIndex = i;
            }
        }*/

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

    constructor(start: State, goal: State) {
        this.start = start
        this.goal = goal
        this.root = new Node(start, 0, null);
    }

    isClosed(state: State, closedlist: Node[]) {
        return !!closedlist.find(n => n.state.arr.toString() === state.arr.toString())
    }

    async search() {
        let openlist: PriorityQueue = new PriorityQueue();
        let closedlist: Node[] = []
        openlist.add(this.root);
        closedlist.push(this.root);

        let solved: boolean = false
        let solution: Node[] = []

        let solutionRunning: number = 0

        const testSolution = async (): Promise<Node[]> => {
            let current: Node = openlist.getAndRemoveTop();
            process.env.DEBUG === 'true' ? console.log('PARENT : \n', current.parent ? current.parent.state.createGridToPrint() : '\n') : 0
            process.env.DEBUG === 'true' ? console.log('CURRENT [' + current.state.swip + '] : \n', current.state.createGridToPrint()) : 0
            process.env.DEBUG === 'true' ? console.log('GOAL :\n', this.goal.createGridToPrint()) : 0
            process.env.DEBUG === 'true' ? console.log('DEPTH : ' + current.depth) : 0
            process.env.DEBUG === 'true' ? console.log('COST : ', current.cost, '[', openlist.minCost(), ' -> ', openlist.maxCost(), ']') : 0
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
                console.log(`Solution found.. [${closedlist.length}]\nTotal moves needed : ${nbMove}`)

                return solution
            }

            let zero: number = current.state.findEmptyTileIndex();
            let neighbours: number[] = current.state.getNeighbours(zero);
            process.env.DEBUG === 'true' ? console.log('Voisins: ', neighbours) : 0

            for (let next of neighbours) {
                let state: State = new State(current.state, current.state.goal);
                //console.log(`Swip tile ${next}`)
                state.swapWithEmpty(next);
                //SwapTiles(next, state, false);
                process.env.DEBUG === 'true' ? console.log('Liste fermees: ', closedlist.length) : 0
                if (!this.isClosed(state, closedlist)) {
                    //console.log('Add to openList')
                    let n: Node = new Node(state, current.depth + 1);
                    n.parent = current;
                    openlist.add(n);
                    closedlist.push(n);
                    //n.Print(++s_lineNum);
                } else {
                    //console.log('Already explored')
                }
                /*
                await new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve()
                    }, 1)
                })
                */
            }
        }

        const stackRun = async () => {
                process.env.DEBUG === 'true' ? console.log('OPEN LIST RESTANTE : ', openlist.count()) : 0
                if (solutionRunning < 8 && openlist.count() > 0 && !solution.length) {
                    let s = await testSolution()
                    if (!s || !s.length) {
                        return await stackRun()
                    }
                    //console.log((solution || []).length)
                    return s
                    /*
                    .then(solution => {
                        if (!solution || !solution.length) {
                            console.log('Search solution')
                            stackRun().then(solution =>{
                                console.log('search ended')
                                return (solution)
                            })
                        }
                        console.log((solution || []).length)
                        return (solution)
                    })
                    */
                }
        }

        solution = await stackRun()
        /*
        process.env.DEBUG === 'true' ? console.log('OPEN LIST RESTANTE : ', openlist.count()) : 0
        while (openlist.count() > 0 && !solved) {
            let current: Node = openlist.getAndRemoveTop();
            process.env.DEBUG === 'true' ? console.log('PARENT : \n', current.parent ? current.parent.state.createGridToPrint() : '\n') : 0
            process.env.DEBUG === 'true' ? console.log('CURRENT [' + current.state.swip + '] : \n', current.state.createGridToPrint()) : 0
            process.env.DEBUG === 'true' ? console.log('GOAL :\n', this.goal.createGridToPrint()) : 0
            process.env.DEBUG === 'true' ? console.log('DEPTH : ' + current.depth) : 0
            process.env.DEBUG === 'true' ? console.log('COST : ', current.cost, '[', openlist.minCost(), ' -> ', openlist.maxCost(), ']') : 0
            if (this.goal.equals(current.state, this.goal)) {
                // fil the solution.
                let s: Node = current;
                do {
                    solution.unshift(s);
                    s = s.parent;
                } while (s != null);

                let nbMove = solution.length - 1 // don't count start state
                console.log(`Solution found..\nTotal moves needed : ${nbMove}`)

                solved = true;
                break;
            }

            let zero: number = current.state.findEmptyTileIndex();
            let neighbours: number[] = current.state.getNeighbours(zero);
            process.env.DEBUG === 'true' ? console.log('Voisins: ', neighbours) : 0

            for (let next of neighbours) {
                let state: State = new State(current.state, current.state.goal);
                //console.log(`Swip tile ${next}`)
                state.swapWithEmpty(next);
                //SwapTiles(next, state, false);
                process.env.DEBUG === 'true' ? console.log('Liste fermees: ', closedlist.length) : 0
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
                await new Promise((resolve, reject) => {
                    setTimeout(() => {
                        resolve()
                    }, 1)
                })
            }
        }
        */
        return solution
    }

}

