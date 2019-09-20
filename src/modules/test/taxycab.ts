import { NPuzzleService, TileCoords } from '../n-puzzle/n-puzzle.service'

export class ManHattanDistance {
	constructor( private readonly nPuzzleService: NPuzzleService) { }

	CalcDist(Goal: any, Board: number[][]): number {
		// Calc dist for a D1 array
		const TmpDist = (x, indexX) => {
			const SubDist = x.map((y, indexY) => {
				const dest: any = this.nPuzzleService.searchNumberInBoard(Goal, Goal[indexX][indexY])
				return (Math.abs((indexX - dest.row)) + Math.abs((indexY - dest.cell)))
			})
			// reduce the D1 array to return only total dist
			SubDist.reduce((accumulator, currentValue) => accumulator + currentValue)
			return SubDist[0]
		}
		// Apply the previous on all the board(D2 array)
		const TmpList = Board.map((x, indexX) => TmpDist(x, indexX))
		return TmpList.reduce((accumulator, currentValue) => accumulator + currentValue)[0]
	}

//  to be exported as solo class

	lookPossibilities(board: number[][], tile: number = 0): OptionList[] {
		let coords = this.nPuzzleService.searchNumberInBoard(board, tile)
		let options: OptionList[] = []

		if (coords.row - 1 >= 0) { // top
			let newBoard = board.slice()
			let tmpTile = newBoard[coords.row - 1][coords.cell]
			newBoard[coords.row - 1][coords.cell] = 0
			newBoard[coords.row][coords.cell] = tmpTile
			options.push(new OptionList({ board: newBoard }))
		}
		if (coords.cell + 1 <= board[coords.row].length) { // right
			let newBoard = board.slice()
			let tmpTile = newBoard[coords.row][coords.cell + 1]
			newBoard[coords.row][coords.cell + 1] = 0
			newBoard[coords.row][coords.cell] = tmpTile
			options.push(new OptionList({ board: newBoard }))
		}
		if (coords.row + 1 <= board.length) { // bottom
			let newBoard = board.slice()
			let tmpTile = newBoard[coords.row + 1][coords.cell]
			newBoard[coords.row + 1][coords.cell] = 0
			newBoard[coords.row][coords.cell] = tmpTile
			options.push(new OptionList({ board: newBoard }))
		}
		if (coords.cell - 1 >= 0) { // left
			let newBoard = board.slice()
			let tmpTile = newBoard[coords.row][coords.cell - 1]
			newBoard[coords.row][coords.cell - 1] = 0
			newBoard[coords.row][coords.cell] = tmpTile
			options.push(new OptionList({ board: newBoard }))
		}

		return options
	}

	getPossibilities(board: number[][], tile: number = 0) {
		let coords = this.nPuzzleService.searchNumberInBoard(board, tile)
		let directions: MoveDirection[] = []

		if (coords.row - 1 >= 0) {
			directions.push(MoveDirection.TOP)
		}
		if (coords.cell + 1 <= board[coords.row].length) {
			directions.push(MoveDirection.RIGHT)
		}
		if (coords.row + 1 <= board.length) {
			directions.push(MoveDirection.BOTTOM)
		}
		if (coords.cell - 1 >= 0) {
			directions.push(MoveDirection.LEFT)
		}

		return directions
	}

	DoStuff(open: OptionList[], closed: OptionList[]): OptionList[] {
		const current: OptionList = open[0]
		const NewPossible: OptionList[] = this.lookPossibilities(current.board)
		const Indextmp: number = NewPossible.findIndex(() => {
			return false
		}) // find smallest x.dist and check if equivalent in closed
		const tmp = NewPossible.splice(Indextmp, 1).shift()
		NewPossible.forEach((x) => {
			open.push(x)
		})
		// put current into closed ; is closed in DB ?
		closed.push(current)
		open[0] = tmp
		return open
	}

	LoopOver(Board: number[][], open: OptionList[], closed: OptionList[]) {//: OptionList[] {
		while (open.length > 0) {
			open.sort() // sort by dist and len
			this.DoStuff(open, closed) // eval the possible Board, then put current into closed and new possibility in open
		}
	}
}

class OptionList {
	dist?: number
	len?: number
	fScore?: number
	board?: number[][]

	constructor(value?: OptionList) {
		this.dist = value.dist
		this.len = value.len
		this.fScore = value.fScore
		this.board = value.board
	}
}

enum MoveDirection {
	TOP = 'TOP',
	RIGHT = 'RIGHT',
	BOTTOM = 'BOTTOM',
	LEFT = 'LEFT',
}
