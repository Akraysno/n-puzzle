import { Module } from '@nestjs/common';
import { CronService } from './cron.service';

@Module({
    imports: [],
    components: [CronService],
    exports: [CronService],
})
export class CronModule {}
