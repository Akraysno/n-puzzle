import {
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	Param,
	Req,
	UseGuards,
} from '@nestjs/common'; 
import { TestService } from './test.service';

@Controller('test')
export class TestController {

	constructor(
		private testService: TestService
	){ }

	@Post('route/:toto')
	@HttpCode(HttpStatus.OK)
	async testFunc(@Req() req, @Param('toto') toto) {
		console.error('test', toto);
	}
}
