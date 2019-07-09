import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesGuard } from './guards/roles.guard';
import { UserController } from './user.controller';
import { User } from 'n-puzzle-entity/dist/server/user/user.entity';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  components: [UserService, RolesGuard],
  controllers: [UserController],
  exports: [UserService, RolesGuard],
})
export class UserModule {}