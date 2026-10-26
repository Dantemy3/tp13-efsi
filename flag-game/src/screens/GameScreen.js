import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useGame } from '../context/GameContext';
import Flag from '../components/Flag';
import GuessForm from '../components/GuessForm';
import CapitalsForm from '../components/CapitalsForm';
import ScoreBoard from '../components/ScoreBoard';
import Timer from '../components/Timer';
import Leaderboard from '../components/Leaderboard';

export default function GameScreen() {
  const { gameMode, endGame, playerName } = useGame();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Text style={styles.appTitle}>🚩 Fun with Flags</Text>
        <TouchableOpacity style={styles.endBtn} onPress={endGame} activeOpacity={0.8}>
          <Text style={styles.endBtnText}>Fin</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScoreBoard />
        <Timer />
        <Flag />

        {gameMode === 'flags' ? <GuessForm /> : <CapitalsForm />}

        <Leaderboard />

        {/* Bottom padding */}
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#16213e',
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  appTitle: {
    color: '#e0e0e0',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  endBtn: {
    backgroundColor: 'rgba(233,69,96,0.15)',
    borderWidth: 1,
    borderColor: '#e94560',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  endBtnText: {
    color: '#e94560',
    fontWeight: '800',
    fontSize: 13,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 8,
    gap: 0,
  },
});
