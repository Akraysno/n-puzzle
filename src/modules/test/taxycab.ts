import { NPuzzleService, TileCoords } from '../n-puzzle/n-puzzle.service'

export class ManHattanDistance {
	constructor( private readonly Npuzzle: NPuzzleService) { }

	CalcDist(dest: any, Board: number[][]): number {
		// Calc dist for a D1 array
		const TmpDist = (x, indexX) => {
			const SubDist = x.map((y, indexY) => (Math.abs((indexX - dest.x)) + Math.abs((indexY - dest.y))))
			// reduce the D1 array to return only total dist
			SubDist.reduce((accumulator, currentValue) => accumulator + currentValue)
			return SubDist[0]
		}
		// Apply the previous on all the board(D2 array)
		const TmpList = Board.map((x, indexX) => TmpDist(x, indexX))
		return TmpList.reduce((accumulator, currentValue) => accumulator + currentValue)[0]
	}

//  to be exported as solo class

	LookPossibility(Board: number[][], pos, sens): OptionList[] {
		const pos: TileCoords = this.Npuzzle.searchNumberInBoard(Board, 0)
		possible = getPossible(Board, pos)
		switch (possible) {
			case '0000': {
				break
			}
			case '1000': {
				break
			}
			case '0100': {
				break
			}
			case '1100': {
				break
			}
			case '0010': {
				break
			}
			case '1110': {
				break
			}
			case '1010': {
				break
			}
			case '0110': {
				break
			}
			case '0001': {
				break
			}
			case '0011': {
				break
			}
			case '0111': {
				break
			}
			case '1111': {
				break
			}
			case '1001': {
				break
			}
			case '1101': {
				break
			}
			case '1011': {
				break
			}
			case '0101': {
				break
			}
		}
	}

	DoStuff(open: OptionList[]): OptionList[] {
		const current: OptionList = open[0]
		const NewPossible: OptionList[] = this.LookPossibility(current.board)
		const Indextmp: any = NewPossible.findIndex() // find smallest x.dist and check if equivalent in closed
		const tmp = NewPossible.splice(Indextmp).shift()
		NewPossible.forEach((x) => open.push(x))
		// put current into closed ; is closed in DB ?
		open.push()
		open[0] = tmp
		return open
	}

	LoopOver(Board: number[][], open: OptionList[], closed: OptionList[]): OptionList[] {
		while (open.length > 0) {
			open.sort() // sort by dist and len
			this.DoStuff(open) // eval the possible Board, then put current into closed and new possibility in open
		}
	}
}

class OptionList {
	dist: number
	len: number
	board: number[][]

	constructor(value?: OptionList) {
		this.dist = value.dist
		this.len = value.len
		this.board = value.board
	}
}
