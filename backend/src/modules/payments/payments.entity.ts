import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Index, ForeignKey } from 'typeorm';
import { Order } from '../orders/orders.entity';

@Entity('payments')
@Index(['order_id'])
@Index(['transaction_id'])
@Index(['status'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ForeignKey(() => Order)
  @Column()
  order_id: string;

  @Column({ type: 'varchar', default: 'NOWPAYMENTS' })
  payment_method: string;

  @Column({ type: 'varchar', default: 'PENDING' })
  status: string;

  @Column({ nullable: true })
  transaction_id: string;

  @Column({ nullable: true })
  payment_address: string;

  @Column({ nullable: true })
  currency: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  received_amount: number;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  confirmed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @ManyToOne(() => Order, (order) => order.payments)
  order: Order;
}