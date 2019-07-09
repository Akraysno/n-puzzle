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
import { ForRoles } from './decorators/for-roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from 'n-puzzle-entity/dist/server/user/enums/roles.enum';
import { RolesGuard } from './guards/roles.guard';
import { UserService } from './user.service';
import { Authentified } from 'modules/auth/decorators/authentified.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(AuthentifiedGuard, RolesGuard)
export class UserController {

	constructor(
		private usersService: UserService
	){ }

	@Get()
	@HttpCode(HttpStatus.OK)
	@ForRoles(Roles.ADMIN)
	async findAll(@Req() req, @Query() params) {
		return await this.usersService.findAllByCriteria(params);
	}

	@Post()
	@HttpCode(HttpStatus.CREATED)
	@Authentified()
	@ForRoles(Roles.ADMIN)
	async create(@Req() req, @Body() dto: CreateUserDto) {
		const user = await this.usersService.findOne({ email: (dto as CreateUserDto).email.toLowerCase() });
		if (user) {
			throw new ConflictException('Email already used')
		}
		this.usersService.create(dto)
	}

	@Get(':userId')
	@HttpCode(HttpStatus.OK)
	@ForRoles(Roles.ADMIN, Roles.CUSTOMER)
	async getUser(@Req() req, @Param('userId') userId: string) {
		if (!req.hasRole(Roles.ADMIN) && req.user.id.toString() !== userId) {
			throw new ForbiddenException();
		}
		return await this.usersService.findOneOrFail(userId);
	}
	
	@Put(':userId')
	@HttpCode(HttpStatus.OK)
	@ForRoles(Roles.ADMIN)
	async update(@Req() req, @Param('userId') userId, @Body() dto: UpdateUserDto) {
		if (!req.hasRole(Roles.ADMIN) && req.user.id.toString() !== userId) {
			throw new ForbiddenException();
		}
		let userDB = await this.usersService.findOneOrFail(userId)
		return await this.usersService.update(userDB, dto);
	}

	@HttpCode(HttpStatus.OK)
	@Delete(':userId')
	@ForRoles(Roles.ADMIN)
	async deleteUser(@Req() req, @Param('userId') userId) {
		const user = await this.usersService.findOneOrFail(userId);
		if (user.role !== Roles.ADMIN) {
			throw new ForbiddenException()
		}
		return await this.usersService.deleteUser(user)
	}
}