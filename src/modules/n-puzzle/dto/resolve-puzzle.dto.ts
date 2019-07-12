import { IsNotEmpty } from 'class-validator';

export class ResolvePuzzleDto {
    @IsNotEmpty({ message: 'Ne doit pas être vide' })
    puzzle: string;
}