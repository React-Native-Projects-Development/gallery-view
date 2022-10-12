import React, {useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import API_KEY from './config';

const API_URL =
  'https://api.pexels.com/v1/search?query=nature&orientation=portrait&size=small&per_page=20';

const IMAGE_SIZE = 80;
const SPACING = 10;

const {width, height} = Dimensions.get('screen');

const fetchImagesFromPexels = async () => {
  const data = await fetch(API_URL, {
    headers: {
      Authorization: API_KEY,
    },
  });

  const {photos} = await data.json();

  return photos;
};

const App = () => {
  const [images, setImages] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      const imgs = await fetchImagesFromPexels();

      setImages(imgs);
    };

    fetchImages();
  }, []);

  const topRef = useRef();
  const thumbRef = useRef();
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToActiveIndex = index => {
    setActiveIndex(index);
    topRef?.current?.scrollToOffset({
      offset: index * width,
      animated: true,
    });

    if (index * (IMAGE_SIZE + SPACING) - IMAGE_SIZE / 2 > width / 2) {
      thumbRef?.current?.scrollToOffset({
        offset: index * (IMAGE_SIZE + SPACING) - width / 2 + IMAGE_SIZE / 2,
        animated: true,
      });
    } else {
      thumbRef?.current?.scrollToOffset({
        offset: 0,
        animated: true,
      });
    }
  };

  if (!images) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={{flex: 1, backgroundColor: '#000'}}>
      <View style={{width, height}}>
        <FlatList
          ref={topRef}
          data={images}
          keyExtractor={item => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={ev => {
            scrollToActiveIndex(
              Math.floor(ev.nativeEvent.contentOffset.x / width),
            );
          }}
          renderItem={({item}) => (
            <View style={{width, height}}>
              <Image
                source={{uri: item.src.portrait}}
                style={[StyleSheet.absoluteFillObject]}
              />
            </View>
          )}
        />
        <FlatList
          ref={thumbRef}
          data={images}
          keyExtractor={item => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{position: 'absolute', bottom: IMAGE_SIZE}}
          contentContainerStyle={{
            paddingHorizontal: SPACING,
          }}
          renderItem={({item, index}) => (
            <TouchableOpacity
              activeOpacity={0.2}
              onPress={() => scrollToActiveIndex(index)}>
              <Image
                source={{uri: item.src.portrait}}
                style={{
                  width: IMAGE_SIZE,
                  height: IMAGE_SIZE,
                  borderRadius: 12,
                  marginRight: SPACING,
                  borderWidth: 2,
                  borderColor: activeIndex === index ? '#fff' : 'transparent',
                }}
              />
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
};

export default App;
