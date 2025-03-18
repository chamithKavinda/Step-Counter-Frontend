import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, RefreshControl, ScrollView } from 'react-native';
import { Text, ActivityIndicator, Card } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { getWeeklySteps } from '../api';

const WeeklyStatsScreen = () => {
  const [weeklyData, setWeeklyData] = useState<{ date: string; steps: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalSteps, setTotalSteps] = useState(0);
  const [avgSteps, setAvgSteps] = useState(0);
  const [bestDay, setBestDay] = useState({ date: '', steps: 0 });

  useEffect(() => {
    fetchWeeklyData();
  }, []);

  const fetchWeeklyData = async () => {
    try {
      setLoading(true);
      const response = await getWeeklySteps();
      let data = response.weeklyData;

      // Use dummy data if no real data is available
      if (!data || data.length === 0) {
        data = [
          { date: '2025-03-11', steps: 3000 },
          { date: '2025-03-12', steps: 4200 },
          { date: '2025-03-13', steps: 5000 },
          { date: '2025-03-14', steps: 6000 },
          { date: '2025-03-15', steps: 7000 },
          { date: '2025-03-16', steps: 8500 },
          { date: '2025-03-17', steps: 9000 },
        ];
      }

      setWeeklyData(data);

      // Calculate stats
      const total = data.reduce((sum, day) => sum + day.steps, 0);
      setTotalSteps(total);
      setAvgSteps(Math.round(total / data.length));

      let best = data[0];
      data.forEach(day => {
        if (day.steps > best.steps) {
          best = day;
        }
      });
      setBestDay(best);
    } catch (error) {
      console.error('Error fetching weekly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWeeklyData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const chartData = {
    labels: weeklyData.map(day => new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [
      {
        data: weeklyData.map(day => day.steps),
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#4CAF50',
    },
  };

  const screenWidth = Dimensions.get('window').width - 32;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Weekly Progress</Text>
          <Text style={styles.subtitle}>Last 7 days</Text>
        </View>

        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
        ) : (
          <>
            <Card style={styles.chartCard}>
              <Card.Content>
                <LineChart
                  data={chartData}
                  width={screenWidth}
                  height={220}
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chart}
                />
              </Card.Content>
            </Card>

            <View style={styles.statsContainer}>
              <Card style={styles.statCard}>
                <Card.Content>
                  <Text style={styles.statLabel}>Total Steps</Text>
                  <Text style={styles.statValue}>{totalSteps}</Text>
                </Card.Content>
              </Card>

              <Card style={styles.statCard}>
                <Card.Content>
                  <Text style={styles.statLabel}>Daily Average</Text>
                  <Text style={styles.statValue}>{avgSteps}</Text>
                </Card.Content>
              </Card>

              <Card style={styles.fullWidthCard}>
                <Card.Content>
                  <Text style={styles.statLabel}>Best Day</Text>
                  <View style={styles.bestDayContent}>
                    <Text style={styles.bestDayDate}>{bestDay.date ? formatDate(bestDay.date) : 'N/A'}</Text>
                    <Text style={styles.bestDaySteps}>{bestDay.steps} steps</Text>
                  </View>
                </Card.Content>
              </Card>
            </View>
          </>
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  loader: {
    marginTop: 40,
  },
  chartCard: {
    marginBottom: 24,
    elevation: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 16,
    elevation: 2,
  },
  fullWidthCard: {
    width: '100%',
    marginBottom: 16,
    elevation: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  bestDayContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  bestDayDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bestDaySteps: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});

export default WeeklyStatsScreen;
