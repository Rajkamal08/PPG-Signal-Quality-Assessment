import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const AnalysisScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { signalData } = route.params || {};
  const [step, setStep] = useState(0);

  const steps = [
    '✓ Filtering noise',
    '✓ Extracting features',
    '✓ Calculating SQI',
    '✓ Running AI classifier',
  ];

  useEffect(() => {
    // Simulate a sequence of steps before navigating to the result
    const timers = [];
    
    // Step 1
    timers.push(setTimeout(() => setStep(1), 800));
    // Step 2
    timers.push(setTimeout(() => setStep(2), 1600));
    // Step 3
    timers.push(setTimeout(() => setStep(3), 2400));
    // Step 4
    timers.push(setTimeout(() => setStep(4), 3200));

    // Finish and pass data to Result Screen
    timers.push(setTimeout(() => {
      navigation.replace('Result', { signalData });
    }, 4000));

    return () => timers.forEach(t => clearTimeout(t));
  }, [navigation, signalData]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={theme.primary} style={{ marginBottom: 30 }} />
        <Text style={[styles.title, { color: theme.text }]}>Analyzing Signal</Text>
        
        <View style={styles.stepsContainer}>
          {steps.map((text, index) => (
            <Text 
              key={index} 
              style={[
                styles.stepText, 
                { color: theme.textDim, opacity: step > index ? 1 : 0.3 }
              ]}
            >
              {text}
            </Text>
          ))}
        </View>

        <View style={[styles.progressContainer, { backgroundColor: theme.card }]}>
          <View style={[styles.progressBar, { backgroundColor: theme.primary, width: `${(step / 4) * 100}%` }]} />
        </View>
        <Text style={[styles.progressLabel, { color: theme.textDim }]}>{Math.round((step / 4) * 100)}%</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 40,
  },
  stepsContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  stepText: {
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 8,
  },
  progressContainer: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default AnalysisScreen;
