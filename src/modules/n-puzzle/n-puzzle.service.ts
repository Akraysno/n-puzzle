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
    console.log('Goal is : \n', this.boardToString(nPuzzle.final))
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
    console.log('Current board :\n', this.boardToString(currentBoard))
    let possibilities = this.searchPossibilities(nPuzzle, currentBoard, null)

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

  calcDist(tile: number, board: number[][], final: number[][]): number {
    let origin = this.searchNumberInBoard(board, tile)
    let dest = this.searchNumberInBoard(final, tile)
    let diffRow = Math.abs(origin.row - dest.row)
    let diffCell = Math.abs(origin.cell - origin.cell)
    return diffRow + diffCell
  }

	searchPossibilities(nPuzzle: NPuzzle, board: number[][], parent: number[][], tile: number = 0): OptionList[] {
		let coords = this.searchNumberInBoard(board, tile)
		let possibilities: OptionList[] = []

		if (coords.row - 1 >= 0) {
      let p = this.getPossibility(MoveDirection.TOP, coords, board, nPuzzle.final)
      if (!parent || p.board.toString() !== parent.toString()) {
        possibilities.push(p)
      }
		}
		if (coords.cell + 1 <= board[coords.row].length) {
      let p = this.getPossibility(MoveDirection.RIGHT, coords, board, nPuzzle.final)
      if (!parent || p.board.toString() !== parent.toString()) {
        possibilities.push(p)
      }
		}
		if (coords.row + 1 <= board.length) {
      let p = this.getPossibility(MoveDirection.BOTTOM, coords, board, nPuzzle.final)
      if (!parent || p.board.toString() !== parent.toString()) {
        possibilities.push(p)
      }
		}
		if (coords.cell - 1 >= 0) {
      let p = this.getPossibility(MoveDirection.LEFT, coords, board, nPuzzle.final)
      if (!parent || p.board.toString() !== parent.toString()) {
        possibilities.push(p)
      }
		}

		return possibilities
  }

  getPossibility(direction: MoveDirection, coordsRef: TileCoords, board: number[][], final: number[][]): OptionList {
    let newBoard = _.cloneDeep(board)
    let newRow: number = coordsRef.row + (direction === MoveDirection.TOP ? -1 : 0) + (direction === MoveDirection.BOTTOM ? 1 : 0)
    let newCell: number = coordsRef.cell + (direction === MoveDirection.RIGHT ? 1 : 0) + (direction === MoveDirection.LEFT ? -1 : 0)
    let tmpTile = newBoard[newRow][newCell]
    newBoard[newRow][newCell] = 0
    newBoard[coordsRef.row][coordsRef.cell] = tmpTile
    let p = new OptionList({ 
      board: newBoard, 
      parent: _.cloneDeep(board),
      dist: this.calcDist(tmpTile, newBoard, final) || 0
    })
    console.log(`\nPossibility {${tmpTile}}[${p.dist}]\n`, this.boardToString(p.board))
    return p
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

  /**
   * Transform board to string ready to print
   * 
   * @param board 
   */
  boardToString(board: number[][]): string {
    let numLen = Math.pow(board.length, 2).toString().length
    let b: string = ''
    for (let r of board) {
      let s: string = (b.length ? '\n' : '')+'\t'
      for (let n of r) {
        let ns = n.toString()
        while (ns.length < numLen) {
          ns = ' '+ns
        }
        s += ns+' '
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

enum MoveDirection {
	TOP = 'TOP',
	RIGHT = 'RIGHT',
	BOTTOM = 'BOTTOM',
	LEFT = 'LEFT',
}
