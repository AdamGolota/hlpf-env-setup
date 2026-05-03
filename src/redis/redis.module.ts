import { Global, Module } from '@nestjs/common';
import { createClient } from '@keyv/redis';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

@Global()
@Module({
    providers: [
        {
            provide: REDIS_CLIENT,
            useFactory: async () => {
                const client = createClient({
                    socket: {
                        host: process.env.REDIS_HOST,
                        port: parseInt(process.env.REDIS_PORT || '6379', 10),
                    },
                });
                await client.connect();
                return client;
            },
        },
    ],
    exports: [REDIS_CLIENT],
})
export class RedisModule {}
