import { ScrollView, View, Text, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import Banner from "./_components/Banner";
import CategorySection from "./_components/CategorySection";
import ServiceCard from "./_components/ServiceCard";

// Local colors to match _layout.tsx
const Colors = {
  primary: '#2E8B57',
  secondary: '#666666',
  background: '#FFFFFF',
  text: {
    primary: '#333333',
    secondary: '#666666'
  }
};

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.background} barStyle="dark-content" />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.greeting}>Hello, Plant Lover!</Text>
        <Banner />
        <CategorySection />
        
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          
          <ServiceCard 
            title="Garden Design" 
            description="Professional landscape design for your garden or backyard" 
            iconName="drafting-compass"
            onPress={() => {}}
          />
          
          <ServiceCard 
            title="Plant Care" 
            description="Expert maintenance and care for all your plants" 
            iconName="hand-holding-water"
            onPress={() => {}}
          />
          
          <ServiceCard 
            title="Plant Installation" 
            description="Professional planting services for trees, shrubs, and flowers" 
            iconName="seedling"
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 100, // Extra padding for the floating tab bar
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  servicesSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
});
