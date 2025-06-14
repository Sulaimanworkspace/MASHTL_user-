import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Keyboard, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = () => {
    // TODO: Implement signup logic
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.outerContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#222" />
        <View style={styles.container}>
          <Image source={require('../../../assets/images/icon.jpg')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>إنشاء حساب جديد</Text>
          <TextInput
            style={styles.input}
            placeholder="الاسم"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#BDBDBD"
            textAlign="right"
          />
          <TextInput
            style={styles.input}
            placeholder="رقم الهاتف"
            value={phone}
            onChangeText={setPhone}
            placeholderTextColor="#BDBDBD"
            keyboardType="phone-pad"
            textAlign="right"
          />
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="كلمة المرور"
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#BDBDBD"
              secureTextEntry
              textAlign="right"
            />
            <Text style={styles.passwordIcon}>🗝️</Text>
          </View>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="تأكيد كلمة المرور"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholderTextColor="#BDBDBD"
              secureTextEntry
              textAlign="right"
            />
            <Text style={styles.passwordIcon}>🗝️</Text>
          </View>
          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>إنشاء حساب</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.signupButton]} onPress={() => router.push('./login')}>
            <Text style={styles.buttonText}>لديك حساب؟ تسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 12,
    marginTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#33691E',
    marginBottom: 18,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 14,
    color: '#222',
  },
  passwordRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    width: '100%',
    marginBottom: 14,
  },
  passwordIcon: {
    fontSize: 18,
    marginLeft: 8,
    color: '#888',
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 24,
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 0,
  },
  signupButton: {
    backgroundColor: '#388E3C',
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 