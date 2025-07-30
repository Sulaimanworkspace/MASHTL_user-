import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState, useEffect } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Modal, TouchableWithoutFeedback, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as MediaLibrary from 'expo-media-library';
import { getChatHistory, sendChatMessage, getUserData, cancelServiceOrder, updateOrderPrice } from '../../services/api';
import webSocketService from '../../services/websocket';
import CustomModal from '../../components/CustomModal';
import notificationService from '../../services/notifications';

interface Message {
  _id: string;
  message: string;
  sender: {
    _id: string;
    name: string;
    phone: string;
    avatar?: string;
  };
  receiver: {
    _id: string;
    name: string;
    phone: string;
    avatar?: string;
  };
  isRead: boolean;
  createdAt: string;
}

interface ChatParams {
  orderId: string;
  farmerId: string;
  farmerName: string;
  farmerAvatar?: string;
}

const MessageScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  const farmerId = params.farmerId as string;
  const farmerName = params.farmerName as string;
  const farmerAvatar = params.farmerAvatar as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCancelSheet, setShowCancelSheet] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const minusButtonRef = useRef<View>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{top: number, left: number}>({top: 0, left: 0});
  const [showCannotCancelModal, setShowCannotCancelModal] = useState(false);
  const [orderStatus, setOrderStatus] = useState<string>('accepted');
  const [priceProposals, setPriceProposals] = useState<any[]>([]);
  const [pendingPriceProposal, setPendingPriceProposal] = useState<any>(null);
  const [respondedPriceProposals, setRespondedPriceProposals] = useState<{[key: string]: 'accepted' | 'rejected'}>({});

  // Modal states for all alerts
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // Helper function to show custom modal
  const showCustomModal = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setShowModal(true);
  };

  // Initialize WebSocket connection and load chat history
  useEffect(() => {
    let isInitialized = false;
    
    const initializeChat = async () => {
      if (isInitialized) return;
      isInitialized = true;
      
      try {
        console.log('🔌 Initializing chat for orderId:', orderId);
        const userData = await getUserData();
        if (!userData) {
          showCustomModal('error', 'خطأ', 'يرجى تسجيل الدخول مرة أخرى');
          router.replace('/(tabs)/auth/login');
          return;
        }
        setCurrentUser(userData);

        // Load chat history
        if (orderId) {
          const response = await getChatHistory(orderId);
          if (response.success) {
            setMessages(response.messages);
            if (response.order && response.order.status) {
              setOrderStatus(response.order.status);
            }
          }
        }

        // Initialize WebSocket connection
        await webSocketService.initialize(userData._id);
        
        // Test WebSocket connection
        console.log('🔌 WebSocket connection test:');
        console.log('🔌 Is connected:', webSocketService.isConnected());
        console.log('🔌 Current user ID:', webSocketService.getCurrentUserId());
        
        // Join chat room
        webSocketService.joinChat(orderId);

        // Create event handler functions
        const handleNewMessage = async (message: Message) => {
          console.log('📱 User received new message in chat:', message);
          console.log('📱 Current user ID:', userData._id);
          console.log('📱 Message sender ID:', message.sender._id);
          console.log('📱 Is message from current user?', message.sender._id === userData._id);
          console.log('📱 Message content:', message.message);
          
          // Only add message if it's not from the current user (to avoid duplicates)
          if (message.sender._id !== userData._id) {
            console.log('📱 Adding message to chat and showing notification');
            setMessages(prev => {
              console.log('📱 Previous messages count:', prev.length);
              const newMessages = [...prev, message];
              console.log('📱 New messages count:', newMessages.length);
              return newMessages;
            });
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
            
            // Don't show notification here - it's handled by the home screen's new_notification listener
            // This prevents duplicate notifications
            console.log('📱 Message added to chat - notification handled by home screen');
          } else {
            console.log('📱 Message is from current user, not showing notification');
          }
        };

        const handleOrderStatusUpdate = (data: { orderId: string; status: string }) => {
          if (data.orderId === orderId && data.status) {
            setOrderStatus(data.status);
          }
        };

        // Add event listeners
        console.log('🔌 Adding new_message listener for orderId:', orderId);
        webSocketService.on('new_message', handleNewMessage);
        webSocketService.on('order_status_update', handleOrderStatusUpdate);

        console.log('🔌 Chat initialized successfully for orderId:', orderId);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing chat:', error);
        showCustomModal('error', 'خطأ', 'فشل في تحميل المحادثة');
        setIsLoading(false);
        isInitialized = false;
      }
    };

    initializeChat();

    return () => {
      console.log('🔌 Cleaning up chat for orderId:', orderId);
      // Leave chat room and clean up event listeners
      webSocketService.leaveChat();
      console.log('🔌 Removing new_message listener for orderId:', orderId);
      webSocketService.off('new_message');
      webSocketService.off('order_status_update');
      isInitialized = false;
    };
  }, [orderId]);

  // Order status updates are now handled in the main useEffect above

  const testWebSocketConnection = () => {
    console.log('🧪 Testing WebSocket connection...');
    console.log('🧪 Is connected:', webSocketService.isConnected());
    console.log('🧪 Current user ID:', webSocketService.getCurrentUserId());
    console.log('🧪 Current order ID:', webSocketService.getCurrentOrderId());
    
    // Test emit
    if (webSocketService.isConnected()) {
      console.log('🧪 Emitting test message...');
      webSocketService.emit('test_message', { message: 'Test from client', timestamp: Date.now() });
    }
  };

  const handleSend = async () => {
    if (input.trim() === '' || !currentUser || !farmerId) return;

    const messageText = input.trim();
    setInput(''); // Clear input immediately

    // Create a temporary message for immediate display
    const tempMessage: Message = {
      _id: `temp_${Date.now()}`,
      message: messageText,
      sender: {
        _id: currentUser._id,
        name: currentUser.name,
        phone: currentUser.phone,
        avatar: currentUser.avatar
      },
      receiver: {
        _id: farmerId,
        name: farmerName,
        phone: '',
        avatar: farmerAvatar
      },
      isRead: false,
      createdAt: new Date().toISOString()
    };

    // Add message to local state immediately
    setMessages(prev => [...prev, tempMessage]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const response = await sendChatMessage(orderId!, farmerId, messageText);
      if (response.success) {
        // Replace temp message with real message from server
        setMessages(prev => prev.map(msg => 
          msg._id === tempMessage._id ? response.message : msg
        ));
      } else {
        // If failed, remove the temp message
        setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
        showCustomModal('error', 'خطأ', 'فشل في إرسال الرسالة');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove the temp message on error
      setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
      showCustomModal('error', 'خطأ', 'فشل في إرسال الرسالة');
    }
  };

  const handleCancelOrder = async () => {
    if (!orderId) return;
    try {
      await cancelServiceOrder(orderId);
      setShowConfirmModal(false);
      setMessages([]); // Clear chat messages
      showCustomModal('success', 'تم الإلغاء', 'تم إلغاء الطلب بنجاح.');
      router.push('/(tabs)/chats'); // Navigate back to chats list
    } catch (error) {
      setShowConfirmModal(false);
      showCustomModal('error', 'خطأ', 'حدث خطأ أثناء إلغاء الطلب. حاول مرة أخرى.');
    }
  };

  const handleAcceptPrice = async (proposal: any) => {
    try {
      console.log('Accepting price proposal:', proposal);
      
      // Mark this proposal as responded to
      setRespondedPriceProposals(prev => ({
        ...prev,
        [proposal.id]: 'accepted'
      }));
      
      // Send acceptance message to farmer
      const acceptanceMessage = `تم قبول عرض السعر: ${proposal.price} ريال`;
      
      // Create a temporary message for immediate display
      const tempMessage: Message = {
        _id: `temp_${Date.now()}`,
        message: acceptanceMessage,
        sender: {
          _id: currentUser!._id,
          name: currentUser!.name,
          phone: currentUser!.phone,
          avatar: currentUser!.avatar
        },
        receiver: {
          _id: farmerId,
          name: farmerName,
          phone: '',
          avatar: farmerAvatar
        },
        isRead: false,
        createdAt: new Date().toISOString()
      };

      // Add message to local state immediately
      setMessages(prev => [...prev, tempMessage]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      
      const response = await sendChatMessage(orderId, farmerId, acceptanceMessage);
      if (response.success) {
        // Replace temp message with real message from server
        setMessages(prev => prev.map(msg => 
          msg._id === tempMessage._id ? response.message : msg
        ));
      } else {
        // If failed, remove the temp message
        setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
        showCustomModal('error', 'خطأ', 'فشل في إرسال الرسالة');
        return;
      }
      
      // Update the order price in the database
      try {
        await updateOrderPrice(orderId, proposal.price);
        console.log('✅ Order price updated in database');
      } catch (error) {
        console.error('❌ Error updating order price in database:', error);
        // Continue anyway since the message was sent successfully
      }
      
      // Send WebSocket event to farmer
      console.log('💰 Emitting price_proposal_response event:', {
        orderId,
        farmerId,
        status: 'accepted',
        price: proposal.price
      });
      webSocketService.emit('price_proposal_response', {
        orderId,
        farmerId,
        status: 'accepted',
        price: proposal.price
      });
      console.log('💰 Price proposal response event emitted successfully');
      
      // Removed success popup modal - user will see the button change to "تم القبول" instead
    } catch (error) {
      console.error('Error accepting price:', error);
      showCustomModal('error', 'خطأ', 'فشل في قبول عرض السعر');
    }
  };

  const handleRejectPrice = async (proposal: any) => {
    try {
      console.log('Rejecting price proposal:', proposal);
      
      // Mark this proposal as responded to
      setRespondedPriceProposals(prev => ({
        ...prev,
        [proposal.id]: 'rejected'
      }));
      
      // Send rejection message to farmer
      const rejectionMessage = `تم رفض عرض السعر: ${proposal.price} ريال`;
      
      // Create a temporary message for immediate display
      const tempMessage: Message = {
        _id: `temp_${Date.now()}`,
        message: rejectionMessage,
        sender: {
          _id: currentUser!._id,
          name: currentUser!.name,
          phone: currentUser!.phone,
          avatar: currentUser!.avatar
        },
        receiver: {
          _id: farmerId,
          name: farmerName,
          phone: '',
          avatar: farmerAvatar
        },
        isRead: false,
        createdAt: new Date().toISOString()
      };

      // Add message to local state immediately
      setMessages(prev => [...prev, tempMessage]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      
      const response = await sendChatMessage(orderId, farmerId, rejectionMessage);
      if (response.success) {
        // Replace temp message with real message from server
        setMessages(prev => prev.map(msg => 
          msg._id === tempMessage._id ? response.message : msg
        ));
      } else {
        // If failed, remove the temp message
        setMessages(prev => prev.filter(msg => msg._id !== tempMessage._id));
        showCustomModal('error', 'خطأ', 'فشل في إرسال الرسالة');
        return;
      }
      
      // Send WebSocket event to farmer
      console.log('💰 Emitting price_proposal_response event (rejected):', {
        orderId,
        farmerId,
        status: 'rejected',
        price: proposal.price
      });
      webSocketService.emit('price_proposal_response', {
        orderId,
        farmerId,
        status: 'rejected',
        price: proposal.price
      });
      console.log('💰 Price proposal rejection event emitted successfully');
      
      showCustomModal('warning', 'مرفوض', 'تم رفض عرض السعر');
    } catch (error) {
      console.error('Error rejecting price:', error);
      showCustomModal('error', 'خطأ', 'فشل في رفض عرض السعر');
    }
  };

  // Extract price from price proposal message
  const extractPriceFromMessage = (message: string): number => {
    // Handle both ريال and ر.س formats
    const match = message.match(/عرض سعر جديد: (\d+) (?:ريال|ر\.س)/);
    return match ? parseInt(match[1]) : 0;
  };

  const handleViewInvoice = async (messageId: string) => {
    try {
      // Navigate to invoice screen
      router.push({
        pathname: '/(tabs)/chats/invoice',
        params: { orderId: orderId }
      });
    } catch (error) {
      console.error('Error viewing invoice:', error);
      showCustomModal('error', 'خطأ', 'فشل في عرض الفاتورة');
    }
  };

  // Handle camera capture
  const handleCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        showCustomModal('error', 'خطأ', 'نحتاج إذن الكاميرا لالتقاط صورة');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        // Here you would typically upload the image to your server
        // For now, we'll just show a success message
        showCustomModal('success', 'نجح', 'تم التقاط الصورة بنجاح');
        console.log('Image captured:', imageUri);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      showCustomModal('error', 'خطأ', 'فشل في التقاط الصورة');
    }
  };

  // Handle file attachment
  const handleAttachment = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const fileUri = result.assets[0].uri;
        const fileName = result.assets[0].name;
        // Here you would typically upload the file to your server
        // For now, we'll just show a success message
        showCustomModal('success', 'نجح', `تم اختيار الملف: ${fileName}`);
        console.log('File selected:', fileUri, fileName);
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      showCustomModal('error', 'خطأ', 'فشل في اختيار الملف');
    }
  };



  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      {/* Header */}
      <View style={styles.navBar}>
        <LinearGradient
          colors={["#4CAF50", "#102811"]}
          style={styles.headerFade}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
        />
        <View style={styles.navContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/(tabs)/chats')}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{farmerName || 'المحادثة'}</Text>
          </View>
        </View>
      </View>
      {/* Conversation Content */}
      <KeyboardAvoidingView style={styles.flex1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item._id}
          renderItem={({ item }) => {
            const isMyMessage = item.sender._id === currentUser?._id;
                           const isPriceProposal = !isMyMessage && item.message.includes('عرض سعر جديد:');
            const isInvoiceMessage = !isMyMessage && item.message.includes('تم إصدار الفاتورة للطلب') && item.message.includes('اضغط هنا لعرض الفاتورة');
            
            return (
              <View style={[styles.messageRow, isMyMessage ? styles.myMessageRow : styles.userMessageRow]}>
                {!isMyMessage && (
                  <Image 
                    source={
                      item.sender.avatar 
                        ? { uri: item.sender.avatar }
                        : require('../../../assets/images/icon.png')
                    }
                    style={styles.avatarSmall} 
                  />
                )}
                <View style={[styles.messageBubble, isMyMessage ? styles.myBubble : styles.userBubble]}>
                  <Text style={styles.messageText}>{item.message}</Text>
                  <Text style={styles.messageTime}>
                    {new Date(item.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  
                                       {/* Price proposal buttons */}
                     {isPriceProposal && (
                       <View style={styles.priceProposalButtons}>
                         {/* Show reject button only if not accepted */}
                         {respondedPriceProposals[item._id] !== 'accepted' && (
                           <TouchableOpacity
                             style={[
                               styles.priceButton, 
                               styles.rejectButton,
                               respondedPriceProposals[item._id] && styles.respondedButton
                             ]}
                             onPress={() => handleRejectPrice({ id: item._id, price: extractPriceFromMessage(item.message) })}
                             disabled={!!respondedPriceProposals[item._id]}
                           >
                             <Text style={styles.priceButtonText}>
                               {respondedPriceProposals[item._id] === 'rejected' ? 'تم الرفض' : 'رفض السعر'}
                             </Text>
                           </TouchableOpacity>
                         )}
                         {/* Show accept button only if not rejected */}
                         {respondedPriceProposals[item._id] !== 'rejected' && (
                           <TouchableOpacity
                             style={[
                               styles.priceButton, 
                               styles.acceptButton,
                               respondedPriceProposals[item._id] && styles.respondedButton
                             ]}
                             onPress={() => handleAcceptPrice({ id: item._id, price: extractPriceFromMessage(item.message) })}
                             disabled={!!respondedPriceProposals[item._id]}
                           >
                             <Text style={styles.priceButtonText}>
                               {respondedPriceProposals[item._id] === 'accepted' ? 'تم القبول' : 'قبول السعر'}
                             </Text>
                           </TouchableOpacity>
                         )}
                       </View>
                     )}
                     
                     {/* Invoice button */}
                     {isInvoiceMessage && (
                       <View style={styles.invoiceButtonContainer}>
                         <TouchableOpacity
                           style={styles.invoiceButton}
                           onPress={() => handleViewInvoice(item._id)}
                         >
                           <Text style={styles.invoiceButtonText}>عرض الفاتورة</Text>
                         </TouchableOpacity>
                       </View>
                     )}
                </View>
                {isMyMessage && (
                  <FontAwesome5 name="user" size={20} color="#4CAF50" style={{ marginLeft: 8 }} />
                )}
              </View>
            );
          }}
          contentContainerStyle={styles.messagesContainer}
          inverted={false}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <FontAwesome5 name="comments" size={48} color="#ccc" />
              <Text style={styles.emptyText}>لا يوجد محادثات</Text>
              <Text style={styles.emptySubtext}>ابدأ المحادثة مع المزارع</Text>
            </View>
          }
        />
        
        {/* Input */}
        <View style={styles.inputContainer}>
          <LinearGradient
            colors={["#4CAF50", "#102811"]}
            style={styles.inputFade}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            pointerEvents="none"
          />
          <View style={styles.inputWrapper}>
            <TouchableOpacity 
              style={styles.minusButton} 
              ref={minusButtonRef}
              onPress={() => {
                if (minusButtonRef.current) {
                  minusButtonRef.current.measure((fx, fy, width, height, px, py) => {
                    setDropdownPosition({
                      top: py - 100, // 60px above the icon for spacing
                      left: px - 20 // adjust for menu width
                    });
                    setShowCancelSheet(true);
                  });
                } else {
                  setShowCancelSheet(true);
                }
              }}
            >
              <FontAwesome5 name="minus-circle" size={20} color="#FF0000" />
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="اكتب رسالتك هنا..."
              placeholderTextColor="#000000"
              textAlign="right"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.inputIcons}>
              <TouchableOpacity style={styles.iconButton} onPress={handleAttachment}>
                <FontAwesome5 name="paperclip" size={20} color="#000000" style={{ transform: [{ rotate: '-45deg' }] }} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleCamera}>
                <FontAwesome5 name="camera" size={20} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <FontAwesome5 name="paper-plane" size={20} color="#fff" solid />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      {/* Dropdown Menu for Cancel */}
      <Modal
        visible={showCancelSheet}
        transparent
        animationType="none"
        onRequestClose={() => setShowCancelSheet(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowCancelSheet(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' }}>
            <TouchableWithoutFeedback>
              <View style={{
                position: 'absolute',
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                backgroundColor: '#fff',
                borderRadius: 12,
                paddingVertical: 8,
                paddingHorizontal: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 6,
                alignItems: 'center',
                minWidth: 120
              }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowCancelSheet(false);
                    if (orderStatus === 'accepted') {
                      // Navigate to the new cancel order page
                      router.push({
                        pathname: '/(tabs)/chats/cancel-order',
                        params: { orderId }
                      });
                    } else {
                      setShowCannotCancelModal(true);
                    }
                  }}
                  style={{ width: '100%', paddingVertical: 8, alignItems: 'center' }}
                >
                  <Text style={{ color: '#FF0000', fontSize: 16, fontWeight: 'bold' }}>الغاء الطلب</Text>
                </TouchableOpacity>
                {/* Separator */}
                <View style={{ width: '100%', height: 1, backgroundColor: '#eee', marginVertical: 4 }} />
                {/* Track Order */}
                <TouchableOpacity
                  onPress={() => {
                    setShowCancelSheet(false);
                    router.push({
                      pathname: '/(tabs)/chats/track-order',
                      params: { orderId, farmerName, farmerId }
                    });
                  }}
                  style={{ width: '100%', paddingVertical: 8, alignItems: 'center' }}
                >
                  <Text style={{ color: '#000', fontSize: 16, fontWeight: 'bold' }}>تتبع الطلب</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Cancel Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>هل أنت متأكد من إلغاء الطلب؟</Text>
              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowConfirmModal(false)}
                >
                  <Text style={styles.cancelButtonText}>تراجع</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={async () => {
                    await handleCancelOrder();
                  }}
                >
                  <Text style={styles.confirmButtonText}>تأكيد الإلغاء</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      {/* Cannot Cancel Modal */}
      <Modal
        visible={showCannotCancelModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCannotCancelModal(false)}
      >
        <View style={styles.notificationModalOverlay}>
          <View style={styles.notificationModalContainer}>
            <View style={styles.notificationModalContent}>
              <View style={{ marginBottom: 16 }}>
                <FontAwesome5 name="times-circle" size={40} color="#FF3B30" />
              </View>
              <Text style={styles.notificationModalTitle}>لا يمكن إلغاء الطلب بعد بدء العمل</Text>
              <Text style={styles.notificationModalMessage}>لا يمكن إلغاء الطلب بعد أن بدأ المزارع العمل عليه.</Text>
              <TouchableOpacity
                style={styles.notificationModalButton}
                onPress={() => setShowCannotCancelModal(false)}
              >
                <Text style={styles.notificationModalButtonText}>حسناً</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Modal for all alerts */}
      <CustomModal
        visible={showModal}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setShowModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  flex1: {
    flex: 1,
  },
  navBar: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerFade: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    right: 0,
    padding: 8,
    zIndex: 1,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  messagesContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  userMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '70%',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 8,
  },
  myBubble: {
    backgroundColor: '#e0f7e9',
    alignSelf: 'flex-end',
  },
  userBubble: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: '#222',
    textAlign: 'right',
  },
  messageTime: {
    fontSize: 12,
    color: '#888',
    textAlign: 'left',
    marginTop: 4,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginLeft: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: -10,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
    position: 'relative',
    overflow: 'hidden',
  },
  inputFade: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 16,
    fontSize: 16,
    textAlign: 'right',
    backgroundColor: 'transparent',
  },
  inputIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  minusButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 16,
    color: '#222',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  modalButton: {
    backgroundColor: '#eee',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginHorizontal: 8,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#FF0000',
  },
  modalButtonText: {
    color: '#222',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  priceProposalContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f8f8',
  },
  priceProposalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  priceProposalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 8,
  },
  priceProposalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 8,
  },
  priceProposalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  priceProposalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  priceButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 28,
    minWidth: 80,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  priceButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  respondedButton: {
    backgroundColor: '#ccc',
    opacity: 0.7,
  },
  invoiceButtonContainer: {
    marginTop: 8,
  },
  invoiceButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 36,
  },
  invoiceButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  notificationModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  notificationModalTitle: {
    fontSize: 16,
    color: '#222',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  notificationModalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  notificationModalButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
  },
  notificationModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default MessageScreen; 