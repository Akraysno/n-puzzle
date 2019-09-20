import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { TestService } from './test.service';
import { ManHattanDistance } from './taxycab'
import { NPuzzleModule } from '../n-puzzle/n-puzzle.module'

@Module({
  imports: [
    NPuzzleModule
  ],
  components: [TestService, ManHattanDistance],
  controllers: [TestController],
  exports: [TestService],
})
export class TestModule {}
