import { Module } from '@nestjs/common';
import { NPuzzleController } from './n-puzzle.controller';
import { NPuzzleService } from './n-puzzle.service';

@Module({
  imports: [],
  components: [NPuzzleService],
  controllers: [NPuzzleController],
  exports: [NPuzzleService],
})
export class NPuzzleModule {}