interface DreamsSmsConfig {
  username: string;
  secretKey: string;
  sender: string;
}

interface SendSmsResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  code?: string;
}

class DreamsSmsService {
  private config: DreamsSmsConfig;
  private baseUrl = 'https://dreams.sa/index.php/api';

  constructor(config: DreamsSmsConfig) {
    this.config = config;
  }

  /**
   * Send SMS message using Dreams SMS API
   */
  async sendSms(to: string, message: string): Promise<SendSmsResponse> {
    try {
      // Use HarajCar approach - send params as query parameters
      const params = new URLSearchParams({
        user: this.config.username,
        secret_key: this.config.secretKey,
        sender: this.config.sender,
        to: to,
        message: message
      });

      const response = await fetch(`${this.baseUrl}/sendsms?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const result = await response.text();
      
      // HarajCar approach: consider any response that's not 400 as successful
      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          messageId: result, // Dreams SMS returns response code as messageId
        };
      } else {
        return {
          success: false,
          error: result,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Network error or API unavailable',
      };
    }
  }

  /**
   * Check account balance
   */
  async checkBalance(): Promise<{ success: boolean; balance?: number; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/chk_balance/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user: this.config.username,
          secret_key: this.config.secretKey,
        }),
      });

      const result = await response.text();
      
      if (result.startsWith('-')) {
        // Error response
        const errorMessage = this.getErrorMessage(result);
        return { success: false, error: errorMessage };
      } else {
        // Success response - balance number
        const balance = parseInt(result);
        return { success: true, balance };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  /**
   * Check if account is valid
   */
  async checkAccount(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/chk_user/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          user: this.config.username,
          secret_key: this.config.secretKey,
        }),
      });

      const result = await response.text();
      
      if (result === '999') {
        return { success: true };
      } else {
        const errorMessage = this.getErrorMessage(result);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  /**
   * Get error message from error code
   */
  private getErrorMessage(code: string): string {
    const errorMessages: { [key: string]: string } = {
      '-100': 'Missing parameters',
      '-110': 'Wrong username or secret key',
      '-111': 'Account not activated',
      '-112': 'Blocked account',
      '-113': 'Not enough balance',
      '-114': 'Service not available',
      '-115': 'Sender not available',
      '-116': 'Invalid sender name',
      '-117': 'Phone number problem',
      '-118': 'Unexpected error',
      '-119': 'Invalid date/time',
      '-122': 'Number not allowed',
      '-123': 'Sender daily limit exceeded',
      '-124': 'IP not allowed',
    };

    return errorMessages[code] || `Unknown error: ${code}`;
  }
}

export default DreamsSmsService;
