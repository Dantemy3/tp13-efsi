import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useGame } from '../context/GameContext';

export default function ScoreBoard() {
  const { score, playerName, gameMode } = useGame();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>👤 {playerName || 'Jugador'}</Text>
        <View style={styles.badge}>
          <Text style={styles.modeText}>
            {gameMode === 'capitals' ? '🏛️ Capitales' : '🚩 Banderas'}
          </Text>
        </View>
      </View>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>PUNTAJE</Text>
        <Text style={styles.score}>{score}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  row: {
    flex: 1,
    gap: 6,
  },
  label: {
    color: '#e0e0e0',
    fontSize: 15,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#0f3460',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  modeText: {
    color: '#e94560',
    fontSize: 12,
    fontWeight: '700',
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreLabel: {
    color: '#888',
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: '600',
  },
  score: {
    color: '#e94560',
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 48,
  },
});
