import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const About: React.FC = () => {
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
        <Text style={styles.headerTitle}>عن مشتل</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/settings')}
        >
          <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* About Content */}
      <View style={styles.content}>
        {/* Add your about content here */}
        <Text>
          تعريف /أصبحت الحدائق جزء مهما من المساحات الخارجية للمنازل والحدائق العامة
          وتعتبر الزراعة مصدراً من اهم المصادر الاقتصادية بالحياة
          وتشمل الزراعة انتاج المحاصيل والغطاء النباتي من الغابات وغيرها.
          ومن فوائد الزراعة تساعد على خفض التوتر والقلق وتحسين الصحة العقلية والنفسية من خلال قضاء الوقت فى الهواء الطلق.
          عن أنس بن مالك رضي الله عنه قال: قال رسول الله ﷺ: «ما من مسلم يغرس غرسًا أو يزرع زرعًا فيأكل منه طير أو إنسان أو بهيمة إلا كان له به صدقة».
          ومن هذا المنطلق تم إنشاء هذا الموقع ليكون رافداً أساسياً للزراعة الرقمية وتحويل صناعة الزراعة بشكل عصري وجذاب، حيث سهولة زراعة حدائق المنازل فى المدن المكتظة  وتستطيع أنت أيها القارئ التواصل مع المزارع الأقرب لك ليصنع لك حديقة جميلة فى منزلك.
          ماعليك سوى تحميل تطبيق مشتل وطلب المزارع مباشرة
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  content: {
    backgroundColor: '#f0f0f0',
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    textAlign:"center"
  },
});

export default About; 