import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { getDailySteps } from '../api';
import Svg, { Circle } from 'react-native-svg';

const HomeScreen = () => {
  const { user } = useAuth();
  const [dailyTotal, setDailyTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const stepGoal = 10000;

  useEffect(() => {
    fetchDailySteps();
  }, []);

  const fetchDailySteps = async () => {
    try {
      setLoading(true);
      const response = await getDailySteps();
      setDailyTotal(response.totalSteps);
    } catch (error) {
      console.error('Error fetching daily steps:', error);
    } finally {
      setLoading(false);
    }
  };

  const progress = Math.min(dailyTotal / stepGoal, 1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, {user?.name || 'User'}!</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Step Counter Circle */}
        <View style={styles.circleContainer}>
          <Svg height="200" width="200" viewBox="0 0 200 200">
            <Circle cx="100" cy="100" r="90" stroke="#ddd" strokeWidth="10" fill="none" />
            <Circle
              cx="100"
              cy="100"
              r="90"
              stroke="#4CAF50"
              strokeWidth="10"
              strokeDasharray={`${progress * 565}, 565`}
              fill="none"
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
            />
          </Svg>
          <Text style={styles.stepCount}>{loading ? <ActivityIndicator /> : dailyTotal}</Text>
          <Text style={styles.goal}>Goal: {stepGoal} steps</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{Math.floor(dailyTotal * 0.04)} kcal</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{(dailyTotal * 0.0008).toFixed(2)} km</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{Math.floor(dailyTotal / 100)} mins</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  circleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepCount: {
    position: 'absolute',
    top: '40%',
    fontSize: 36,
    fontWeight: 'bold',
    color: '#333',
  },
  goal: {
    position: 'absolute',
    top: '60%',
    fontSize: 16,
    color: '#666',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  statBox: {
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;
