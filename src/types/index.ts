
export type User = {
  id: string;
  name: string;
  email: string;
};

export type StepData = {
  id: string;
  userId: string;
  steps: number;
  date: string;
};

export type DailyStepData = {
  date: string;
  totalSteps: number;
};

export type WeeklyStepData = {
  weeklyData: {
    date: string;
    steps: number;
  }[];
};

export type AuthResponse = {
  message: string;
  token: string;
  user: User;
};

export type SaveStepResponse = {
  message: string;
  stepData: StepData;
};

export type GetStepsResponse = {
  stepData: StepData[];
};

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  Daily: undefined;
  Weekly: undefined;
  Profile: undefined;
};
