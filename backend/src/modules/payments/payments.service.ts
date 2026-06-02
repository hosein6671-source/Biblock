import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Payment } from './payments.entity';

@Injectable()
export class PaymentsService {
  private logger = new Logger('PaymentsService');
  private nowpaymentsApi = axios.create({
    baseURL: 'https://api.nowpayments.io/v1',
    timeout: 10000,
  });

  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private configService: ConfigService,
  ) {
    this.nowpaymentsApi.defaults.headers.common['x-api-key'] = this.configService.get('NOWPAYMENTS_API_KEY');
  }

  async createPayment(orderId: string, amount: number, currency: string = 'USDT'): Promise<Payment> {
    try {
      const response = await this.nowpaymentsApi.post('/invoice', {
        price_amount: amount,
        price_currency: 'usd',
        pay_currency: currency,
        order_id: orderId,
        order_description: `Biblock V2Ray Subscription - Order ${orderId}`,
        ipn_callback_url: `${this.configService.get('WEBHOOK_URL')}/api/payments/webhook`,
        success_url: `${this.configService.get('API_URL')}/api/payments/success`,
        cancel_url: `${this.configService.get('API_URL')}/api/payments/cancel`,
      });

      const payment = this.paymentsRepository.create({
        order_id: orderId,
        amount,
        currency,
        status: 'PENDING',
        transaction_id: response.data.id,
        payment_address: response.data.pay_address,
        expires_at: new Date(Date.now() + 30 * 60 * 1000),
      });

      return await this.paymentsRepository.save(payment);
    } catch (error) {
      this.logger.error(`Failed to create payment for order ${orderId}:`, error.message);
      throw error;
    }
  }

  async verifyPayment(transactionId: string): Promise<any> {
    try {
      const response = await this.nowpaymentsApi.get(`/payment/${transactionId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to verify payment ${transactionId}:`, error.message);
      throw error;
    }
  }

  async updatePaymentStatus(transactionId: string, status: string, receivedAmount?: number): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { transaction_id: transactionId },
    });

    if (!payment) {
      throw new Error(`Payment with transaction ID ${transactionId} not found`);
    }

    payment.status = status;
    if (receivedAmount) {
      payment.received_amount = receivedAmount;
    }
    if (status === 'CONFIRMED') {
      payment.confirmed_at = new Date();
    }

    return await this.paymentsRepository.save(payment);
  }

  async findByOrderId(orderId: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { order_id: orderId },
      relations: ['order'],
    });

    if (!payment) {
      throw new Error(`Payment for order ${orderId} not found`);
    }

    return payment;
  }
}