import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common'
import { NPuzzleService } from './n-puzzle.service';
import { ResolvePuzzleDto } from './dto/resolve-puzzle.dto';

@Controller('n-puzzle')
export class NPuzzleController {

	constructor(
		private nPuzzleService: NPuzzleService
	){ }

	@Post()
	@HttpCode(HttpStatus.OK)
	async resolve(@Req() req, @Body() dto: ResolvePuzzleDto) {
		return await this.nPuzzleService.resolvePuzzle(dto.type, dto.size, dto.startState, dto.finalState)
	}

}