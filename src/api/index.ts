import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
type User = {
  id: string;
  name: string;
  email: string;
};

type AuthResponse = {
  token: string;
  user: User;
};

type StepData = {
  id: string;
  userId: string; 
  date: string;
  steps: number;
};


let mockUsers = [
  {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  }
];

let mockStepData: StepData[] = [
  { id: '1', userId: '1', date: new Date().toISOString(), steps: 5000 }
];

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user = mockUsers.find(
    user => user.email === email && user.password === password
  );
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  const token = `mock-token-${Date.now()}`;
  
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  };
};

export const register = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if email is already registered
  const existingUser = mockUsers.find(user => user.email === email);
  if (existingUser) {
    throw new Error('Email already registered');
  }
  
  // Create new user
  const newUser = {
    id: `${mockUsers.length + 1}`,
    name,
    email,
    password
  };
  
  mockUsers.push(newUser);
  
  // Generate a mock token
  const token = `mock-token-${Date.now()}`;
  
  return {
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email
    }
  };
};

// Step tracking functions
export const getSteps = async (): Promise<{ stepData: StepData[] }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Sort by date, newest first
  const sortedData = [...mockStepData].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  return { stepData: sortedData };
};

export const saveSteps = async (steps: number): Promise<void> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newStepEntry = {
    id: `${mockStepData.length + 1}`,
    userId: '1', // Assuming userId is '1' for now
    date: new Date().toISOString(),
    steps
  };
  
  mockStepData.push(newStepEntry);
  
  // In a real app, you'd save this to your backend
  // For now, also store in AsyncStorage for persistence
  try {
    const existingDataString = await AsyncStorage.getItem('stepData');
    const existingData = existingDataString ? JSON.parse(existingDataString) : [];
    existingData.push(newStepEntry);
    await AsyncStorage.setItem('stepData', JSON.stringify(existingData));
  } catch (error) {
    console.error('Error saving step data locally:', error);
  }
};

export const getDailySteps = async (): Promise<{ totalSteps: number }> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get today's date (just the date part)
  const today = new Date().toISOString().split('T')[0];
  
  // Filter for entries from today
  const todayEntries = mockStepData.filter(entry => 
    entry.date.startsWith(today)
  );
  
  // Sum up today's steps
  const totalSteps = todayEntries.reduce((sum, entry) => sum + entry.steps, 0);
  
  return { totalSteps };
};

export const getWeeklySteps = async (): Promise<{ 
  weeklyData: { date: string; steps: number }[] 
}> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Get dates for the last 7 days
  const weeklyData = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    // Filter for entries from this day
    const dayEntries = mockStepData.filter(entry => 
      entry.date.startsWith(dateString)
    );
    
    // Sum up steps for this day
    const daySteps = dayEntries.reduce((sum, entry) => sum + entry.steps, 0);
    
    weeklyData.push({
      date: date.toISOString(),
      steps: daySteps
    });
  }
  
  return { weeklyData };
};