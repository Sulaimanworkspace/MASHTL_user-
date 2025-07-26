import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { cancelServiceOrder } from '../../services/api';

const CancelOrderScreen: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  
  const [selectedReason, setSelectedReason] = useState<string>('السعر غير مناسب');
  const [isLoading, setIsLoading] = useState(false);

  const cancelReasons = [
    'السعر غير مناسب',
    'مقدم الخدمة غير جيد',
    'لا يوجد ادوات العمل',
    'اخرى'
  ];

  const handleCancelOrder = async () => {
    if (!orderId) return;
    
    setIsLoading(true);
    try {
      await cancelServiceOrder(orderId, selectedReason);
      // Navigate back to chats list
      router.push('/(tabs)/chats');
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      // You can show an error alert here if needed
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />
      
      {/* Header */}
      <LinearGradient
        colors={["#4CAF50", "#102811"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>الغاء الطلب</Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Reason Selection Card */}
        <View style={styles.reasonCard}>
          <Text style={styles.reasonTitle}>سبب الغاء الطلب</Text>
          
          {/* Reason Options */}
          {cancelReasons.map((reason, index) => (
            <TouchableOpacity
              key={index}
              style={styles.reasonOption}
              onPress={() => setSelectedReason(reason)}
              activeOpacity={0.7}
            >
              <View style={styles.checkboxContainer}>
                <View style={[
                  styles.checkbox,
                  selectedReason === reason && styles.checkboxSelected
                ]}>
                  {selectedReason === reason && (
                    <View style={styles.checkboxInner} />
                  )}
                </View>
              </View>
              <Text style={styles.reasonText}>{reason}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Cancel Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.cancelButton, isLoading && styles.cancelButtonDisabled]}
          onPress={handleCancelOrder}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>
            {isLoading ? 'جاري الإلغاء...' : 'الغاء الطلب'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  reasonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reasonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 24,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  checkboxContainer: {
    marginRight: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: '#FF0000',
    backgroundColor: '#FF0000',
  },
  checkboxInner: {
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  reasonText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    textAlign: 'right',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  cancelButton: {
    backgroundColor: '#FF0000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CancelOrderScreen; 