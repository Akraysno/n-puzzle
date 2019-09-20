import { BadRequestException, Body, Controller, HttpCode, HttpStatus, Inject, Post, Req, ForbiddenException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { CryptoService } from 'modules/crypto/crypto.service';

@Controller('auth')
export class AuthController {

    constructor(
        private usersService: UserService,
        @Inject('CryptoService') private cryptoService: CryptoService
    ) {}

    @Post()
    @HttpCode(HttpStatus.OK)
    async login(@Req() req, @Body('email') email, @Body('password') password) {
        if (!email || !password) {
            throw new BadRequestException()
        }
        const user = await this.usersService.findOne({ email: email.toLowerCase() });
        if (!user || !user.hashedPassword) {
            throw new ForbiddenException()
        }
        if (!user || !this.cryptoService.checkPassword(user.hashedPassword, password)) {
            throw new BadRequestException('Bad credentials');
        }
        return {token : this.cryptoService.createJwtToken(user.toToken())}
    }
}
