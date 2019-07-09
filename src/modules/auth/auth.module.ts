import { DynamicModule, Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import * as passport from 'passport';
import { UserModule } from '../user/user.module';
import { AuthOptions } from './auth-options.interface';
import { AuthController } from './auth.controller';
import { AuthentifiedGuard } from './guards/authentified.guard';

@Global()
@Module({})
export class AuthModule implements NestModule {
    static forRoot(authOptions: AuthOptions): DynamicModule {
        const components: Array<any> = [AuthentifiedGuard];

        return {
            module: AuthModule,
            imports: [UserModule],
            controllers: [AuthController],
            components,
            exports: [AuthentifiedGuard],
        };
    }
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(passport.initialize()).forRoutes(AuthController);
    }
}
