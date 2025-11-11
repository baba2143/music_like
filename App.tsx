import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { ProfileSetupProvider } from './src/contexts/ProfileSetupContext';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProfileSetupProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="light" />
          </NavigationContainer>
        </ProfileSetupProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
