import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProjectFormScreen() {
  const router = useRouter();
  const { name, image, description } = useLocalSearchParams();
  const [form, setForm] = useState({
    projectName: '',
    projectType: '',
    city: '',
    address: '',
    duration: '',
    price: '',
    other: '',
  });

  // Clear form data when screen is focused for security
  useFocusEffect(
    useCallback(() => {
      setForm({
        projectName: '',
        projectType: '',
        city: '',
        address: '',
        duration: '',
        price: '',
        other: '',
      });
    }, [])
  );

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <View style={styles.container}>
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>تفاصيل المشاريع</Text>
          </View>
        </View>
      </View>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={require('../../../assets/images/icon.jpg')} style={styles.logo} resizeMode="contain" />
        </View>
        {/* Card Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>استمارة المشاريع</Text>
          {/* Table-like layout */}
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>اسم المشروع</Text>
            <View style={styles.verticalLine} />
            <TextInput
              style={styles.tableInput}
              placeholder=""
              value={form.projectName}
              onChangeText={v => handleChange('projectName', v)}
              textAlign="right"
            />
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>نوع المشروع</Text>
            <View style={styles.verticalLine} />
            <TextInput
              style={styles.tableInput}
              placeholder=""
              value={form.projectType}
              onChangeText={v => handleChange('projectType', v)}
              textAlign="right"
            />
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>المدينة - الحي</Text>
            <View style={styles.verticalLine} />
            <TextInput
              style={styles.tableInput}
              placeholder=""
              value={form.city}
              onChangeText={v => handleChange('city', v)}
              textAlign="right"
            />
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>مدة المشروع</Text>
            <View style={styles.verticalLine} />
            <TextInput
              style={styles.tableInput}
              placeholder=""
              value={form.duration}
              onChangeText={v => handleChange('duration', v)}
              textAlign="right"
            />
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>قيمة المشروع</Text>
            <View style={styles.verticalLine} />
            <TextInput
              style={styles.tableInput}
              placeholder=""
              value={form.price}
              onChangeText={v => handleChange('price', v)}
              textAlign="right"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>أخرى</Text>
            <View style={styles.verticalLine} />
            <TextInput
              style={styles.tableInput}
              placeholder=""
              value={form.other}
              onChangeText={v => handleChange('other', v)}
              textAlign="right"
              multiline
            />
          </View>
        </View>
        {/* Gradient Button */}
        <TouchableOpacity style={styles.buttonWrapper}>
          <LinearGradient
            colors={["#2E8B57", "#4CAF50"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>إرسال</Text>
            <FontAwesome5 name="paper-plane" size={18} color="#fff" style={{ marginRight: 8 }} />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  navBar: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
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
  content: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 12,
  },
  logo: {
    width: 100,
    height: 100,
  },
  formCard: {
    backgroundColor: '#F7F7F7',
    borderRadius: 12,
    padding: 0,
    margin: 16,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#eee',
    overflow: 'hidden',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    backgroundColor: '#EDEDED',
    paddingVertical: 12,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  tableRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    minHeight: 44,
    paddingHorizontal: 8,
  },
  tableLabel: {
    flex: 1,
    fontSize: 15,
    color: '#444',
    textAlign: 'right',
    paddingVertical: 12,
    paddingLeft: 8,
  },
  tableInput: {
    flex: 2,
    fontSize: 15,
    color: '#222',
    backgroundColor: 'transparent',
    textAlign: 'right',
    borderWidth: 0,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  buttonWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  verticalLine: {
    width: 1,
    height: '70%',
    backgroundColor: '#e0e0e0',
    marginHorizontal: 6,
  },
}); 