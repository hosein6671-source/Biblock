import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, Index, ForeignKey } from 'typeorm';
import { User } from '../users/users.entity';
import { Plan } from '../plans/plans.entity';
import { Payment } from '../payments/payments.entity';

@Entity('orders')
@Index(['user_id'])
@Index(['status'])
@Index(['payment_id'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ForeignKey(() => User)
  @Column()
  user_id: string;

  @ForeignKey(() => Plan)
  @Column()
  plan_id: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', default: 'PENDING' })
  status: string;

  @Column({ nullable: true })
  payment_id: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  paid_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @ManyToOne(() => Plan, (plan) => plan.orders)
  plan: Plan;

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];
}