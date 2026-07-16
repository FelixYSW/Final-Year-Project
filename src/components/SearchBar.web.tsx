import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Search, X, MapPin } from 'lucide-react-native';
import { SearchBarStyles as styles } from '@/constants/theme';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';

interface Suggestion {
  placeId: string;
  description: string;
}

interface Props {
  onPlaceSelected: (placeName: string, lat: number, lng: number) => void;
}

export default function SearchBar({ onPlaceSelected }: Props) {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        'https://places.googleapis.com/v1/places:autocomplete',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
          },
          body: JSON.stringify({
            input,
            includedRegionCodes: ['my'], // Restrict to Malaysia
          }),
        }
      );
      const data = await response.json();
      const results: Suggestion[] = (data.suggestions || []).map((s: any) => ({
        placeId: s.placePrediction?.placeId || '',
        description: s.placePrediction?.text?.text || '',
      })).filter((s: Suggestion) => s.placeId);
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChangeText = (text: string) => {
    setValue(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(text), 300);
  };

  const handleSelectSuggestion = async (suggestion: Suggestion) => {
    setValue(suggestion.description);
    setSuggestions([]);
    try {
      // Fetch place details to get lat/lng
      const response = await fetch(
        `https://places.googleapis.com/v1/${suggestion.placeId}?fields=location&key=${GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      const lat = data.location?.latitude;
      const lng = data.location?.longitude;
      if (lat && lng) {
        onPlaceSelected(suggestion.description, lat, lng);
      }
    } catch {
      // fallback coords if fetch fails
      onPlaceSelected(suggestion.description, 3.139, 101.6869);
    }
  };

  const handleClear = () => {
    setValue('');
    setSuggestions([]);
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
          value={value}
          onChangeText={handleChangeText}
          returnKeyType="search"
          autoCorrect={false}
        />
        {loading && (
          <ActivityIndicator size="small" color="#208AEF" style={styles.loader} />
        )}
        {value.length > 0 && !loading && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <X color="#999" size={18} />
          </TouchableOpacity>
        )}
      </View>

      {suggestions.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.placeId}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionRow}
                onPress={() => handleSelectSuggestion(item)}
              >
                <MapPin color="#208AEF" size={16} style={styles.pinIcon} />
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

