import { FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../_colors';

export default function ServiceDetailsScreen() {
  const router = useRouter();
  const { id, name, image, description } = useLocalSearchParams();

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
        <Text style={styles.headerTitle}>تفاصيل الخدمة</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome5 name="arrow-right" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Service Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: image as string }} 
            style={styles.serviceImage}
            resizeMode="cover"
          />
        </View>

        {/* Service Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.serviceName}>{name}</Text>
          <Text style={styles.serviceDescription}>{description}</Text>

          {/* Service Features */}
          <View style={styles.featuresContainer}>
            <Text style={styles.sectionTitle}>مميزات الخدمة</Text>
            <View style={styles.featureItem}>
              <FontAwesome5 name="check-circle" size={16} color={Colors.primary} />
              <Text style={styles.featureText}>خدمة احترافية</Text>
            </View>
            <View style={styles.featureItem}>
              <FontAwesome5 name="check-circle" size={16} color={Colors.primary} />
              <Text style={styles.featureText}>أسعار تنافسية</Text>
            </View>
            <View style={styles.featureItem}>
              <FontAwesome5 name="check-circle" size={16} color={Colors.primary} />
              <Text style={styles.featureText}>ضمان الجودة</Text>
            </View>
          </View>

          {/* Book Service Button */}
          <TouchableOpacity style={styles.bookButton}>
            <Text style={styles.bookButtonText}>حجز الخدمة</Text>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 250,
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 20,
  },
  serviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'right',
  },
  serviceDescription: {
    fontSize: 16,
    color: '#666666',
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'right',
  },
  featuresContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    textAlign: 'right',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'flex-end',
  },
  featureText: {
    fontSize: 16,
    color: '#666666',
    marginRight: 8,
  },
  bookButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
}); 