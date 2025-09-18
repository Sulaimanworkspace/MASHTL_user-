import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { getUserWallet, getUserData } from '../../services/api';

const Wallet: React.FC = () => {
  const router = useRouter();
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching wallet data...');
      
      const userData = await getUserData();
      console.log('👤 User data:', userData);
      
      if (!userData || !userData._id) {
        console.log('❌ User not authenticated');
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      console.log('✅ User authenticated, fetching wallet...');
      
      const response = await getUserWallet();
      console.log('💰 Wallet response:', response);
      
      if (response.success) {
        setWalletData(response.data);
        console.log('💰 Wallet data loaded successfully:', response.data);
        console.log('💰 Balance:', response.data.balance);
      } else {
        console.error('❌ Failed to fetch wallet data:', response.message);
        // Initialize empty wallet data to show 0.00
        setWalletData({ balance: 0, transactions: [] });
      }
    } catch (error) {
      console.error('❌ Error fetching wallet:', error);
      // Initialize empty wallet data to show 0.00 instead of error
      setWalletData({ balance: 0, transactions: [] });
    } finally {
      setLoading(false);
    }
  };

  // Fetch wallet data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchWalletData();
    }, [])
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4CAF50" />

      {/* Green Header Navigation Bar */}
      <View style={styles.navBar}>
        <LinearGradient
          colors={["#4CAF50", "#102811"]}
          style={styles.headerFade}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          pointerEvents="none"
        />
        <View style={styles.navContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)/settings')}>
            <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>محفظتي</Text>
          </View>
        </View>
        <View style={styles.walletInfoHeaderRow}>
          <MaterialIcons name="account-balance-wallet" size={16} color="#fff" style={{ marginLeft: 2 }} />
          <Text style={styles.walletInfoHeaderLabel}>محفظتي</Text>
          <Text style={styles.walletInfoHeaderCurrency}>ريال</Text>
          <Text style={styles.walletInfoHeaderAmount}>
            {loading ? '...' : `${((walletData?.balance || 0).toFixed(2))}`}
          </Text>
        </View>
      </View>

      {/*/!* Wallet Info Row *!/*/}
      {/*<View style={styles.walletInfoRow}>*/}
      {/*  <MaterialIcons name="account-balance-wallet" size={18} color="#222" style={{ marginLeft: 4 }} />*/}
      {/*  <Text style={styles.walletInfoLabel}>محفظتي</Text>*/}
      {/*  <Text style={styles.walletInfoAmount}>0.00</Text>*/}
      {/*</View>*/}

      {/* Content */}
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>جاري تحميل البيانات...</Text>
        </View>
      ) : !isAuthenticated ? (
        <View style={styles.centerContent}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="account-circle" size={48} color="#BDBDBD" />
          </View>
          <Text style={styles.noTransactions}>يرجى تسجيل الدخول لعرض محفظتك</Text>
          <TouchableOpacity 
            style={styles.loginButton}
            onPress={() => router.push('/(tabs)/auth/login')}
          >
            <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
      ) : walletData?.transactions && walletData.transactions.length > 0 ? (
        <ScrollView style={styles.transactionsContainer}>
          {walletData.transactions.slice().reverse().map((transaction: any, index: number) => (
            <View key={index} style={styles.transactionItem}>
              <View style={styles.transactionLeft}>
                <MaterialIcons 
                  name={transaction.type === 'deposit' ? 'arrow-downward' : 'arrow-upward'} 
                  size={24} 
                  color={transaction.type === 'deposit' ? '#4CAF50' : '#f44336'} 
                />
                <View style={styles.transactionDetails}>
                  <Text style={styles.transactionDescription}>{transaction.description}</Text>
                  <Text style={styles.transactionDate}>
                    {(() => {
                      const date = new Date(transaction.date);
                      const arabicMonths = [
                        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
                      ];
                      const day = date.getDate();
                      const month = arabicMonths[date.getMonth()];
                      const year = date.getFullYear();
                      const hours24 = date.getHours();
                      const minutes = date.getMinutes().toString().padStart(2, '0');
                      const hours12 = hours24 % 12 || 12;
                      const ampm = hours24 >= 12 ? 'مساءً' : 'صباحاً';
                      return `${day} ${month} ${year} - ${hours12}:${minutes} ${ampm} (ميلادي)`;
                    })()}
                  </Text>
                </View>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: transaction.type === 'deposit' ? '#4CAF50' : '#f44336' }
              ]}>
                {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount.toFixed(2)} ريال
              </Text>
            </View>
          ))}
        </ScrollView>
      ) : (
      <View style={styles.centerContent}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="sync-alt" size={48} color="#BDBDBD" />
        </View>
        <Text style={styles.noTransactions}>لا يوجد اي عمليات او تحويلات سابقة</Text>
      </View>
      )}

      {/* Bottom Button - Hidden */}
      {/* <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>اضافة رصيد للمحفظة</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navBar: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
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
    top: 0,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  walletInfoHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: 10,
  },
  walletInfoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
  },
  walletInfoLabel: {
    fontSize: 15,
    color: '#222',
    marginHorizontal: 6,
  },
  walletInfoAmount: {
    fontSize: 15,
    color: '#222',
    marginLeft: 12,
  },
  walletInfoHeaderLabel: {
    fontSize: 15,
    color: '#fff',
    marginHorizontal: 6,
  },
  walletInfoHeaderCurrency: {
    fontSize: 15,
    color: '#fff',
    marginLeft: 12,
  },
  walletInfoHeaderAmount: {
    fontSize: 15,
    color: '#fff',
    marginLeft: 12,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  noTransactions: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
    textAlign: 'center',
  },
  buttonWrapper: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#2E8B57',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    alignSelf: 'center',
    elevation: 2,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  transactionsContainer: {
    flex: 1,
    padding: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionDetails: {
    marginLeft: 10,
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
});

export default Wallet; 