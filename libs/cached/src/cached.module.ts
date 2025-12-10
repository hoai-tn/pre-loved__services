import { Module } from '@nestjs/common';
import { CachedService } from './cached.service';
import Redis from 'ioredis';

@Module({
  providers: [CachedService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory() {
        return new Redis({
          host: 'redis-14971.c252.ap-southeast-1-1.ec2.cloud.redislabs.com',
          port: 14971,
          username: 'default',
          password: 'mEcL9ky7j8MrrFb0S4kol0WsbO73lWef',
        });
      }
    }
  ],
  exports: [CachedService],
})
export class CachedModule { }
