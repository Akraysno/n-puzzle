import { Component, BadRequestException } from '@nestjs/common';
import { ResolvePuzzleDto } from './dto/resolve-puzzle.dto';
import * as _ from 'lodash'

@Component()
export class NPuzzleService {
  constructor( ) { }

  async resolvePuzzle(dto: ResolvePuzzleDto): Promise<number[][]> {
    let board: number[][] = this.checkFile(dto.puzzle)
    return board
  }

  checkFile(fileString: string): number[][] {
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
    
    return board
  }
}