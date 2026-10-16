import React, { useEffect, useRef } from 'react';
import { View, Image, Text, StyleSheet, Animated } from 'react-native';
import { useGame } from '../context/GameContext';

export default function Flag() {
  const { currentCountry, feedback, revealedLetters, gameMode } = useGame();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentCountry) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [currentCountry]);

  useEffect(() => {
    if (feedback === 'wrong') {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  }, [feedback]);

  if (!currentCountry) return null;

  // Construir la vista de pistas del nombre
  const name = currentCountry.name;
  const hintDisplay = name.split('').map((char, i) => {
    if (char === ' ') return <Text key={i} style={styles.hintChar}> </Text>;
    if (revealedLetters.includes(i))
      return (
        <Text key={i} style={[styles.hintChar, styles.hintRevealed]}>
          {char}
        </Text>
      );
    return (
      <Text key={i} style={styles.hintChar}>
        _
      </Text>
    );
  });

  const borderColor =
    feedback === 'correct' ? '#2ecc71' : feedback === 'wrong' ? '#e94560' : '#0f3460';

  return (
    <View style={styles.container}>
      <Text style={styles.question}>
        {gameMode === 'capitals' ? '¿Cuál es la capital?' : '¿De qué país es esta bandera?'}
      </Text>
      <Animated.View
        style={[
          styles.flagCard,
          { borderColor, opacity: fadeAnim, transform: [{ translateX: shakeAnim }] },
        ]}
      >
        <Image
          source={{ uri: currentCountry.flag }}
          style={styles.flagImage}
          resizeMode="contain"
        />
        {feedback === 'correct' && (
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>✓ ¡Correcto!</Text>
          </View>
        )}
        {feedback === 'wrong' && (
          <View style={[styles.overlay, styles.overlayWrong]}>
            <Text style={styles.overlayText}>✗ Incorrecto</Text>
          </View>
        )}
        {feedback === 'timeout' && (
          <View style={[styles.overlay, styles.overlayTimeout]}>
            <Text style={styles.overlayText}>⏱ ¡Tiempo!</Text>
            <Text style={styles.overlaySubtext}>{currentCountry.name}</Text>
          </View>
        )}
      </Animated.View>

      {/* Vista de pistas solo en modo banderas */}
      {gameMode === 'flags' && (
        <View style={styles.hintRow}>{hintDisplay}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  question: {
    color: '#e0e0e0',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  flagCard: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: '#0f3460',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  flagImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(46,204,113,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayWrong: {
    backgroundColor: 'rgba(233,69,96,0.85)',
  },
  overlayTimeout: {
    backgroundColor: 'rgba(243,156,18,0.9)',
  },
  overlayText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
  },
  overlaySubtext: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  hintRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 12,
    gap: 4,
  },
  hintChar: {
    color: '#888',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 4,
    minWidth: 14,
    textAlign: 'center',
  },
  hintRevealed: {
    color: '#f39c12',
  },
});
