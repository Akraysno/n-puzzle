import { CanActivate, ExecutionContext, Guard, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Guard()
export class AuthentifiedGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const needAuthentification = this.reflector.get<boolean>('authentified', context.getHandler());
        const req = context.switchToHttp().getRequest();
        if(!needAuthentification || !!req.user){
            return true
        } else {
            throw new UnauthorizedException();
        }
    }
}
