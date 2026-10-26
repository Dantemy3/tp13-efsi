import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useGame } from '../context/GameContext';

export default function HomeScreen() {
  const { startGame, loading, error, leaderboard, capitalsLeaderboard } = useGame();
  const [name, setName] = useState('');
  const [selectedMode, setSelectedMode] = useState('flags');

  const canStart = name.trim().length > 0 && !loading;

  const medals = ['🥇', '🥈', '🥉'];
  const board = selectedMode === 'capitals' ? capitalsLeaderboard : leaderboard;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🚩</Text>
          <Text style={styles.title}>Fun with Flags</Text>
          <Text style={styles.subtitle}>¿Podés adivinar todas las banderas?</Text>
        </View>

        {/* Name input */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Tu nombre</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ingresá tu nombre..."
            placeholderTextColor="#555"
            autoCorrect={false}
            autoCapitalize="words"
            maxLength={20}
            returnKeyType="done"
          />
        </View>

        {/* Mode selector */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Modo de juego</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeBtn, selectedMode === 'flags' && styles.modeBtnActive]}
              onPress={() => setSelectedMode('flags')}
              activeOpacity={0.8}
            >
              <Text style={styles.modeEmoji}>🚩</Text>
              <Text
                style={[
                  styles.modeBtnText,
                  selectedMode === 'flags' && styles.modeBtnTextActive,
                ]}
              >
                Banderas
              </Text>
              <Text style={styles.modeDesc}>Adiviná el país{'\n'}por su bandera</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeBtn, selectedMode === 'capitals' && styles.modeBtnActive]}
              onPress={() => setSelectedMode('capitals')}
              activeOpacity={0.8}
            >
              <Text style={styles.modeEmoji}>🏛️</Text>
              <Text
                style={[
                  styles.modeBtnText,
                  selectedMode === 'capitals' && styles.modeBtnTextActive,
                ]}
              >
                Capitales
              </Text>
              <Text style={styles.modeDesc}>Elegí la capital{'\n'}del país correcto</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rules summary */}
        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>📋 Reglas</Text>
          <Text style={styles.ruleItem}>✅ Acierto → +10 pts + segundos restantes</Text>
          <Text style={styles.ruleItem}>❌ Fallo → -1 pt</Text>
          <Text style={styles.ruleItem}>⏱ 15 segundos por bandera</Text>
          {selectedMode === 'flags' ? (
            <Text style={styles.ruleItem}>💡 Pista de letra → -2s del timer</Text>
          ) : (
            <Text style={styles.ruleItem}>💡 Pista: una opción se elimina cada 5s</Text>
          )}
        </View>

        {/* Leaderboard preview */}
        {board.length > 0 && (
          <View style={styles.boardCard}>
            <Text style={styles.boardTitle}>
              🏆 Top {selectedMode === 'capitals' ? 'Capitales' : 'Banderas'}
            </Text>
            {board.slice(0, 5).map((entry, i) => (
              <View key={entry.name + i} style={styles.boardRow}>
                <Text style={styles.boardMedal}>{medals[i] || `${i + 1}.`}</Text>
                <Text style={styles.boardName} numberOfLines={1}>
                  {entry.name}
                </Text>
                <Text style={styles.boardScore}>{entry.score} pts</Text>
              </View>
            ))}
          </View>
        )}

        {/* Loading / Error */}
        {loading && (
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>⏳ Cargando países...</Text>
          </View>
        )}
        {error && (
          <View style={[styles.statusBox, styles.errorBox]}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* Start button */}
        <TouchableOpacity
          style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
          onPress={() => canStart && startGame(name.trim(), selectedMode)}
          activeOpacity={0.85}
          disabled={!canStart}
        >
          <Text style={styles.startBtnText}>
            {loading ? 'Cargando...' : '¡Jugar!'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#1a1a2e' },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    gap: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: { fontSize: 52, marginBottom: 8 },
  title: {
    color: '#e0e0e0',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
    gap: 10,
  },
  cardLabel: {
    color: '#888',
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#1a1a2e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0f3460',
    color: '#e0e0e0',
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeBtn: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0f3460',
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  modeBtnActive: {
    borderColor: '#e94560',
    backgroundColor: 'rgba(233,69,96,0.08)',
  },
  modeEmoji: { fontSize: 28 },
  modeBtnText: {
    color: '#888',
    fontWeight: '800',
    fontSize: 14,
  },
  modeBtnTextActive: { color: '#e94560' },
  modeDesc: {
    color: '#555',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  rulesCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#0f3460',
    gap: 6,
  },
  rulesTitle: {
    color: '#e0e0e0',
    fontWeight: '800',
    fontSize: 14,
    marginBottom: 4,
  },
  ruleItem: {
    color: '#888',
    fontSize: 13,
  },
  boardCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  boardTitle: {
    color: '#e0e0e0',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    padding: 12,
    backgroundColor: '#0f3460',
    textAlign: 'center',
  },
  boardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
    gap: 10,
  },
  boardMedal: { fontSize: 18, width: 30, textAlign: 'center' },
  boardName: { flex: 1, color: '#e0e0e0', fontSize: 14, fontWeight: '600' },
  boardScore: { color: '#e94560', fontWeight: '800', fontSize: 14 },
  statusBox: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  statusText: { color: '#888', fontSize: 14 },
  errorBox: { borderColor: '#e94560' },
  errorText: { color: '#e94560', fontSize: 13, textAlign: 'center' },
  startBtn: {
    backgroundColor: '#e94560',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    marginTop: 4,
  },
  startBtnDisabled: {
    backgroundColor: '#3a3a4e',
    shadowOpacity: 0,
    elevation: 0,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
