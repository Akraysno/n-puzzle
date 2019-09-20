import { Component, BadRequestException } from '@nestjs/common';
import { ResolvePuzzleDto } from './dto/resolve-puzzle.dto';
import * as _ from 'lodash'
import { NPuzzle } from 'n-puzzle-entity/dist/server/n-puzzle/n-puzzle.entity'
import { NPuzzleAlgo } from 'n-puzzle-entity/dist/server/n-puzzle/enums/n-puzzle-algo.enum';

@Component()
export class NPuzzleService {
  constructor( ) { }

  /**
   * Resolve a puzzle
   * 
   * @param dto 
   */
  async resolvePuzzle(puzzle: string, type: NPuzzleAlgo): Promise<NPuzzle> {
    let fileChecker: FileChecker = this.checkFile(puzzle)
    let finalBoard: number[][] = this.generateFinalBoard(fileChecker.size);
    let nPuzzle = new NPuzzle()
    nPuzzle.final = finalBoard
    nPuzzle.origin = fileChecker.board
    nPuzzle.type = type
    console.log(nPuzzle.final)
    nPuzzle = this.solve(nPuzzle)
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
    let final = Array(size).fill(null, 0, size).map(row => {
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
    return final
  }

  solve(nPuzzle: NPuzzle) {
    let currentBoard = _.cloneDeep(nPuzzle.origin)
    let possibilities = this.searchPossibilities(currentBoard)
    console.log(possibilities)
    return nPuzzle
  }

  /**
   * Search a tile in the board passed in params
   * Return the coordinates of the found tile
   * 
   * @param board 
   * @param search 
   */
  searchNumberInBoard(board: number[][], search: number): TileCoords {
    let coords = new TileCoords()
    try {
      board.forEach((row: number[], index: number) => {
        let searchIndex: number = row.indexOf(search)
        if (searchIndex !== -1) {
          coords.row = index
          coords.cell = searchIndex
          throw 'found';
        }
      })
    } catch (e) { }
    return coords
  }

  calcDist(tile: number, board: number[][], final: number[][]) {

  }

	searchPossibilities(board: number[][], tile: number = 0): OptionList[] {
		let coords = this.searchNumberInBoard(board, tile)
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
  
  /**
   * Check if the board is resolve
   * 
   * @param board 
   * @param final 
   */
  goalReached(board: number[][], final: number[][]): boolean {
    return board.toString() === final.toString()
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