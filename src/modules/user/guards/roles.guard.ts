import { CanActivate, ExecutionContext, Guard } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from 'n-puzzle-entity/dist/server/user/enums/roles.enum';

@Guard()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<Roles[]>('roles', context.getHandler());
        if (!roles) {
          return true;
        }
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        return user && !!roles.find((role) => user.role === role);
    }
}
