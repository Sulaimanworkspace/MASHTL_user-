import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ServiceDetailsScreen() {
  const router = useRouter();
  const { id, name, image, description } = useLocalSearchParams();

  // Example features for each service
  const featuresData: Record<string, string[]> = {
    'تنسيق الحدائق': [
      'تصميم الحديقة.',
      'اختيار النباتات المناسبة.',
      'تركيب أنظمة الري.',
      'تنسيق المساحات الخضراء.'
    ],
    'زراعة الأشجار': [
      'اختيار أفضل أنواع الأشجار.',
      'زراعة الأشجار بطريقة احترافية.',
      'توفير الرعاية اللازمة.',
      'ضمان نجاح الزراعة.'
    ],
    'زراعة ثيل': [
      'تجهيز الأرض.',
      'زراعة الثيل الطبيعي أو الصناعي.',
      'ضمان جودة العشب.',
      'خدمات صيانة دورية.'
    ]
  };
  const features = featuresData[name as string] || [];

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
            <Text style={styles.headerTitle}>تفاصيل الخدمة</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={styles.bannerContainer}>
          <Image 
            source={{ uri: image as string }} 
            style={styles.bannerImageFull}
            resizeMode="cover"
          />
        </View>
        <View style={styles.textSection}>
          <Text style={styles.titleLarge}>{name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>(4.2)</Text>
            <FontAwesome5 name="star" size={14} color="#FFD700" />
            <FontAwesome5 name="star" size={14} color="#FFD700" />
            <FontAwesome5 name="star" size={14} color="#FFD700" />
            <FontAwesome5 name="star" size={14} color="#FFD700" />
            <FontAwesome5 name="star-half-alt" size={14} color="#FFD700" />
          </View>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>وصف الخدمة</Text>
          <Text style={styles.descriptionLarge}>{description}</Text>
          <Text style={styles.sectionTitle}>ما تشمله الخدمة</Text>
          {features.map((feature, idx) => (
            <View key={idx} style={styles.featureRow}>
              <FontAwesome5 name="circle" size={10} color="#4CAF50" style={{ marginLeft: 6 }} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.gradientButtonWrapper} onPress={() => router.push({
          pathname: '/(tabs)/Home/order-summary',
          params: {
            projectName: name,
            projectType: 'خدمة',
            image: image,
            description: description,
          }
        })}>
          <LinearGradient
            colors={["#4CAF50", "#179a3a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.gradientButtonText}>طلب الخدمة</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  bannerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 0,
  },
  bannerImageFull: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderRadius: 0,
    marginBottom: 0,
  },
  textSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  cardContent: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 16,
    marginHorizontal: 0,
    alignItems: 'flex-end',
    elevation: 2,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 6,
    textAlign: 'right',
    alignSelf: 'flex-end',
  },
  descriptionLarge: {
    fontSize: 15,
    color: '#444',
    marginBottom: 12,
    textAlign: 'right',
    alignSelf: 'flex-end',
  },
  featureRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 4,
    alignSelf: 'flex-end',
  },
  featureText: {
    fontSize: 14,
    color: '#222',
    textAlign: 'right',
  },
  ratingRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#888',
    marginLeft: 6,
  },
  titleLarge: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 4,
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
  },
  gradientButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 