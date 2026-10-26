import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GameProvider, useGame } from './src/context/GameContext';
import HomeScreen from './src/screens/HomeScreen';
import GameScreen from './src/screens/GameScreen';

/**
 * AppNavigator decides which screen to show based on gameStarted.
 * No navigation library needed — the state in Context drives it.
 */
function AppNavigator() {
  const { gameStarted } = useGame();
  return gameStarted ? <GameScreen /> : <HomeScreen />;
}

export default function App() {
  return (
    <GameProvider>
      <StatusBar style="light" backgroundColor="#1a1a2e" />
      <AppNavigator />
    </GameProvider>
  );
}
