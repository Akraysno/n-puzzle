import { IsNotEmpty } from 'class-validator';
import { NPuzzleAlgo } from '../../_entities/n-puzzle/enums/n-puzzle-algo.enum';

export class ResolvePuzzleDto {
    @IsNotEmpty({ message: 'Ne doit pas être vide' })
    puzzle: string;

    @IsNotEmpty({ message: 'Ne doit pas être vide' })
    type: NPuzzleAlgo;
}