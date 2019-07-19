import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesGuard } from '../user/guards/roles.guard';
import { TestController } from './test.controller';
import { User } from 'n-puzzle-entity/dist/server/user/user.entity';
import { TestService } from './test.service';
import { ManHattanDistance } from './taxycab'
import { NPuzzleModule } from '../n-puzzle/n-puzzle.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    NPuzzleModule
  ],
  components: [TestService, RolesGuard, ManHattanDistance],
  controllers: [TestController],
  exports: [TestService, RolesGuard],
})
export class TestModule {}
