import { StyleSheet, View, Text, ImageBackground, Dimensions } from 'react-native';

// Use the local Colors from _layout.tsx
const Colors = {
  primary: '#2E8B57',
  background: '#FFFFFF',
  white: '#FFFFFF',
  text: { primary: '#333333' }
};

const { width } = Dimensions.get('window');

export default function Banner() {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80' }}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Professional Planting Services</Text>
          <Text style={styles.subtitle}>Transform your space with expert gardeners</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 180,
    width: width - 32,
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  backgroundImage: {
    borderRadius: 16,
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
    borderRadius: 16,
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
  },
}); 