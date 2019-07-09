import { MiddlewareFunction, Middleware, NestMiddleware } from '@nestjs/common';

@Middleware()
export class BindRolesFuncsMiddleware implements NestMiddleware {
  resolve(...args: any[]): MiddlewareFunction {
    return (req, res, next) => {
        req.hasRole = (...roles) => req.user && roles.indexOf(req.user.role) !== -1;
        req.roleSwitch = (funcs) => funcs[req.user.role] && funcs[req.user.role]();
        next();
    };
  }
}