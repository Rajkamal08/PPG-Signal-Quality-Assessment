import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ResultCard = ({ quality, sqi, confidence }) => {
  // Determine colors based on quality
  let color = '#2ed573'; // Good
  let icon = '🟢';
  
  if (quality === 'Moderate') {
    color = '#ffa502';
    icon = '🟡';
  } else if (quality === 'Poor') {
    color = '#ff4757';
    icon = '🔴';
  }

  return (
    <View style={[styles.card, { borderColor: color }]}>
      <Text style={styles.header}>Signal Quality</Text>
      
      <View style={styles.qualityContainer}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.qualityText, { color }]}>{quality}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.metricsContainer}>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>SQI Score</Text>
          <Text style={styles.metricValue}>{sqi ? sqi.toFixed(1) : '--'}</Text>
        </View>
        <View style={styles.metricBox}>
          <Text style={styles.metricLabel}>Confidence</Text>
          <Text style={styles.metricValue}>{confidence ? `${(confidence * 100).toFixed(0)}%` : '--'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
    width: '100%',
  },
  header: {
    color: '#8f8fb5',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 20,
  },
  qualityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 32,
    marginRight: 10,
  },
  qualityText: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2a4a',
    marginBottom: 24,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricBox: {
    alignItems: 'center',
  },
  metricLabel: {
    color: '#8f8fb5',
    fontSize: 14,
    marginBottom: 8,
  },
  metricValue: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  }
});

export default ResultCard;
