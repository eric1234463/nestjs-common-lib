import { WorkerHost } from '@nestjs/bullmq';
import { CustomLoggerService } from '../services/logger.service';
import { Job } from 'bullmq';

export class SuperWorkerHost extends WorkerHost {
  constructor(private readonly logger: CustomLoggerService) {
    super();
  }

  async process(job: Job) {
    return job;
  }

  async processJob(job: Job, callback: (job: Job) => Promise<unknown>) {
    this.logger.log('SuperWorkerHost', 'process', 'start', {
      jobId: job.id,
      data: job.data,
    });
    try {
      this.process(job);
      const result = await callback(job);
      this.logger.log('SuperWorkerHost', 'process', 'end', {
        jobId: job.id,
        result,
      });
      return result;
    } catch (error) {
      this.logger.error('SuperWorkerHost', 'process', 'error', {
        jobId: job.id,
        error,
      });
      throw error;
    }
  }
}
