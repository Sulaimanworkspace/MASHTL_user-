import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

// Use local colors
const Colors = {
  primary: '#2E8B57',
  background: '#FFFFFF',
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#999999',
  }
};

type CategoryItemProps = {
  icon: string;
  label: string;
  onPress: () => void;
};

function CategoryItem({ icon, label, onPress }: CategoryItemProps) {
  return (
    <TouchableOpacity style={styles.categoryItem} onPress={onPress}>
      <View style={styles.iconCircle}>
        <FontAwesome5 name={icon} size={20} color={Colors.primary} />
      </View>
      <Text style={styles.categoryLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function CategorySection() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <CategoryItem icon="tree" label="Trees" onPress={() => {}} />
        <CategoryItem icon="seedling" label="Plants" onPress={() => {}} />
        <CategoryItem icon="leaf" label="Flowers" onPress={() => {}} />
        <CategoryItem icon="spa" label="Indoor" onPress={() => {}} />
        <CategoryItem icon="tools" label="Tools" onPress={() => {}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  categoryItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 70,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    color: Colors.text.primary,
    textAlign: 'center',
  },
}); 