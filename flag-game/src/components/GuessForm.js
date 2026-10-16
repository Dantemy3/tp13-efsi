import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useGame } from '../context/GameContext';

export default function GuessForm() {
  const { guess, requestHint, nextCountry, countries, feedback, hintCount } = useGame();
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  function handleChangeText(text) {
    setInput(text);
    if (text.length >= 2) {
      const filtered = countries
        .filter((c) => c.name.toLowerCase().startsWith(text.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }

  function handleSubmit() {
    if (!input.trim()) return;
    guess(input);
    setInput('');
    setSuggestions([]);
  }

  function handleSuggestionPress(name) {
    guess(name);
    setInput('');
    setSuggestions([]);
  }

  return (
    <View style={styles.container}>
      {/* Autocomplete suggestions */}
      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestion}
                onPress={() => handleSuggestionPress(item.name)}
              >
                <Text style={styles.suggestionText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {/* Input + botón enviar */}
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={input}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmit}
          placeholder="Escribe el país..."
          placeholderTextColor="#555"
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
          <Text style={styles.btnText}>✓</Text>
        </TouchableOpacity>
      </View>

      {/* Botones secundarios */}
      <View style={styles.secondaryRow}>
        <TouchableOpacity style={styles.hintBtn} onPress={requestHint}>
          <Text style={styles.hintBtnText}>💡 Pista {hintCount > 0 ? `(${hintCount})` : ''}</Text>
          <Text style={styles.hintPenalty}>-2s</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn} onPress={nextCountry}>
          <Text style={styles.skipBtnText}>⏭ Saltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 4,
  },
  suggestionsContainer: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0f3460',
    marginBottom: 6,
    maxHeight: 180,
    overflow: 'hidden',
  },
  suggestion: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  suggestionText: {
    color: '#e0e0e0',
    fontSize: 15,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0f3460',
    color: '#e0e0e0',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  btn: {
    backgroundColor: '#e94560',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  secondaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  hintBtn: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f39c12',
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  hintBtnText: {
    color: '#f39c12',
    fontWeight: '700',
    fontSize: 13,
  },
  hintPenalty: {
    color: '#e94560',
    fontSize: 11,
    fontWeight: '700',
  },
  skipBtn: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#888',
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipBtnText: {
    color: '#888',
    fontWeight: '700',
    fontSize: 13,
  },
});
