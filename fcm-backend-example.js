const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
const serviceAccount = require('./path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'mashtl-app'
});

// Send 2FA verification code via FCM
app.post('/api/send-2fa-code', async (req, res) => {
  try {
    const { fcmToken, phoneNumber, verificationCode } = req.body;

    if (!fcmToken || !phoneNumber || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: fcmToken, phoneNumber, verificationCode'
      });
    }

    const message = {
      token: fcmToken,
      notification: {
        title: 'Mashtl - رمز التحقق',
        body: `رمز التحقق الخاص بك هو: ${verificationCode}`,
      },
      data: {
        type: '2fa_verification',
        code: verificationCode,
        phone: phoneNumber,
        timestamp: Date.now().toString()
      },
      android: {
        priority: 'high',
        notification: {
          channelId: '2fa-verification',
          priority: 'high',
          defaultSound: true,
          defaultVibrateTimings: true
        }
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: 'Mashtl - رمز التحقق',
              body: `رمز التحقق الخاص بك هو: ${verificationCode}`
            },
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    
    console.log('✅ FCM message sent successfully:', response);
    
    res.json({
      success: true,
      message: '2FA code sent successfully',
      messageId: response
    });

  } catch (error) {
    console.error('❌ Error sending FCM message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send 2FA code',
      error: error.message
    });
  }
});

// Send notification to multiple tokens (for broadcast)
app.post('/api/send-notification', async (req, res) => {
  try {
    const { tokens, title, body, data } = req.body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing or invalid tokens array'
      });
    }

    const message = {
      tokens: tokens,
      notification: {
        title: title || 'Mashtl',
        body: body || 'You have a new notification'
      },
      data: data || {},
      android: {
        priority: 'high'
      },
      apns: {
        payload: {
          aps: {
            alert: {
              title: title || 'Mashtl',
              body: body || 'You have a new notification'
            },
            sound: 'default'
          }
        }
      }
    };

    const response = await admin.messaging().sendMulticast(message);
    
    console.log('✅ Multicast message sent successfully:', response);
    
    res.json({
      success: true,
      message: 'Notification sent successfully',
      successCount: response.successCount,
      failureCount: response.failureCount
    });

  } catch (error) {
    console.error('❌ Error sending multicast message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'FCM Backend is running',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 FCM Backend server running on port ${PORT}`);
  console.log(`📱 2FA endpoint: http://localhost:${PORT}/api/send-2fa-code`);
  console.log(`📢 Notification endpoint: http://localhost:${PORT}/api/send-notification`);
});

module.exports = app; 