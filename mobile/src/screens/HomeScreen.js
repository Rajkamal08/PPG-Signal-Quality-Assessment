import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const HomeScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Top Header with Theme Toggle */}
        <View style={styles.topHeader}>
          <TouchableOpacity onPress={toggleTheme} style={[styles.themeToggle, { borderColor: theme.border }]}>
            <Text style={{ fontSize: 20 }}>{isDarkMode ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>

        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={[styles.iconBox, { borderColor: theme.primary, backgroundColor: isDarkMode ? 'rgba(255,107,107,0.1)' : 'rgba(255,107,107,0.05)' }]}>
            <Text style={styles.iconHeader}>❤️</Text>
          </View>
          <Text style={[styles.title, { color: theme.text }]}>PPG Analyzer</Text>
          <Text style={[styles.subtitle, { color: theme.textDim }]}>Clinical Grade Signal Assessment</Text>
        </View>

        {/* Call to Action */}
        <TouchableOpacity 
          style={{ width: '100%', marginBottom: 32 }}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Scan')}
        >
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
            style={styles.gradientBtn}
          >
            <Text style={styles.gradientBtnText}>▶ Start PPG Scan</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* How It Works Section */}
        <View style={styles.howItWorksContainer}>
          <Text style={[styles.howItWorksTitle, { color: theme.text }]}>How it works</Text>
          
          <View style={[styles.stepBlock, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.stepNumberContainer, { backgroundColor: theme.background }]}>
              <Text style={[styles.stepNumber, { color: theme.primary }]}>1</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={[styles.stepHeader, { color: theme.text }]}>Capture</Text>
              <Text style={[styles.stepDesc, { color: theme.textDim }]}>Place finger over camera and flash for 10 seconds.</Text>
            </View>
          </View>

          <View style={[styles.stepBlock, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.stepNumberContainer, { backgroundColor: theme.background }]}>
              <Text style={[styles.stepNumber, { color: theme.primary }]}>2</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={[styles.stepHeader, { color: theme.text }]}>Analyze</Text>
              <Text style={[styles.stepDesc, { color: theme.textDim }]}>Machine learning evaluates the waveform features.</Text>
            </View>
          </View>

          <View style={[styles.stepBlock, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.stepNumberContainer, { backgroundColor: theme.background }]}>
              <Text style={[styles.stepNumber, { color: theme.primary }]}>3</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={[styles.stepHeader, { color: theme.text }]}>Result</Text>
              <Text style={[styles.stepDesc, { color: theme.textDim }]}>Receive an SQI score and filtered signal visualization.</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
  },
  topHeader: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  themeToggle: {
    padding: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
  },
  iconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconHeader: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  gradientBtn: { 
    paddingVertical: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  gradientBtnText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: 'bold', 
    letterSpacing: 1 
  },
  howItWorksContainer: {
    width: '100%',
  },
  howItWorksTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  stepBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  stepNumberContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepTextContainer: {
    flex: 1,
  },
  stepHeader: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default HomeScreen;
