import React, { useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Search, X } from 'lucide-react-native';

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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    paddingTop: 14,
    paddingLeft: 14,
    paddingRight: 4,
  },
  textInputContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  textInput: {
    height: 50,
    fontSize: 17,
    color: '#111',
    backgroundColor: 'transparent',
    fontWeight: '500',
  },
  listView: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  row: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  description: {
    fontSize: 15,
    color: '#111',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  clearButton: {
    paddingTop: 14,
    paddingRight: 14,
    paddingLeft: 4,
  },
});
