import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Text, Card, ActivityIndicator, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getSteps } from '../api';
import { StepData } from '../types';

const DailyStepsScreen = () => {
  const [stepData, setStepData] = useState<StepData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStepData();
  }, []);

  const fetchStepData = async () => {
    try {
      setLoading(true);
      const response = await getSteps();
      setStepData(response.stepData);
    } catch (error) {
      console.error('Error fetching step data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStepData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStepIcon = (steps: number) => {
    if (steps < 1000) return 'walk-outline';
    if (steps < 5000) return 'walk';
    if (steps < 10000) return 'fitness-outline';
    return 'fitness';
  };

  const getStepColor = (steps: number) => {
    if (steps < 1000) return '#9E9E9E';
    if (steps < 5000) return '#4CAF50';
    if (steps < 10000) return '#2196F3';
    return '#FF9800';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Your Step History</Text>
          <Text style={styles.subtitle}>Review your past step entries</Text>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
        ) : stepData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="footsteps-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyText}>No step data recorded yet</Text>
            <Button mode="outlined" onPress={onRefresh} style={styles.refreshButton}>
              Refresh
            </Button>
          </View>
        ) : (
          stepData.map((item) => (
            <Card key={item.id} style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={getStepIcon(item.steps) as any}
                    size={28}
                    color={getStepColor(item.steps)}
                  />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.steps}>{item.steps} steps</Text>
                  <Text style={styles.date}>{formatDate(item.date)}</Text>
                </View>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  refreshButton: {
    marginTop: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    marginLeft: 16,
    flex: 1,
  },
  steps: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default DailyStepsScreen;