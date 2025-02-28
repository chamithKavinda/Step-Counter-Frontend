import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, AppState, AppStateStatus } from 'react-native';
import { Text, Button, ActivityIndicator, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { saveSteps, getDailySteps } from '../api';
import StepCounter from '../components/StepCounter';
import { Pedometer } from 'expo-sensors';
import * as Permissions from 'expo-permissions';

const HomeScreen = () => {
  const { user } = useAuth();
  const [steps, setSteps] = useState(0);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAutoCounting, setIsAutoCounting] = useState(false);
  const [autoSteps, setAutoSteps] = useState(0);
  const [pedometerAvailable, setPedometerAvailable] = useState(false);

  const appState = useRef(AppState.currentState);
  const pedometerSubscription = useRef<Pedometer.Subscription | null>(null);
  const lastSavedSteps = useRef(0);
  const autoSaveInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchDailySteps();
    checkPedometerAvailability();
    const subscription = AppState.addEventListener('change', handleAppStateChange);
  
    return () => {
      subscription.remove();
      stopAutoCounting();
      if (autoSaveInterval.current) {
        clearInterval(autoSaveInterval.current);
      }
    };
  }, []);


const checkPedometerAvailability = async () => {
  try {
    const { status } = await Permissions.askAsync(Permissions.MOTION);
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Please enable Motion permissions in settings.');
      setPedometerAvailable(false);
      return;
    }
    const available = await Pedometer.isAvailableAsync();
    setPedometerAvailable(available);
  } catch (error) {
    console.error('Pedometer availability check failed:', error);
    setPedometerAvailable(false);
  }
};


  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active' &&
      isAutoCounting
    ) {
      startAutoCounting();
    }

    if (
      appState.current === 'active' &&
      nextAppState.match(/inactive|background/) &&
      isAutoCounting
    ) {
      if (autoSteps > 0) {
        handleAutoSaveSteps();
      }
      stopAutoCounting();
    }

    appState.current = nextAppState;
  };

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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save steps';
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleAutoSaveSteps = async () => {
    if (autoSteps - lastSavedSteps.current <= 0) return;

    try {
      const stepsToSave = autoSteps - lastSavedSteps.current;
      await saveSteps(stepsToSave);
      lastSavedSteps.current = autoSteps;
      fetchDailySteps();
      console.log(`Automatically saved ${stepsToSave} steps`);
    } catch (error) {
      console.error('Error auto-saving steps:', error);
    }
  };

  const startAutoCounting = async () => {
    if (!pedometerAvailable) {
      Alert.alert(
        'Pedometer Not Available',
        'Your device does not support step counting.'
      );
      return;
    }

    try {
      setAutoSteps(0);
      lastSavedSteps.current = 0;

      pedometerSubscription.current = Pedometer.watchStepCount(result => {
        setAutoSteps(prevSteps => prevSteps + result.steps);
      });

      autoSaveInterval.current = setInterval(handleAutoSaveSteps, 5 * 60 * 1000);

      setIsAutoCounting(true);
    } catch (error) {
      console.error('Error starting step counter:', error);
      Alert.alert('Error', 'Failed to start step counting');
      setIsAutoCounting(false);
    }
  };

  const stopAutoCounting = () => {
    if (pedometerSubscription.current) {
      pedometerSubscription.current.remove();
      pedometerSubscription.current = null;
    }

    if (autoSaveInterval.current) {
      clearInterval(autoSaveInterval.current);
      autoSaveInterval.current = null;
    }

    if (autoSteps - lastSavedSteps.current > 0) {
      handleAutoSaveSteps();
    }

    setIsAutoCounting(false);
  };

  const toggleAutoCounting = () => {
    if (isAutoCounting) {
      stopAutoCounting();
    } else {
      startAutoCounting();
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

      <View style={styles.autoCounterContainer}>
        <View style={styles.autoCounterHeader}>
          <Text style={styles.counterTitle}>Auto Step Counter</Text>
          <Switch
            value={isAutoCounting}
            onValueChange={toggleAutoCounting}
            color="#4CAF50"
            disabled={!pedometerAvailable}
          />
        </View>

        {isAutoCounting && (
          <View style={styles.currentStepsContainer}>
            <Text style={styles.currentStepsLabel}>Current Session</Text>
            <Text style={styles.currentStepsValue}>{autoSteps}</Text>
          </View>
        )}

        {!pedometerAvailable && (
          <Text style={styles.errorText}>
            Pedometer is not available on this device
          </Text>
        )}
      </View>

      <View style={styles.counterContainer}>
        <Text style={styles.counterTitle}>Add Steps Manually</Text>
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
  autoCounterContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  autoCounterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentStepsContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  currentStepsLabel: {
    fontSize: 16,
    color: '#1976D2',
  },
  currentStepsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0D47A1',
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
  errorText: {
    color: '#F44336',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default HomeScreen;
