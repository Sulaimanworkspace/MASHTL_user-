import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

const BANNER_WIDTH = 350;
const BANNER_HEIGHT = 134;

interface BannerProps {
  images: string[];
}

const Banner: React.FC<BannerProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <View style={styles.container}>
      <View style={styles.bannerWrapper}>
        <Image
          source={{ uri: images[currentIndex] }}
          style={styles.bannerImage}
          resizeMode="stretch"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: BANNER_HEIGHT,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerWrapper: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerImage: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
  },
});

export default Banner; 