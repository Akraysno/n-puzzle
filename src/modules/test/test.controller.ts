import {
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Param,
	Req,
	UseGuards,
} from '@nestjs/common';
import { AuthentifiedGuard } from '../auth/guards/authentified.guard';
import { Roles } from 'n-puzzle-entity/dist/server/user/enums/roles.enum';
import { TestService } from './test.service';
import { RolesGuard } from '../user/guards/roles.guard';
import { ForRoles } from '../user/decorators/for-roles.decorator';

@Controller('test')
@UseGuards(AuthentifiedGuard, RolesGuard)
export class TestController {

	constructor(
		private testService: TestService
	){ }

	// :toto est une var dans la requetes
	@Post('route/:toto')
	// sa c est pour dire c est OK OK ?!?
	@HttpCode(HttpStatus.OK)
	// check si ta les droits gros
	@ForRoles(Roles.ADMIN)
	async testFunc(@Req() req, @Param('toto') toto) {
		console.error('test', toto);
	}
}
