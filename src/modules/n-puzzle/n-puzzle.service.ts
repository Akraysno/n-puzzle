import { Component, BadRequestException } from '@nestjs/common';
import { ResolvePuzzleDto } from './dto/resolve-puzzle.dto';
import * as _ from 'lodash'
import { NPuzzle } from 'n-puzzle-entity/dist/server/n-puzzle/n-puzzle.entity'

@Component()
export class NPuzzleService {
  constructor( ) { }

  async resolvePuzzle(dto: ResolvePuzzleDto): Promise<NPuzzle> {
    let fileChecker: FileChecker = this.checkFile(dto.puzzle)
    let finalBoard: number[][] = this.generateFinalBoard(fileChecker.size);
    let nPuzzle = new NPuzzle()
    nPuzzle.final = finalBoard
    nPuzzle.origin = fileChecker.board
    nPuzzle.type = dto.type
    return nPuzzle
  }

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

  searchNumberInBoard(board: number[][], search: number) {
    let coords = new Coordinates()
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
}

class FileChecker {
  size: number
  board: number[][]

  constructor(size:number, board: number[][]) {
    this.size = size
    this.board = board
  }
}

class Coordinates {
  row: number
  cell: number
}