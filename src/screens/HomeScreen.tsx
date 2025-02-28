import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { saveSteps, getDailySteps } from '../api';
import StepCounter from '../components/StepCounter';

const HomeScreen = () => {
  const { user } = useAuth();
  const [steps, setSteps] = useState(0);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

  const handleSaveSteps = async () => {
    if (steps <= 0) {
      Alert.alert('Error', 'Please enter a valid step count');
      return;
    }

    try {
      setSaving(true);
      await saveSteps(steps);
      Alert.alert('Success', 'Steps saved successfully');
      setSteps(0);
      fetchDailySteps();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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

      <View style={styles.statsContainer}>
        <Text style={styles.statsLabel}>Today's Steps</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <Text style={styles.statsValue}>{dailyTotal}</Text>
        )}
      </View>

      <View style={styles.counterContainer}>
        <Text style={styles.counterTitle}>Add Steps</Text>
        <StepCounter value={steps} onChange={setSteps} />
        <Button
          mode="contained"
          onPress={handleSaveSteps}
          loading={saving}
          disabled={saving || steps <= 0}
          style={styles.button}
        >
          Save Steps
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: 18,
    color: '#4CAF50',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  counterContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 24,
  },
  counterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
  },
});

export default HomeScreen;