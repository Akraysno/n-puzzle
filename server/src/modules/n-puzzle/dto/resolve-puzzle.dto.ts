import { IsNotEmpty } from 'class-validator';
import { NPuzzleAlgo } from '../../../../../entities/n-puzzle/enums/n-puzzle-algo.enum';

export class ResolvePuzzleDto {
    @IsNotEmpty({ message: 'Ne doit pas être vide' })
    startState: number[];

    @IsNotEmpty({ message: 'Ne doit pas être vide' })
    finalState: number[];

    @IsNotEmpty({ message: 'Ne doit pas être vide' })
    type: NPuzzleAlgo;

    @IsNotEmpty({ message: 'Ne doit pas être vide' })
    size: number;
}