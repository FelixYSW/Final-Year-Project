import React, { useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Search, X, MapPin } from 'lucide-react-native';
import { SearchBarStyles as styles } from '@/constants/theme';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

interface Props {
  onPlaceSelected: (placeName: string, lat: number, lng: number) => void;
}

export default function SearchBar({ onPlaceSelected }: Props) {
  const ref = useRef<any>(null);

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Search color="#208AEF" size={22} />
      </View>
      <GooglePlacesAutocomplete
        ref={ref}
        placeholder="Where to?"
        fetchDetails={true}
        onPress={(data, details = null) => {
          if (details) {
            const { lat, lng } = details.geometry.location;
            const name = data.description;
            onPlaceSelected(name, lat, lng);
          }
        }}
        query={{
          key: GOOGLE_MAPS_API_KEY,
          language: 'en',
          types: 'establishment|geocode',
          components: 'country:my', // Restrict to Malaysia
        }}
        styles={{
          textInputContainer: styles.textInputContainer,
          textInput: styles.textInput,
          listView: styles.listView,
          row: styles.row,
          description: styles.description,
          separator: styles.separator,
        }}
        enablePoweredByContainer={false}
        debounce={300}
        minLength={2}
        renderRightButton={() => (
          <TouchableOpacity
            onPress={() => ref.current?.clear()}
            style={styles.clearButton}
          >
            <X color="#999" size={18} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

