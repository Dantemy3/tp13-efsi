import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useGame } from '../context/GameContext';

export default function CapitalsForm() {
  const { capitalOptions, eliminatedOptions, guessCapital, nextCountry, feedback } = useGame();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Seleccioná la capital:</Text>
      {capitalOptions.map((option, index) => {
        const isEliminated = eliminatedOptions.includes(index);
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.option,
              isEliminated && styles.optionEliminated,
              feedback === 'correct' && option.isCorrect && styles.optionCorrect,
              feedback === 'wrong' && option.isCorrect && styles.optionCorrect,
            ]}
            onPress={() => !isEliminated && guessCapital(option)}
            disabled={isEliminated || !!feedback}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.optionText,
                isEliminated && styles.optionTextEliminated,
              ]}
            >
              {option.capital}
            </Text>
            {isEliminated && <Text style={styles.elimTag}>✗ eliminada</Text>}
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.skipBtn} onPress={nextCountry}>
        <Text style={styles.skipBtnText}>⏭ Saltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 4,
  },
  title: {
    color: '#888',
    fontSize: 13,
    letterSpacing: 1,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  option: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0f3460',
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionEliminated: {
    opacity: 0.35,
    borderColor: '#333',
  },
  optionCorrect: {
    borderColor: '#2ecc71',
    backgroundColor: 'rgba(46,204,113,0.15)',
  },
  optionText: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: '600',
  },
  optionTextEliminated: {
    color: '#555',
    textDecorationLine: 'line-through',
  },
  elimTag: {
    color: '#e94560',
    fontSize: 11,
    fontWeight: '700',
  },
  skipBtn: {
    marginTop: 4,
    backgroundColor: '#16213e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#888',
    paddingVertical: 10,
    alignItems: 'center',
  },
  skipBtnText: {
    color: '#888',
    fontWeight: '700',
    fontSize: 13,
  },
});
