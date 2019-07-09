import { MiddlewareFunction, Middleware, NestMiddleware, UnauthorizedException, Inject, Logger } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../../user/user.service';
import { CryptoProvider } from '../../crypto/crypto.provider';

@Middleware()
export class JWTAuthMiddleware implements NestMiddleware {
  private logger = new Logger("JWT Middleware", false);
  constructor(
    private usersService: UserService,
    @Inject('CryptoProvider') private cryptoService: CryptoProvider
  ){
  }

  resolve(...args: any[]): MiddlewareFunction {
    return async (req, res, next) => {
        const authorization = req.get('Authorization');
        if (authorization) {
            const tmp = authorization.split(' ');
            if (tmp.length !== 2 && tmp[0] !== 'JWT') {
                throw new UnauthorizedException();
            } else if (tmp[0] === 'Basic') {
                try {
                    const decoded = Buffer.from(tmp[1], 'base64').toString('binary');
                    const [login, password] = decoded.split(':');
                    const user = await this.usersService.findOneByEmail(login);
                    if (!user || !(await this.cryptoService.checkPassword(user.hashedPassword, password))) {
                        throw new UnauthorizedException();
                    }
                    req.user = user;
                } catch (e) {
                    this.logger.error(e);
                    throw new UnauthorizedException();
                }
            } else {
                const { JWT_SECRET } = process.env;
                try {
                    req.user = jwt.verify(tmp[1], JWT_SECRET);
                    req.user = await this.usersService.findOne(req.user.id)
                    this.usersService.updateGeneric(req.user.id.toString(), 'lastLogin', new Date())
                } catch (e) {
                    throw new UnauthorizedException();
                }
            }
        }
        next();
    };
  }
}
