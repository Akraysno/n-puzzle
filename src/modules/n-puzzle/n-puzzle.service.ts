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
    
    return new FileChecker(size, board)
  }

  generateFinalBoard(size: number): number[][] {
    let final = Array(size)
    final = final.fill(Array(size), 0, size)
    let nbCase = size * size

    

    return final
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