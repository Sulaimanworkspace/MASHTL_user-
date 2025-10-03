import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const About: React.FC = () => {
  const router = useRouter();
  const Container = View;
  const containerProps = {};

  return (
    <Container style={styles.container} {...containerProps}>
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/settings')}
        >
          <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>عن مشتل</Text>
          </View>
        </View>
      </View>

      {/* About Content */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/images/icon.png')}
              style={styles.logo}
            />
          </View>
          <Text style={styles.heroTitle}>مشتل</Text>
          <Text style={styles.heroSubtitle}>حديقتك.. أحلامك</Text>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          {/* Introduction Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>من نحن</Text>
              <FontAwesome5 name="leaf" size={20} color="#000000" />
            </View>
            <Text style={styles.paragraph}>
              أصبحت الحدائق جزءاً مهماً من المساحات الخارجية للمنازل والحدائق العامة، وتعتبر الزراعة مصدراً من أهم المصادر الاقتصادية في الحياة.
            </Text>
            <Text style={styles.paragraph}>
              تشمل الزراعة إنتاج المحاصيل والغطاء النباتي من الغابات وغيرها، وتساعد على خفض التوتر والقلق وتحسين الصحة العقلية والنفسية من خلال قضاء الوقت في الهواء الطلق.
            </Text>
          </View>

          {/* Hadith Section */}
          <View style={styles.hadithSection}>
            <View style={styles.hadithContainer}>
              <FontAwesome5 name="quote-right" size={24} color="#000000" style={styles.quoteIcon} />
              <Text style={styles.hadithText}>
          عن أنس بن مالك رضي الله عنه قال: قال رسول الله ﷺ: «ما من مسلم يغرس غرسًا أو يزرع زرعًا فيأكل منه طير أو إنسان أو بهيمة إلا كان له به صدقة».
              </Text>
            </View>
          </View>

          {/* Mission Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>مهمتنا</Text>
            </View>
            <Text style={styles.paragraph}>
              من هذا المنطلق تم إنشاء تطبيق مشتل ليكون رافداً أساسياً للزراعة الرقمية وتحويل صناعة الزراعة بشكل عصري وجذاب.
            </Text>
            <Text style={styles.paragraph}>
              نسعى لتسهيل زراعة حدائق المنازل في المدن المكتظة، حيث يمكنك التواصل مع المزارع الأقرب لك ليصنع لك حديقة جميلة في منزلك.
        </Text>
      </View>

          {/* Features Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>مميزاتنا</Text>
            </View>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <FontAwesome5 name="check-circle" size={16} color="#000000" />
                <Text style={styles.featureText}>ربط مباشر مع المزارعين المحترفين</Text>
              </View>
              <View style={styles.featureItem}>
                <FontAwesome5 name="check-circle" size={16} color="#000000" />
                <Text style={styles.featureText}>خدمات زراعية شاملة ومتخصصة</Text>
              </View>
              <View style={styles.featureItem}>
                <FontAwesome5 name="check-circle" size={16} color="#000000" />
                <Text style={styles.featureText}>تصميم وتنفيذ الحدائق المنزلية</Text>
              </View>
              <View style={styles.featureItem}>
                <FontAwesome5 name="check-circle" size={16} color="#000000" />
                <Text style={styles.featureText}>متابعة ومشورة مستمرة</Text>
              </View>
            </View>
          </View>


        </View>
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  navBar: {
    paddingTop: Platform.OS === 'android' ? 20 : 50,
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
  scrollContainer: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 16,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginTop: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'flex-end',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginRight: 5,
    textAlign: 'right',
    flex: 1,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#34495e',
    textAlign: 'right',
    marginBottom: 16,
  },
  hadithSection: {
    marginTop: 30,
    marginBottom: 20,
  },
  hadithContainer: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  quoteIcon: {
    marginBottom: 12,
    alignSelf: 'flex-end',
  },
  hadithText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2c3e50',
    textAlign: 'right',
    fontStyle: 'italic',
  },
  featuresList: {
    marginTop: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  featureText: {
    fontSize: 15,
    color: '#34495e',
    marginLeft: 12,
    flex: 1,
    textAlign: 'right',
  },

});

export default About; 