import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {CacheModule} from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import {RedisModule, REDIS_CLIENT} from './redis/redis.module';

import {Category} from './categories/category.entity';
import {Product} from './products/product.entity';
import {User} from './users/user.entity';
import {Order} from './orders/entities/order.entity';
import {OrderItem} from './orders/entities/order-item.entity';
import {CategoriesModule} from './categories/categories.module';
import {ProductsModule} from './products/products.module';
import {UsersModule} from './users/users.module';

import {CreateTables1714574000000} from './migrations/1700000001-CreateTables';
import {AddIsActiveToProducts1777642898708} from "./migrations/1777642898708-AddIsActiveToProducts";

import {AppController} from './app.controller';
import {AppService} from './app.service';
import {CreateUsers1777791584504} from "./migrations/1777791584504-CreateUsers";
import {CreateOrders1777819046502} from "./migrations/1777819046502-CreateOrders";
import {AuthModule} from "./auth/auth.module";

@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}),

        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.POSTGRES_HOST,
            port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
            username: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DB,
            entities: [Category, Product, User, Order, OrderItem],
            synchronize: false,
            migrationsRun: true,
            migrations: [
                CreateTables1714574000000,
                AddIsActiveToProducts1777642898708,
                CreateUsers1777791584504,
                CreateOrders1777819046502,
            ],
        }),

        RedisModule,

        CacheModule.registerAsync({
            isGlobal: true,
            imports: [RedisModule],
            inject: [REDIS_CLIENT],
            useFactory: (redisClient: any) => ({
                stores: [new KeyvRedis(redisClient)],
                ttl: 60 * 1000,
            }),
        }),

        CategoriesModule,
        ProductsModule,
        UsersModule,
        AuthModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
