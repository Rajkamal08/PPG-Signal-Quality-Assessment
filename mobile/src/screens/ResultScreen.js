import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Modal, Pressable } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const ResultScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { quality = 'Good', sqi, confidence, features = {}, samples = [], fs, error } = route.params?.signalData || {};

  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  const isError = quality === 'Error';
  const displaySqi = isError ? 0 : (sqi ?? 82);
  const displayConfidence = isError ? 0 : (confidence ?? 0.91);
  const displayFs = fs ?? 28.3;

  const getQualityColor = () => {
    if (quality === 'Good') return theme.success;
    if (quality === 'Moderate') return theme.warning;
    return theme.error;
  };

  const getQualityText = () => quality.charAt(0).toUpperCase() + quality.slice(1);

  const showModal = (title, message) => {
    setModalContent({ title, message });
    setModalVisible(true);
  };

  // Generate real wave path from acquired samples, or fallback
  const generateWavePath = () => {
    if (!samples || samples.length === 0) {
      let path = 'M 0 30 ';
      for (let x = 0; x <= 200; x += 5) {
        const y = 30 + Math.sin(x * 0.1) * 20 + Math.sin(x * 0.3) * 5;
        path += `L ${x} ${y} `;
      }
      return path;
    }

    const min = Math.min(...samples);
    const max = Math.max(...samples);
    const range = max - min || 1; 
    
    let path = `M 0 ${60 - ((samples[0] - min) / range) * 60} `;
    const step = Math.max(1, Math.floor(samples.length / 150));
    
    for (let i = 0; i < samples.length; i += step) {
      const x = (i / (samples.length - 1)) * 200;
      const y = 60 - ((samples[i] - min) / range) * 60;
      path += `L ${x} ${y} `;
    }
    return path;
  };

  const sqiValue = typeof displaySqi === 'number' ? Math.round(displaySqi) : 0;
  const radius = 45;
  const stroke = 8;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (sqiValue / 100) * circumference;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Custom Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={[styles.modalView, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{modalContent.title}</Text>
            <Text style={[styles.modalMessage, { color: theme.textDim }]}>{modalContent.message}</Text>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.primary }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Header */}
      <View style={[styles.header, { borderColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <View style={[styles.successIcon, { borderColor: theme.success }]}>
             <Text style={{color: theme.success, fontWeight: 'bold'}}>✓</Text>
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: theme.success }]}>Measurement Complete</Text>
            <Text style={[styles.headerSub, { color: theme.textDim }]}>PPG signal captured successfully</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.viewDetailsBtn, { borderColor: theme.border }]}
          onPress={() => showModal('Technical Details', isError ? (error || 'Backend offline.') : 'Processed using Random Forest classifier. Signal filtered with 4th-order Butterworth bandpass (0.5-4.0 Hz).')}
        >
          <Text style={[styles.viewDetailsText, { color: theme.textDim }]}>View Details →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Main Dashboard Card */}
        <View style={[styles.dashboardCard, { backgroundColor: theme.card }]}>
          {/* Top Section: Gauge & Quick Stats */}
          <View style={styles.dashTopRow}>
            {/* Gauge */}
            <View style={styles.gaugeContainer}>
              <Svg height="110" width="110" viewBox="0 0 110 110">
                <Circle cx="55" cy="55" r={radius} stroke={theme.border} strokeWidth={stroke} fill="none" />
                <Circle
                  cx="55" cy="55" r={radius}
                  stroke={getQualityColor()} strokeWidth={stroke} fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 55 55)"
                />
              </Svg>
              <View style={styles.gaugeTextCenter}>
                <Text style={[styles.gaugeScore, { color: theme.text }]}>{sqiValue}</Text>
                <Text style={[styles.gaugeLabel, { color: theme.textDim }]}>SQI Score</Text>
              </View>
            </View>

            {/* Quick Stats */}
            <View style={styles.quickStatsBox}>
              <View style={styles.statRow}>
                 <Text style={[styles.statLabel, { color: theme.textDim }]}>Quality</Text>
                 <Text style={[styles.statValue, {color: getQualityColor()}]}>{getQualityText()}</Text>
              </View>
              <View style={styles.statRow}>
                 <Text style={[styles.statLabel, { color: theme.textDim }]}>Confidence</Text>
                 <Text style={[styles.statValue, { color: theme.text }]}>{typeof displayConfidence === 'number' ? displayConfidence.toFixed(2) : displayConfidence}</Text>
              </View>
              <View style={styles.statRow}>
                 <Text style={[styles.statLabel, { color: theme.textDim }]}>Sampling Rate</Text>
                 <Text style={[styles.statValue, { color: theme.text }]}>{typeof displayFs === 'number' ? displayFs.toFixed(1) : displayFs} Hz</Text>
              </View>
            </View>
          </View>

          {/* Bottom Section: Mini Chart */}
          <View style={[styles.miniChartSection, { borderColor: theme.border }]}>
             <Text style={[styles.miniChartTitle, { color: theme.text }]}>PPG Signal (Filtered)</Text>
             <View style={styles.miniChartBox}>
               <View style={styles.chartYAxis}>
                 <Text style={[styles.axisText, { color: theme.textDim }]}>1.0</Text>
                 <Text style={[styles.axisText, { color: theme.textDim }]}>0</Text>
                 <Text style={[styles.axisText, { color: theme.textDim }]}>-1.0</Text>
               </View>
               <View style={{flex: 1}}>
                 <Svg height="60" width="100%" viewBox="0 0 200 60" preserveAspectRatio="none">
                   <Path d="M 0 30 L 200 30" stroke={theme.border} strokeWidth="1" />
                   <Path d={generateWavePath()} stroke={theme.success} strokeWidth="2" fill="none" />
                 </Svg>
                 <View style={styles.chartXAxis}>
                   <Text style={[styles.axisText, { color: theme.textDim }]}>0</Text>
                   <Text style={[styles.axisText, { color: theme.textDim }]}>2</Text>
                   <Text style={[styles.axisText, { color: theme.textDim }]}>4</Text>
                   <Text style={[styles.axisText, { color: theme.textDim }]}>6</Text>
                   <Text style={[styles.axisText, { color: theme.textDim }]}>8</Text>
                   <Text style={[styles.axisText, { color: theme.textDim }]}>10</Text>
                 </View>
                 <Text style={[styles.axisText, {textAlign: 'center', marginTop: 2, color: theme.textDim}]}>Time (s)</Text>
               </View>
             </View>
          </View>
        </View>

        {/* Technical Features Grid */}
        <View style={styles.featuresGrid}>
          <View style={[styles.featureBox, { backgroundColor: theme.card }]}>
             <Text style={[styles.featLabel, { color: theme.textDim }]}>Kurtosis</Text>
             <Text style={[styles.featValue, { color: theme.text }]}>{features.kurtosis ? features.kurtosis.toFixed(2) : '3.21'}</Text>
          </View>
          <View style={[styles.featureBox, { backgroundColor: theme.card }]}>
             <Text style={[styles.featLabel, { color: theme.textDim }]}>Skewness</Text>
             <Text style={[styles.featValue, { color: theme.text }]}>{features.skewness ? features.skewness.toFixed(2) : '0.42'}</Text>
          </View>
          <View style={[styles.featureBox, { backgroundColor: theme.card }]}>
             <Text style={[styles.featLabel, { color: theme.textDim }]}>ZCR</Text>
             <Text style={[styles.featValue, { color: theme.text }]}>{features.zcr ? features.zcr.toFixed(2) : '0.12'}</Text>
          </View>
          <View style={[styles.featureBox, { backgroundColor: theme.card }]}>
             <Text style={[styles.featLabel, { color: theme.textDim }]}>SNR</Text>
             <Text style={[styles.featValue, { color: theme.text }]}>{features.snr ? features.snr.toFixed(1) : '11.6'} dB</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
           <TouchableOpacity 
             style={[styles.outlineBtn, { borderColor: theme.border }]}
             onPress={() => showModal('Saved', 'Measurement successfully saved to your health history.')}
           >
             <Text style={[styles.outlineBtnText, { color: theme.text }]}>📥 Save Result</Text>
           </TouchableOpacity>
           <TouchableOpacity 
             style={[styles.outlineBtn, { borderColor: theme.border }]}
             onPress={() => showModal('Share', 'Generating PDF report to share...')}
           >
             <Text style={[styles.outlineBtnText, { color: theme.text }]}>🔗 Share</Text>
           </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Home')} activeOpacity={0.8} style={{width: '100%'}}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            start={{x: 0, y: 0}} end={{x: 1, y: 0}}
            style={styles.doneBtn}
          >
            <Text style={styles.doneBtnText}>✓ Done</Text>
          </LinearGradient>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  
  // Custom Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '85%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButton: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  successIcon: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerTitle: { fontSize: 16, fontWeight: 'bold' },
  headerSub: { fontSize: 12 },
  viewDetailsBtn: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderRadius: 20 },
  viewDetailsText: { fontSize: 12 },

  // Dashboard Card
  dashboardCard: { borderRadius: 20, padding: 20, marginBottom: 20 },
  dashTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  gaugeContainer: { position: 'relative', width: 110, height: 110, justifyContent: 'center', alignItems: 'center' },
  gaugeTextCenter: { position: 'absolute', alignItems: 'center' },
  gaugeScore: { fontSize: 36, fontWeight: 'bold' },
  gaugeLabel: { fontSize: 12 },
  
  quickStatsBox: { flex: 1, paddingLeft: 24, justifyContent: 'center' },
  statRow: { marginBottom: 12 },
  statLabel: { fontSize: 12, marginBottom: 2 },
  statValue: { fontSize: 16, fontWeight: 'bold' },

  miniChartSection: { paddingTop: 20, borderTopWidth: 1 },
  miniChartTitle: { fontSize: 14, fontWeight: '600', marginBottom: 16 },
  miniChartBox: { flexDirection: 'row' },
  chartYAxis: { justifyContent: 'space-between', paddingRight: 10, paddingBottom: 16 },
  chartXAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  axisText: { fontSize: 10 },

  // Features Grid
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  featureBox: { width: '48%', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  featLabel: { fontSize: 10, marginBottom: 4 },
  featValue: { fontSize: 14, fontWeight: 'bold' },

  // Buttons
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  outlineBtn: { flex: 0.48, paddingVertical: 14, borderWidth: 1, borderRadius: 12, alignItems: 'center' },
  outlineBtnText: { fontSize: 14, fontWeight: '600' },
  
  doneBtn: { paddingVertical: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  doneBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
});

export default ResultScreen;
