import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
  FlatList,
  Keyboard,
} from 'react-native';
import { Search, MapPin, X } from 'lucide-react-native';

interface Props {
  onPlaceSelected: (name: string, lat: number, lng: number) => void;
}

interface Suggestion {
  placeId: string;
  description: string;
}

export default function SearchBar({ onPlaceSelected }: Props) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Use a ref to debounce
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const getApiBaseUrl = () => {
    // In development Expo Router, API routes are available at the dev server root
    // For Native apps, we must provide the absolute URL of the Metro server
    if (Platform.OS === 'web') return '';
    
    // Attempt to get the manifest host if available (only works in Expo Go usually)
    // As a fallback for physical devices in dev, you might need your local IP, e.g., 'http://192.168.x.x:8081'
    // But since API routes run on the Metro server, we can use process.env.EXPO_PUBLIC_API_URL or similar.
    // For simplicity, we'll try to use the proxy directly if we are on Native, wait, if we are on Native, we don't NEED the proxy!
    return 'NATIVE'; 
  };

  const fetchSuggestions = async (text: string) => {
    if (!text || text.length < 2) {
      setSuggestions([]);
      return;
    }
    
    setLoading(true);
    
    try {
      let data;
      const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
      
      if (Platform.OS === 'web') {
        // Web uses New Places API to avoid CORS issues
        const response = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
          },
          body: JSON.stringify({
            input: text,
            includedRegionCodes: ['my'], // Restrict to Malaysia
          }),
        });
        
        const json = await response.json();
        
        if (json.error) {
          console.error('Places API Error:', json.error.message);
          return;
        }
        
        const results: Suggestion[] = (json.suggestions || []).map((s: any) => ({
          placeId: s.placePrediction?.placeId || '',
          description: s.placePrediction?.text?.text || '',
        })).filter((s: Suggestion) => s.placeId);
        
        setSuggestions(results);
      } else {
        // Native uses Old Places API
        const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&components=country:my&key=${GOOGLE_MAPS_API_KEY}`);
        data = await response.json();
        
        const results: Suggestion[] = (data.predictions || []).map((s: any) => ({
          placeId: s.place_id,
          description: s.description,
        }));
        setSuggestions(results);
      }
    } catch (error) {
      console.error('Error fetching places:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    setShowDropdown(true);
    
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(text);
    }, 300);
  };

  const handleSelect = async (suggestion: Suggestion) => {
    Keyboard.dismiss();
    setShowDropdown(false);
    setInput(suggestion.description);
    setLoading(true);

    try {
      const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
      
      if (Platform.OS === 'web') {
        const response = await fetch(`https://places.googleapis.com/v1/places/${suggestion.placeId}?fields=location`, {
          headers: {
            'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
            'X-Goog-FieldMask': 'location',
          },
        });
        const json = await response.json();
        
        if (json.location) {
          const lat = json.location.latitude;
          const lng = json.location.longitude;
          onPlaceSelected(suggestion.description, lat, lng);
        }
      } else {
        const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${suggestion.placeId}&fields=geometry&key=${GOOGLE_MAPS_API_KEY}`);
        const data = await response.json();

        if (data.result?.geometry?.location) {
          const { lat, lng } = data.result.geometry.location;
          onPlaceSelected(suggestion.description, lat, lng);
        }
      }
    } catch (error) {
      console.error('Error fetching details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Search color="#208AEF" size={22} />
        </View>
        <TextInput
          style={styles.textInput}
          placeholder="Where to?"
          placeholderTextColor="#999"
          value={input}
          onChangeText={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          autoCorrect={false}
        />
        {loading && <ActivityIndicator style={styles.loader} size="small" color="#208AEF" />}
        {input.length > 0 && (
          <TouchableOpacity 
            onPress={() => {
              setInput('');
              setSuggestions([]);
            }} 
            style={styles.clearButton}
          >
            <X color="#999" size={18} />
          </TouchableOpacity>
        )}
      </View>

      {showDropdown && suggestions.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.placeId}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionRow}
                onPress={() => handleSelect(item)}
              >
                <MapPin color="#666" size={18} style={styles.pinIcon} />
                <Text style={styles.suggestionText} numberOfLines={2}>
                  {item.description}
                </Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    zIndex: 100,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingBottom: 14,
    paddingLeft: 14,
    paddingRight: 4,
  },
  textInput: {
    flex: 1,
    height: 50,
    fontSize: 17,
    color: '#111',
    fontWeight: '500',
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
  },
  clearButton: {
    paddingTop: 14,
    paddingBottom: 14,
    paddingRight: 14,
    paddingLeft: 4,
  },
  loader: {
    marginRight: 10,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
    maxHeight: 260,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    gap: 10,
  },
  pinIcon: {
    marginRight: 4,
  },
  suggestionText: {
    fontSize: 14,
    color: '#111',
    flex: 1,
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 14,
  },
});
