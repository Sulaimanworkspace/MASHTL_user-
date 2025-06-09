import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
          <TouchableOpacity style={styles.backButton} onPress={() => router.push({ pathname: '/(tabs)/Home/project', params: { name, image, description } })}>
            <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>نموذج مشروع زراعي</Text>
          </View>
        </View>
      </View>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>بيانات المشروع</Text>
          <TextInput
            style={styles.input}
            placeholder="اسم المشروع"
            value={form.projectName}
            onChangeText={v => handleChange('projectName', v)}
            textAlign="right"
          />
          <TextInput
            style={styles.input}
            placeholder="نوع المشروع"
            value={form.projectType}
            onChangeText={v => handleChange('projectType', v)}
            textAlign="right"
          />
          <TextInput
            style={styles.input}
            placeholder="المدينة"
            value={form.city}
            onChangeText={v => handleChange('city', v)}
            textAlign="right"
          />
          <TextInput
            style={styles.input}
            placeholder="العنوان"
            value={form.address}
            onChangeText={v => handleChange('address', v)}
            textAlign="right"
          />
          <TextInput
            style={styles.input}
            placeholder="المدة"
            value={form.duration}
            onChangeText={v => handleChange('duration', v)}
            textAlign="right"
          />
          <TextInput
            style={styles.input}
            placeholder="السعر"
            value={form.price}
            onChangeText={v => handleChange('price', v)}
            textAlign="right"
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, { minHeight: 60 }]}
            placeholder="أخرى"
            value={form.other}
            onChangeText={v => handleChange('other', v)}
            textAlign="right"
            multiline
          />
          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>تأكيد الطلب</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    textAlign: 'right',
    alignSelf: 'flex-end',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
    textAlign: 'right',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    width: '100%',
    alignSelf: 'center',
    elevation: 2,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 