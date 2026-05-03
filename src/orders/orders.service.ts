import {BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException,} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import type {RedisClientType} from '@keyv/redis';
import {Order} from './entities/order.entity';
import {OrderItem} from './entities/order-item.entity';
import {Product} from '../products/product.entity';
import {CreateOrderDto} from './dto/create-order.dto';
import {UpdateOrderStatusDto} from './dto/update-order-status.dto';
import {OrderQueryDto} from './dto/order-query.dto';
import {OrderStatus} from '../common/enums/order-status.enum';
import {Role} from '../common/enums/role.enum';
import {REDIS_CLIENT} from '../redis/redis.module';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
        private readonly dataSource: DataSource,
        @Inject(REDIS_CLIENT)
        private readonly redisClient: RedisClientType,
    ) {
    }

    async create(dto: CreateOrderDto, userId: number): Promise<Order> {
        const qr = this.dataSource.createQueryRunner();
        await qr.connect();
        await qr.startTransaction();

        try {
            let totalPrice = 0;
            const orderItems: OrderItem[] = [];

            for (const item of dto.items) {
                const product = await qr.manager.findOne(Product, {
                    where: {id: item.productId},
                });

                if (!product) {
                    throw new NotFoundException(
                        `Product #${item.productId} not found`,
                    );
                }

                if (product.stock < item.quantity) {
                    throw new BadRequestException(
                        `Insufficient stock for "${product.name}":` +
                        ` available ${product.stock},` +
                        ` requested ${item.quantity}`,
                    );
                }

                product.stock -= item.quantity;
                await qr.manager.save(product);

                const orderItem = qr.manager.create(OrderItem, {
                    product,
                    quantity: item.quantity,
                    price: product.price,
                });
                orderItems.push(orderItem);

                totalPrice += Number(product.price) * item.quantity;
            }

            const order = qr.manager.create(Order, {
                user: {id: userId} as any,
                items: orderItems,
                totalPrice,
                status: OrderStatus.PENDING,
            });

            const saved = await qr.manager.save(order);

            await qr.commitTransaction();

            await this.clearProductsCache();

            return saved;
        } catch (error) {
            await qr.rollbackTransaction();
            throw error;
        } finally {
            await qr.release();
        }
    }

    async findAll(
        query: OrderQueryDto,
        userId: number,
        userRole: Role,
    ) {
        const {page = 1, pageSize = 10, status} = query;

        const qb = this.orderRepo
            .createQueryBuilder('ord')
            .leftJoinAndSelect('ord.items', 'item')
            .leftJoinAndSelect('item.product', 'product');

        // Ownership: user бачить тільки свої
        if (userRole !== Role.ADMIN) {
            qb.andWhere('ord.user_id = :userId', {userId});
        }

        if (status) {
            qb.andWhere('ord.status = :status', {status});
        }

        qb.orderBy('ord.createdAt', 'DESC')
            .skip((page - 1) * pageSize)
            .take(pageSize);

        const [items, total] = await qb.getManyAndCount();

        return {
            items,
            meta: {page, pageSize, total, totalPages: Math.ceil(total / pageSize)},
        };
    }

    async findOne(id: number, userId: number, userRole: Role): Promise<Order> {
        const order = await this.orderRepo.findOne({
            where: {id},
            relations: ['items', 'items.product', 'user'],
        });

        if (!order) {
            throw new NotFoundException(`Order #${id} not found`);
        }

        // Ownership check
        if (userRole !== Role.ADMIN && order.user.id !== userId) {
            throw new ForbiddenException(
                'You can only view your own orders',
            );
        }

        return order;
    }

    async updateStatus(id: number, dto: UpdateOrderStatusDto): Promise<Order> {
        const ALLOWED_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
            [OrderStatus.PENDING]:   [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
            [OrderStatus.CONFIRMED]: [OrderStatus.SHIPPED,   OrderStatus.CANCELLED],
            [OrderStatus.SHIPPED]:   [OrderStatus.DELIVERED],
        };

        const order = await this.orderRepo.findOne({
            where: {id},
            relations: ['items', 'items.product'],
        });
        if (!order) {
            throw new NotFoundException(`Order #${id} not found`);
        }

        const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
        if (!allowed.includes(dto.status)) {
            throw new BadRequestException(
                `Transition from "${order.status}" to "${dto.status}" is not allowed`,
            );
        }

        // При скасуванні — повернути stock у транзакції
        if (dto.status === OrderStatus.CANCELLED) {
            const qr = this.dataSource.createQueryRunner();
            await qr.connect();
            await qr.startTransaction();

            try {
                for (const item of order.items) {
                    await qr.manager.increment(
                        Product,
                        {id: item.product.id},
                        'stock',
                        item.quantity,
                    );
                }

                order.status = dto.status;
                const saved = await qr.manager.save(order);
                await qr.commitTransaction();
                await this.clearProductsCache();
                return saved;
            } catch (error) {
                await qr.rollbackTransaction();
                throw error;
            } finally {
                await qr.release();
            }
        }

        order.status = dto.status;
        return this.orderRepo.save(order);
    }

    async remove(id: number): Promise<void> {
        const order = await this.orderRepo.findOne({where: {id}});
        if (!order) {
            throw new NotFoundException(`Order #${id} not found`);
        }
        await this.orderRepo.remove(order);
    }

    private async clearProductsCache(): Promise<void> {
        const keys: string[] = await this.redisClient.keys('products:*');
        if (keys.length > 0) {
            await this.redisClient.del(keys);
        }
    }
}
