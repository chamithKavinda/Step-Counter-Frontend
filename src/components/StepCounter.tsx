import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

interface StepCounterProps {
  value: number;
  onChange: (value: number) => void;
}

const StepCounter: React.FC<StepCounterProps> = ({ value, onChange }) => {
  const increment = () => {
    onChange(value + 500);
  };

  const decrement = () => {
    onChange(Math.max(0, value - 500));
  };

  return (
    <View style={styles.container}>
      <IconButton
        icon="minus"
        size={28}
        onPress={decrement}
        disabled={value <= 0}
        style={styles.button}
      />
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value.toLocaleString()}</Text>
        <Text style={styles.label}>steps</Text>
      </View>
      <IconButton
        icon="plus"
        size={28}
        onPress={increment}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
  },
  button: {
    backgroundColor: '#E8F5E9',
  },
  valueContainer: {
    alignItems: 'center',
  },
  value: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
});

export default StepCounter;