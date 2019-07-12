import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesGuard } from '../user/guards/roles.guard';
import { TestController } from './test.controller';
import { User } from 'n-puzzle-entity/dist/server/user/user.entity';
import { TestService } from './test.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  components: [TestService, RolesGuard],
  controllers: [TestController],
  exports: [TestService, RolesGuard],
})
export class TestModule {}
