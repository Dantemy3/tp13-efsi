import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useGame } from '../context/GameContext';

const medals = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const { leaderboard, capitalsLeaderboard, gameMode } = useGame();

  const board = gameMode === 'capitals' ? capitalsLeaderboard : leaderboard;

  if (board.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏆 Top Jugadores</Text>
      <ScrollView style={styles.list} nestedScrollEnabled>
        {board.slice(0, 10).map((entry, index) => (
          <View key={entry.name + index} style={[styles.row, index === 0 && styles.firstRow]}>
            <Text style={styles.medal}>{medals[index] || `${index + 1}.`}</Text>
            <Text style={styles.name} numberOfLines={1}>
              {entry.name}
            </Text>
            <Text style={styles.score}>{entry.score} pts</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#16213e',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
    overflow: 'hidden',
  },
  title: {
    color: '#e0e0e0',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    padding: 12,
    backgroundColor: '#0f3460',
    textAlign: 'center',
  },
  list: {
    maxHeight: 200,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
    gap: 10,
  },
  firstRow: {
    backgroundColor: 'rgba(233,69,96,0.08)',
  },
  medal: {
    fontSize: 18,
    width: 30,
    textAlign: 'center',
  },
  name: {
    flex: 1,
    color: '#e0e0e0',
    fontSize: 14,
    fontWeight: '600',
  },
  score: {
    color: '#e94560',
    fontWeight: '800',
    fontSize: 14,
  },
});
