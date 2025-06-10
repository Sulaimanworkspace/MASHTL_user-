import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const Wallet: React.FC = () => {
  const router = useRouter();

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
        {/* Wallet info row in header, top right */}
        <View style={styles.walletInfoHeaderRow}>
          <MaterialIcons name="account-balance-wallet" size={16} color="#fff" style={{ marginLeft: 2 }} />
          <Text style={styles.walletInfoHeaderLabel}>محفظتي</Text>
          <Text style={styles.walletInfoHeaderCurrency}>ريال</Text>
          <Text style={styles.walletInfoHeaderAmount}>0.00</Text>
        </View>
        {/* Centered header title */}
        <Text style={styles.headerTitle}>محفظتي</Text>
        {/* Back button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/settings')}
        >
          <MaterialIcons name="arrow-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Wallet Info Row */}
      <View style={styles.walletInfoRow}>
        <MaterialIcons name="account-balance-wallet" size={18} color="#222" style={{ marginLeft: 4 }} />
        <Text style={styles.walletInfoLabel}>محفظتي</Text>
        <Text style={styles.walletInfoAmount}>0.00</Text>
      </View>

      {/* Centered Content */}
      <View style={styles.centerContent}>
        <View style={styles.iconCircle}>
          <MaterialIcons name="sync-alt" size={48} color="#BDBDBD" />
        </View>
        <Text style={styles.noTransactions}>لا يوجد اي عمليات او تحويلات سابقة</Text>
      </View>

      {/* Bottom Button */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>اضافة رصيد للمحفظة</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navBar: {
    position: 'relative',
    height: 110,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerFade: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 50,
    zIndex: 1,
  },
  walletInfoHeaderRow: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    zIndex: 2,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 54,
    padding: 8,
    zIndex: 2,
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
});

export default Wallet; 