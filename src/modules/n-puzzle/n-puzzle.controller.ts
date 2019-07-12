import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common'
import { AuthentifiedGuard } from '../auth/guards/authentified.guard'
import { RolesGuard } from '../user/guards/roles.guard'
import { NPuzzleService } from './n-puzzle.service';
import { ResolvePuzzleDto } from './dto/resolve-puzzle.dto';

@Controller('n-puzzle')
@UseGuards(AuthentifiedGuard, RolesGuard)
export class NPuzzleController {

	constructor(
		private nPuzzleService: NPuzzleService
	){ }

	@Post()
	@HttpCode(HttpStatus.OK)
	async resolve(@Req() req, @Body() dto: ResolvePuzzleDto) {
		return this.nPuzzleService.resolvePuzzle(dto)
	}

}