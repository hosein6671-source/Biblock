import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

interface X3uiUser {
  email: string;
  enable: boolean;
  flow: string;
  limitIp: number;
  expiryTime: number;
  totalGB: number;
  id?: string;
}

@Injectable()
export class X3uiService {
  private logger = new Logger('X3uiService');
  private x3uiApi: any;

  constructor(private configService: ConfigService) {
    this.x3uiApi = axios.create({
      baseURL: this.configService.get('X3UI_API_URL'),
      timeout: 10000,
      validateStatus: () => true,
    });
  }

  async login(): Promise<string> {
    try {
      const response = await this.x3uiApi.post('/login', {
        username: this.configService.get('X3UI_USERNAME'),
        password: this.configService.get('X3UI_PASSWORD'),
      });

      if (response.status === 200) {
        return response.data.session_id;
      }

      throw new Error('Failed to login to 3x-ui');
    } catch (error) {
      this.logger.error('X3UI login failed:', error.message);
      throw error;
    }
  }

  async createUser(
    trafficGB: number,
    durationDays: number,
    deviceLimit: number = 5,
  ): Promise<{ uuid: string; email: string }> {
    try {
      const sessionId = await this.login();
      const email = `user_${uuidv4().substring(0, 8)}@biblock.local`;
      const uuid = uuidv4();

      const expiryTime = Math.floor(Date.now() / 1000) + durationDays * 86400;

      const user: X3uiUser = {
        email,
        enable: true,
        flow: 'xtls-rprx-vision',
        limitIp: deviceLimit,
        expiryTime,
        totalGB: trafficGB * 1024 * 1024 * 1024, // Convert GB to bytes
      };

      const inboundId = this.configService.get('X3UI_INBOUND_ID') || '0';

      const response = await this.x3uiApi.post(
        `/xui/inbound/${inboundId}/addClient`,
        {
          clients: [{ ...user, id: uuid }],
        },
        {
          headers: { 'x-session-id': sessionId },
        },
      );

      if (response.status === 200 && response.data.success) {
        this.logger.log(`Created V2Ray user: ${email}`);
        return { uuid, email };
      }

      throw new Error(`Failed to create user: ${response.data.msg}`);
    } catch (error) {
      this.logger.error('Failed to create V2Ray user:', error.message);
      throw error;
    }
  }

  async deleteUser(email: string): Promise<boolean> {
    try {
      const sessionId = await this.login();
      const inboundId = this.configService.get('X3UI_INBOUND_ID') || '0';

      const response = await this.x3uiApi.post(
        `/xui/inbound/${inboundId}/delClient/${email}`,
        {},
        {
          headers: { 'x-session-id': sessionId },
        },
      );

      if (response.status === 200 && response.data.success) {
        this.logger.log(`Deleted V2Ray user: ${email}`);
        return true;
      }

      throw new Error(`Failed to delete user: ${response.data.msg}`);
    } catch (error) {
      this.logger.error('Failed to delete V2Ray user:', error.message);
      throw error;
    }
  }

  async renewUser(email: string, durationDays: number): Promise<boolean> {
    try {
      const sessionId = await this.login();
      const inboundId = this.configService.get('X3UI_INBOUND_ID') || '0';

      const expiryTime = Math.floor(Date.now() / 1000) + durationDays * 86400;

      const response = await this.x3uiApi.post(
        `/xui/inbound/${inboundId}/updateClient/${email}`,
        {
          expiryTime,
          enable: true,
          limitIp: 5,
          totalGB: 0, // Unlimited
        },
        {
          headers: { 'x-session-id': sessionId },
        },
      );

      if (response.status === 200 && response.data.success) {
        this.logger.log(`Renewed V2Ray user: ${email}`);
        return true;
      }

      throw new Error(`Failed to renew user: ${response.data.msg}`);
    } catch (error) {
      this.logger.error('Failed to renew V2Ray user:', error.message);
      throw error;
    }
  }

  async getClientStats(email: string): Promise<any> {
    try {
      const sessionId = await this.login();
      const inboundId = this.configService.get('X3UI_INBOUND_ID') || '0';

      const response = await this.x3uiApi.get(
        `/xui/inbound/${inboundId}/clientStats/${email}`,
        {
          headers: { 'x-session-id': sessionId },
        },
      );

      if (response.status === 200) {
        return response.data;
      }

      return null;
    } catch (error) {
      this.logger.error('Failed to get client stats:', error.message);
      return null;
    }
  }
}