import { Logger, Injectable } from '@nestjs/common';
import * as cron from 'cron';
import * as moment from 'moment-timezone';


@Injectable()
export class CronService {

  constructor() {
    moment.locale('fr')
    moment.tz.setDefault('Europe/Paris');
  }

  voidCron() {
    let logger = new Logger('voidCron', false);
    let task = new cron.CronJob(
      '0 30 2 * * *',
      async () => {
        logger.log('Started');
        logger.log('Finished')
      },
      () => {
        logger.error("Error while doing nothing.");
      },
      false,
      "Europe/Paris",
      {},
      false
    )
    task.start();
  }
}
