import { Type } from 'class-transformer';
import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';
import { NPuzzleAlgo } from './enums/n-puzzle-algo.enum';
import { TileMoveDirection } from './enums/tile-move-direction.enum';

@Entity()
export class NPuzzle {
    type: NPuzzleAlgo;
    size: number;
    origin: number[];
    final: number[];
    operations: TileMove[];
    nbMoves: number;
    duration: number;
    solvable: boolean;
}

export class TileMove {
    tile: number
    direction: TileMoveDirection

    constructor(tile: number, direction: TileMoveDirection) {
        this.tile = tile 
        this.direction = direction
    }
}