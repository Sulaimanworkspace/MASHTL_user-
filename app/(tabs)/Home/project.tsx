import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getUserData } from '../../services/api';
import Colors from '../../_colors';

export default function ProjectScreen() {
  const router = useRouter();
  const { id, name, image, description } = useLocalSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status
  useFocusEffect(
    useCallback(() => {
      const checkAuthStatus = async () => {
        try {
          const userData = await getUserData();
          setIsLoggedIn(userData && userData.name ? true : false);
        } catch (error) {
          setIsLoggedIn(false);
        }
      };
      checkAuthStatus();
    }, [])
  );

  return (
    <View style={styles.container}>
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
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>المشاريع الزراعية</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Project Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: image as string }} 
            style={styles.projectImage}
            resizeMode="cover"
          />
        </View>

        {/* Project Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.projectName}>{name}</Text>
          <Text style={styles.projectDescription}>{description}</Text>

          {/* Project Types */}
          <View style={styles.projectTypesContainer}>
            <Text style={styles.sectionTitle}>أنواع المشاريع</Text>
            
            <View style={styles.projectTypeItem}>
              <FontAwesome5 name="building" size={20} color={Colors.primary} />
              <View style={styles.projectTypeContent}>
                <Text style={styles.projectTypeTitle}>المشاريع التجارية</Text>
                <Text style={styles.projectTypeDescription}>تصميم وتنفيذ المشاريع الزراعية للشركات والمؤسسات</Text>
              </View>
            </View>

            <View style={styles.projectTypeItem}>
              <FontAwesome5 name="home" size={20} color={Colors.primary} />
              <View style={styles.projectTypeContent}>
                <Text style={styles.projectTypeTitle}>المشاريع السكنية</Text>
                <Text style={styles.projectTypeDescription}>تنسيق وتصميم الحدائق المنزلية والفلل</Text>
              </View>
            </View>

            <View style={styles.projectTypeItem}>
              <FontAwesome5 name="industry" size={20} color={Colors.primary} />
              <View style={styles.projectTypeContent}>
                <Text style={styles.projectTypeTitle}>المشاريع الصناعية</Text>
                <Text style={styles.projectTypeDescription}>تصميم وتنفيذ المشاريع الزراعية للمصانع والمناطق الصناعية</Text>
              </View>
            </View>
          </View>

          {/* Project Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>مميزات المشاريع</Text>
            <View style={styles.featureItem}>
              <FontAwesome5 name="check-circle" size={16} color={Colors.primary} />
              <Text style={styles.featureText}>تصميم احترافي</Text>
            </View>
            <View style={styles.featureItem}>
              <FontAwesome5 name="check-circle" size={16} color={Colors.primary} />
              <Text style={styles.featureText}>تنفيذ بأحدث التقنيات</Text>
            </View>
            <View style={styles.featureItem}>
              <FontAwesome5 name="check-circle" size={16} color={Colors.primary} />
              <Text style={styles.featureText}>ضمان الجودة</Text>
            </View>
            <View style={styles.featureItem}>
              <FontAwesome5 name="check-circle" size={16} color={Colors.primary} />
              <Text style={styles.featureText}>صيانة دورية</Text>
            </View>
          </View>

          {/* Contact Button */}
          <TouchableOpacity style={styles.gradientButtonWrapper}
            onPress={() => {
              if (!isLoggedIn) {
                router.replace('/(tabs)/auth/login');
                return;
              }
              router.push({
                pathname: '/(tabs)/Home/project-form',
                params: {
                  name: name,
                  image: image,
                  description: description,
                }
              });
            }}
          >
            <View style={styles.gradientButton}>
              <Text style={styles.gradientButtonText}>تواصل معنا</Text>
            </View>
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
  imageContainer: {
    width: '100%',
    height: 250,
  },
  projectImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 20,
  },
  projectName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'right',
  },
  projectDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'right',
  },
  projectTypesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'right',
  },
  projectTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  projectTypeContent: {
    flex: 1,
    marginRight: 12,
  },
  projectTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
    textAlign: 'right',
  },
  projectTypeDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'right',
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'flex-zf',
  },
  featureText: {
    fontSize: 16,
    color: '#666666',
    marginRight: 8,
  },
  gradientButtonWrapper: {
    width: '90%',
    alignSelf: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  gradientButton: {
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    elevation: 2,
    backgroundColor: '#2E8B57',
  },
  gradientButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 