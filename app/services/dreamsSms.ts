import axios from 'axios';

interface DreamsSmsConfig {
  username: string;
  secretKey: string;
  sender: string;
}

interface SmsResponse {
  success: boolean;
  message: string;
  data?: any;
}

class DreamsSmsService {
  private config: DreamsSmsConfig;
  private apiUrl = 'https://www.dreams.sa/index.php/api/sendsms';

  constructor(config: DreamsSmsConfig) {
    this.config = config;
  }

  async sendSms(to: string, message: string): Promise<SmsResponse> {
    try {
      const params = new URLSearchParams({
        user: this.config.username,
        secret_key: this.config.secretKey,
        sender: this.config.sender,
        to: to,
        message: message
      });

      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mashtal-App/1.0'
      };

      const response = await axios.post(`${this.apiUrl}?${params.toString()}`, {}, {
        headers: headers,
        timeout: 30000
      });

      return {
        success: response.status >= 200 && response.status < 300,
        message: 'SMS sent successfully',
        data: response.data
      };
    } catch (error: any) {
      console.error('Dreams SMS Error:', error.message);
      return {
        success: false,
        message: error.message || 'Failed to send SMS',
        data: error.response?.data
      };
    }
  }

  async checkBalance(): Promise<SmsResponse> {
    try {
      const params = new URLSearchParams({
        user: this.config.username,
        secret_key: this.config.secretKey
      });

      const response = await axios.post('https://www.dreams.sa/index.php/api/chk_balance', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 30000
      });

      return {
        success: true,
        message: 'Balance checked successfully',
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to check balance',
        data: error.response?.data
      };
    }
  }

  async checkAccount(): Promise<SmsResponse> {
    try {
      const params = new URLSearchParams({
        user: this.config.username,
        secret_key: this.config.secretKey
      });

      const response = await axios.post('https://www.dreams.sa/index.php/api/chk_user', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 30000
      });

      return {
        success: true,
        message: 'Account checked successfully',
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to check account',
        data: error.response?.data
      };
    }
  }
}

export default DreamsSmsService;
export { DreamsSmsConfig, SmsResponse };
