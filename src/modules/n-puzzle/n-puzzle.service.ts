import { Component } from '@nestjs/common';
import { ResolvePuzzleDto } from './dto/resolve-puzzle.dto';

@Component()
export class NPuzzleService {
  constructor( ) { }

  async resolvePuzzle(dto: ResolvePuzzleDto) {
    console.log(dto.puzzle)
    return dto
  }
}