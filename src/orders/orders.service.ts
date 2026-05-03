import {ForbiddenException, Injectable, NotFoundException,} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Order} from './entities/order.entity';
import {OrderItem} from './entities/order-item.entity';
import {Product} from '../products/product.entity';
import {CreateOrderDto} from './dto/create-order.dto';
import {UpdateOrderStatusDto} from './dto/update-order-status.dto';
import {OrderQueryDto} from './dto/order-query.dto';
import {Role} from '../common/enums/role.enum';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
        @InjectRepository(Product)
        private readonly productRepo: Repository<Product>,
    ) {
    }

    async create(dto: CreateOrderDto, userId: number): Promise<Order> {
        const items: OrderItem[] = [];
        let totalPrice = 0;

        for (const itemDto of dto.items) {
            const product = await this.productRepo.findOne({
                where: {id: itemDto.productId},
            });
            if (!product) {
                throw new NotFoundException(
                    `Product #${itemDto.productId} not found`,
                );
            }

            const item = new OrderItem();
            item.product = product;
            item.quantity = itemDto.quantity;
            item.price = product.price;
            totalPrice += Number(product.price) * itemDto.quantity;
            items.push(item);
        }

        const order = this.orderRepo.create({
            user: {id: userId} as any,
            items,
            totalPrice,
        });

        return this.orderRepo.save(order);
    }

    async findAll(
        query: OrderQueryDto,
        userId: number,
        userRole: Role,
    ) {
        const {page = 1, pageSize = 10, status} = query;

        const qb = this.orderRepo
            .createQueryBuilder('order')
            .leftJoinAndSelect('order.items', 'items')
            .leftJoinAndSelect('items.product', 'product')
            .leftJoin('order.user', 'user')
            .addSelect(['user.id', 'user.email', 'user.name']);

        if (userRole !== Role.ADMIN) {
            qb.andWhere('user.id = :userId', {userId});
        }

        if (status) {
            qb.andWhere('order.status = :status', {status});
        }

        qb.orderBy('order.createdAt', 'DESC')
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

        if (userRole !== Role.ADMIN && order.user?.id !== userId) {
            throw new ForbiddenException('Access denied');
        }

        return order;
    }

    async updateStatus(id: number, dto: UpdateOrderStatusDto): Promise<Order> {
        const order = await this.orderRepo.findOne({where: {id}});
        if (!order) {
            throw new NotFoundException(`Order #${id} not found`);
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
}
