import { IsNotEmpty } from 'class-validator';
import { NPuzzleAlgo } from 'n-puzzle-entity/dist/server/n-puzzle/enums/n-puzzle-algo.enum';

export class ResolvePuzzleDto {
    @IsNotEmpty({ message: 'Ne doit pas être vide' })
    puzzle: string;

    @IsNotEmpty({ message: 'Ne doit pas être vide' })
    type: NPuzzleAlgo;
}