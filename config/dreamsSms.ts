import DreamsSmsService from '../services/dreamsSms';

// Dreams SMS Configuration
// Your actual Dreams SMS account details
export const dreamsSmsConfig = {
  username: 'Nwahtech', // Your working Dreams SMS username
  secretKey: 'd9877b42793f4a0adc2104000f38e0216f08e1f6cc342a3e381fd0f5509d8e37', // Your working Dreams SMS secret key
  sender: 'nwahtech', // Your working sender name
};

// Initialize Dreams SMS service
export const dreamsSmsService = new DreamsSmsService(dreamsSmsConfig);

// OTP message template
export const otpMessageTemplate = (otp: string) => 
  `رمز التحقق الخاص بك هو: ${otp}\n\nلا تشارك هذا الرمز مع أي شخص.\n\nمع تحيات فريق مشتل`;

// Welcome message template
export const welcomeMessageTemplate = (name: string) => 
  `مرحباً ${name}!\n\nأهلاً وسهلاً بك في تطبيق مشتل.\n\nتم إنشاء حسابك بنجاح.\n\nمع تحيات فريق مشتل`;
