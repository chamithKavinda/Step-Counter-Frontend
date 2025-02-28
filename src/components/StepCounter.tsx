import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, IconButton, Text } from 'react-native-paper';

interface StepCounterProps {
  value: number;
  onChange: (value: number) => void;
}

const StepCounter: React.FC<StepCounterProps> = ({ value, onChange }) => {
  const increment = () => {
    onChange(value + 100);
  };

  const decrement = () => {
    if (value >= 100) {
      onChange(value - 100);
    }
  };

  const handleTextChange = (text: string) => {
    const numValue = parseInt(text);
    if (!isNaN(numValue) && numValue >= 0) {
      onChange(numValue);
    } else if (text === '') {
      onChange(0);
    }
  };

  return (
    <View style={styles.container}>
      <IconButton
        icon="minus"
        size={24}
        onPress={decrement}
        style={styles.button}
        disabled={value <= 0}
      />
      <View style={styles.inputContainer}>
        <TextInput
          value={value.toString()}
          onChangeText={handleTextChange}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
        />
        <Text style={styles.label}>steps</Text>
      </View>
      <IconButton
        icon="plus"
        size={24}
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
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#E8F5E9',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    textAlign: 'center',
  },
  label: {
    marginLeft: 8,
    color: '#666',
  },
});

export default StepCounter;
