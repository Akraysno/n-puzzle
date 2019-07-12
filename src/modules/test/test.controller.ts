import {
	Body,
	ConflictException,
	Controller,
	ForbiddenException,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Put,
	Query,
	Req,
	UseGuards,
	Param,
	Delete,
} from '@nestjs/common';
import { AuthentifiedGuard } from '../auth/guards/authentified.guard';
import { Roles } from 'n-puzzle-entity/dist/server/user/enums/roles.enum';
import { TestService } from './test.service';
import { Authentified } from 'modules/auth/decorators/authentified.decorator';
import { RolesGuard } from '../user/guards/roles.guard';
import { ForRoles } from '../user/decorators/for-roles.decorator';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';

@Controller('test')
@UseGuards(AuthentifiedGuard, RolesGuard)
export class TestController {

	constructor(
		private testService: TestService
	){ }

	@Get()
	@HttpCode(HttpStatus.OK)
	@ForRoles(Roles.ADMIN)
	async findAll(@Req() req, @Query() params) {
		return await this.testService.findAllByCriteria(params);
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@Authentified()
	@ForRoles(Roles.ADMIN)
	async create(@Req() req, @Body() dto: CreateUserDto) {
		const user = await this.testService.findOne({ email: (dto as CreateUserDto).email.toLowerCase() });
		if (user) {
			throw new ConflictException('Email already used')
		}
		console.log(this.testService.create(dto));
	}

	@Get(':userId')
	@HttpCode(HttpStatus.OK)
	@ForRoles(Roles.ADMIN, Roles.CUSTOMER)
	async getUser(@Req() req, @Param('userId') userId: string) {
		if (!req.hasRole(Roles.ADMIN) && req.user.id.toString() !== userId) {
			throw new ForbiddenException();
		}
		return await this.testService.findOneOrFail(userId);
	}

	@Put(':userId')
	@HttpCode(HttpStatus.OK)
	@ForRoles(Roles.ADMIN)
	async update(@Req() req, @Param('userId') userId, @Body() dto: UpdateUserDto) {
		if (!req.hasRole(Roles.ADMIN) && req.user.id.toString() !== userId) {
			throw new ForbiddenException();
		}
		const userDB = await this.testService.findOneOrFail(userId);
		return await this.testService.update(userDB, dto);
	}

	@HttpCode(HttpStatus.OK)
	@Delete(':userId')
	@ForRoles(Roles.ADMIN)
	async deleteUser(@Req() req, @Param('userId') userId) {
		const user = await this.testService.findOneOrFail(userId);
		if (user.role !== Roles.ADMIN) {
			throw new ForbiddenException()
		}
		return await this.testService.deleteUser(user)
	}
	// :toto est une var dans la requetes
	@Post(':toto')
// sa c est pour dire c est OK OK ?!?
	@HttpCode(HttpStatus.OK)
// check si ta les droits gros
	@ForRoles(Roles.ADMIN)
	async testFunc(@Req() req, @Param('toto') toto) {
		console.error('test', toto);
	}
}
