import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useGame } from '../context/GameContext';

export default function Timer() {
  const { timeLeft, timerActive } = useGame();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (timeLeft <= 5 && timerActive) {
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [timeLeft]);

  const isUrgent = timeLeft <= 5;
  const percentage = timeLeft / 15;

  const barColor = isUrgent ? '#e94560' : timeLeft <= 8 ? '#f39c12' : '#2ecc71';

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>⏱ TIEMPO</Text>
        <Animated.Text
          style={[styles.time, { color: barColor, transform: [{ scale: pulseAnim }] }]}
        >
          {timeLeft}s
        </Animated.Text>
      </View>
      <View style={styles.barBg}>
        <View
          style={[
            styles.bar,
            {
              width: `${percentage * 100}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    color: '#888',
    fontSize: 12,
    letterSpacing: 2,
    fontWeight: '600',
  },
  time: {
    fontSize: 20,
    fontWeight: '900',
  },
  barBg: {
    height: 6,
    backgroundColor: '#0f3460',
    borderRadius: 3,
    overflow: 'hidden',
  },
  bar: {
    height: 6,
    borderRadius: 3,
  },
});
