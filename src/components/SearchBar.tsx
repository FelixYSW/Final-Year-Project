import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Keyboard,
} from 'react-native';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Search, MapPin, Clock, X } from 'lucide-react-native';

interface Props {
  onPlaceSelected: (name: string, lat: number, lng: number, address: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

interface Suggestion {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  isHistory?: boolean;
}

export default function SearchBar({ onPlaceSelected, onFocus, onBlur }: Props) {
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
    if (!text) {
      // Load recent history from AsyncStorage
      try {
        const storedHistory = await AsyncStorage.getItem('@search_history');
        if (storedHistory) {
          const history = JSON.parse(storedHistory);
          setSuggestions(history);
        } else {
          setSuggestions([]);
        }
      } catch (e) {
        setSuggestions([]);
      }
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
          mainText: s.placePrediction?.structuredFormat?.mainText?.text || s.placePrediction?.text?.text || '',
          secondaryText: s.placePrediction?.structuredFormat?.secondaryText?.text || '',
        })).filter((s: Suggestion) => s.placeId);
        
        setSuggestions(results);
      } else {
        // Native uses Old Places API
        const response = await fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&components=country:my&key=${GOOGLE_MAPS_API_KEY}`);
        data = await response.json();
        
        const results: Suggestion[] = (data.predictions || []).map((s: any) => ({
          placeId: s.place_id,
          description: s.description,
          mainText: s.structured_formatting?.main_text || s.description,
          secondaryText: s.structured_formatting?.secondary_text || '',
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

  // Fetch default suggestions on mount
  useEffect(() => {
    fetchSuggestions('');
  }, []);

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
          onPlaceSelected(suggestion.mainText, lat, lng, suggestion.secondaryText);
        }
      } else {
        const response = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${suggestion.placeId}&fields=geometry&key=${GOOGLE_MAPS_API_KEY}`);
        const data = await response.json();

        if (data.result?.geometry?.location) {
          const { lat, lng } = data.result.geometry.location;
          onPlaceSelected(suggestion.mainText, lat, lng, suggestion.secondaryText);
        }
      }
      
      // Save to recent history
      try {
        const historyObj: Suggestion = {
          ...suggestion,
          isHistory: true,
        };
        const storedHistory = await AsyncStorage.getItem('@search_history');
        let history: Suggestion[] = storedHistory ? JSON.parse(storedHistory) : [];
        
        // Remove duplicate if exists
        history = history.filter((s) => s.placeId !== suggestion.placeId);
        
        // Add to front and keep top 10
        history.unshift(historyObj);
        if (history.length > 10) history = history.slice(0, 10);
        
        await AsyncStorage.setItem('@search_history', JSON.stringify(history));
      } catch (e) {
        console.error('Error saving history:', e);
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
          onFocus={() => {
            setShowDropdown(true);
            onFocus?.();
          }}
          onBlur={() => {
            onBlur?.();
          }}
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

      {suggestions.length > 0 && (
        <View style={styles.dropdown}>
          <BottomSheetFlatList
            data={suggestions}
            keyExtractor={(item) => item.placeId}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionRow}
                onPress={() => handleSelect(item)}
              >
                <View style={styles.pinContainer}>
                  {item.isHistory ? (
                    <Clock color="#000" size={22} />
                  ) : (
                    <MapPin color="#000" size={24} />
                  )}
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.mainText} numberOfLines={1}>
                    {item.mainText}
                  </Text>
                  {item.secondaryText ? (
                    <Text style={styles.secondaryText} numberOfLines={1}>
                      {item.secondaryText}
                    </Text>
                  ) : null}
                </View>
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
    flex: 1,
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
    flex: 1,
    marginTop: 12,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 16,
  },
  pinContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  mainText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '700',
    marginBottom: 4,
  },
  secondaryText: {
    fontSize: 14,
    color: '#6b7280',
  },
  separator: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginLeft: 72,
  },
});
