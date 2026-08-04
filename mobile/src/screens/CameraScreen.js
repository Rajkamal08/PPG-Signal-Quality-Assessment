import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, Vibration, NativeModules, SafeAreaView,
  Animated, ActivityIndicator, ScrollView
} from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { predictSignalQuality } from '../services/api';
import Svg, { Circle, Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const { PPGModule } = NativeModules;

const PHASE = {
  IDLE: 'IDLE',
  PREPARING: 'PREPARING',
  RECORDING: 'RECORDING',
  ANALYZING: 'ANALYZING',
};

const CameraScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');

  const [phase, setPhase] = useState(PHASE.IDLE);
  const [progress, setProgress] = useState(0); 
  const [torchOn, setTorchOn] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [nativeRecording, setNativeRecording] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const timerRef = useRef(null);
  const prepTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const animationValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (prepTimerRef.current) clearTimeout(prepTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const onCameraStarted = useCallback(() => setCameraReady(true), []);
  const onCameraError = useCallback((e) => console.warn(e), []);

  const startMeasurement = useCallback(() => {
    if (!cameraReady) return Alert.alert('Wait', 'Camera initializing...');
    
    setPhase(PHASE.PREPARING);
    setTorchOn(true);
    setCountdown(3);

    let count = 3;
    countdownRef.current = setInterval(() => {
      count -= 1;
      setCountdown(count);

      if (count <= 0) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
        Vibration.vibrate(100);

        prepTimerRef.current = setTimeout(() => {
          beginRecording();
        }, 500);
      }
    }, 1000);
  }, [cameraReady]);

  const beginRecording = useCallback(async () => {
    setPhase(PHASE.RECORDING);
    setNativeRecording(true);
    setProgress(0);
    
    Animated.loop(
      Animated.timing(animationValue, {
        toValue: 100,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    let uiProgress = 0;
    timerRef.current = setInterval(() => {
      uiProgress += 1;
      if (uiProgress <= 100) setProgress(uiProgress);
    }, 100);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const result = await PPGModule.startPPGRecording();
      
      clearInterval(timerRef.current);
      timerRef.current = null;
      setProgress(100);
      Vibration.vibrate(200);
      
      setPhase(PHASE.ANALYZING);
      setNativeRecording(false);
      setTorchOn(false);
      
      const prediction = await predictSignalQuality(result.samples, result.fs);
      
      navigation.replace('Analysis', {
        signalData: {
          quality: prediction.quality,
          sqi: prediction.sqi,
          confidence: prediction.confidence,
          features: prediction.features,
          samples: result.samples,
          fs: result.fs,
        }
      });
      
    } catch (err) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setPhase(PHASE.IDLE);
      setNativeRecording(false);
      setTorchOn(false);
      
      if (err.code === 'E_NO_FINGER') {
        Alert.alert('Finger Not Detected', 'Please cover both the camera lens and flash completely.');
      } else {
        Alert.alert('Recording Failed', err.message || 'Unknown error occurred.');
      }
    }
  }, [navigation, animationValue]);

  const cancelMeasurement = useCallback(() => {
    try {
      PPGModule.cancelPPGRecording();
    } catch (e) {
      console.log('Cancel err', e);
    }
    
    setPhase(PHASE.IDLE);
    setNativeRecording(false);
    setTorchOn(false);
    setProgress(0);
    animationValue.stopAnimation();
  }, []);

  if (!hasPermission) {
    return <View style={styles.container}><Text style={{color: theme.text}}>No Camera Found</Text></View>;
  }

  const generateWavePath = () => {
    let path = 'M 0 50 ';
    for (let x = 0; x <= 300; x += 10) {
      const y = 50 + Math.sin((x + progress * 5) * 0.05) * 30 + Math.sin((x + progress * 2) * 0.1) * 10;
      path += `L ${x} ${y} `;
    }
    return path;
  };

  const renderIdleState = () => (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.backBtn} onPress={() => navigation.goBack()}>←</Text>
          <Text style={styles.headerTitle}>PPG Measurement</Text>
          <Text style={styles.helpBtn}>?</Text>
        </View>

        <View style={styles.readyCard}>
          <View style={styles.lensBox}>
            <View style={styles.lensInner} />
          </View>
          <Text style={styles.readyTitle}>
            {phase === PHASE.PREPARING ? `Starting in ${countdown}...` : 'Ready to Measure'}
          </Text>
          <Text style={styles.readySub}>Cover the camera and flash completely with your finger</Text>
          <View style={styles.flashBadge}>
            <Text style={styles.flashText}>⚡ Flash: ON</Text>
          </View>
        </View>

        <View style={styles.instructionsCard}>
          <Text style={styles.instTitle}>How to get a good signal</Text>
          <View style={styles.instRow}>
            <Text style={styles.instIcon}>📷</Text>
            <Text style={styles.instText}>Cover the camera and flash completely</Text>
          </View>
          <View style={styles.instRow}>
            <Text style={styles.instIcon}>✋</Text>
            <Text style={styles.instText}>Keep your finger still</Text>
          </View>
          <View style={styles.instRow}>
            <Text style={styles.instIcon}>⏱️</Text>
            <Text style={styles.instText}>Press start and hold for 10 seconds</Text>
          </View>
        </View>

        {phase === PHASE.PREPARING ? (
          <TouchableOpacity onPress={cancelMeasurement} activeOpacity={0.8} style={{width: '100%'}}>
            <LinearGradient
              colors={isDarkMode ? ['#451A1A', '#451A1A'] : ['#FEE2E2', '#FEE2E2']}
              start={{x: 0, y: 0}} end={{x: 1, y: 0}}
              style={[styles.gradientBtn, {borderWidth: 1, borderColor: '#EF4444'}]}
            >
              <Text style={[styles.gradientBtnText, {color: '#EF4444'}]}>■ Cancel</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={startMeasurement} activeOpacity={0.8} style={{width: '100%'}}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8E53']}
              start={{x: 0, y: 0}} end={{x: 1, y: 0}}
              style={styles.gradientBtn}
            >
              <Text style={styles.gradientBtnText}>▶ Start Measurement</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <Text style={styles.secureText}>🛡️ Your data is processed securely</Text>
      </ScrollView>
  );

  const renderRecordingState = () => {
    const timeRemaining = Math.max(0, 10 - Math.floor(progress / 10));
    const timeStr = `00:0${timeRemaining}`;

    const radius = 30;
    const stroke = 6;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.backBtn} onPress={cancelMeasurement}>←</Text>
          <Text style={styles.headerTitle}>PPG Measurement</Text>
          <Text style={styles.helpBtn}>?</Text>
        </View>

        <View style={styles.measuringCard}>
          <View style={{flex: 1}}>
            <Text style={styles.measuringTitle}>Measuring...</Text>
            <Text style={styles.measuringTime}>{timeStr}</Text>
            <Text style={styles.measuringSub}>Keep your finger still</Text>
          </View>
          <View style={styles.circularProgress}>
            <Svg height="80" width="80" viewBox="0 0 80 80">
              <Circle cx="40" cy="40" r={radius} stroke={theme.border} strokeWidth={stroke} fill="none" />
              <Circle
                cx="40" cy="40" r={radius}
                stroke={theme.primary} strokeWidth={stroke} fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 40 40)"
              />
            </Svg>
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.liveCard}>
          <View style={styles.liveHeader}>
            <Text style={styles.liveTitle}>Live PPG Signal</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <View style={{width: 6, height: 6, borderRadius: 3, backgroundColor: '#38BDF8', marginRight: 6}} />
              <Text style={{color: '#38BDF8', fontSize: 12, fontWeight: '600'}}>Acquiring...</Text>
            </View>
          </View>
          
          <View style={styles.chartArea}>
             <Svg height="120" width="100%" viewBox="0 0 300 100" preserveAspectRatio="none">
               <Defs>
                 <SvgLinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                   <Stop offset="0" stopColor={theme.primary} stopOpacity="0.4" />
                   <Stop offset="1" stopColor={theme.primary} stopOpacity="0.0" />
                 </SvgLinearGradient>
               </Defs>
               <Path d="M 0 25 L 300 25" stroke={theme.border} strokeWidth="1" />
               <Path d="M 0 50 L 300 50" stroke={theme.border} strokeWidth="1" />
               <Path d="M 0 75 L 300 75" stroke={theme.border} strokeWidth="1" />
               <Path d={generateWavePath()} stroke={theme.primary} strokeWidth="2.5" fill="none" />
             </Svg>
             <View style={styles.chartAxisX}>
               <Text style={styles.axisText}>0</Text>
               <Text style={styles.axisText}>2</Text>
               <Text style={styles.axisText}>4</Text>
               <Text style={styles.axisText}>6</Text>
               <Text style={styles.axisText}>8</Text>
               <Text style={styles.axisText}>10</Text>
             </View>
             <Text style={styles.axisLabel}>Time (seconds)</Text>
          </View>

          <View style={styles.liveStatsRow}>
             <View style={styles.liveStatBox}>
                <Text style={styles.liveStatLabel}>Signal Quality</Text>
                <Text style={[styles.liveStatValue, {color: '#38BDF8'}]}>Analyzing...</Text>
             </View>
             <View style={styles.liveStatBox}>
                <Text style={styles.liveStatLabel}>Sampling Rate</Text>
                <Text style={styles.liveStatValue}>Estimating...</Text>
             </View>
          </View>
        </View>

        <View style={styles.tipsBox}>
           <Text style={{fontSize: 24, marginRight: 10}}>💡</Text>
           <View style={{flex: 1}}>
             <Text style={styles.tipTitle}>Tips</Text>
             <Text style={styles.tipText}>Try to keep your finger relaxed and still. Too much movement can affect the signal.</Text>
           </View>
        </View>

      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{position: 'absolute', width: 1, height: 1, opacity: 0}}>
        <Camera
          style={{width: 100, height: 100}}
          device={device}
          isActive={!nativeRecording}
          torchMode={torchOn ? 'on' : 'off'}
          onStarted={onCameraStarted}
          onError={onCameraError}
        />
      </View>
      
      {phase === PHASE.IDLE || phase === PHASE.PREPARING ? renderIdleState() : renderRecordingState()}
      
      {phase === PHASE.ANALYZING && (
        <View style={styles.analyzingOverlay}>
           <ActivityIndicator size="large" color={theme.primary} />
           <Text style={styles.analyzingText}>Analyzing Signal...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { flexGrow: 1, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  backBtn: { color: theme.text, fontSize: 24, fontWeight: 'bold' },
  headerTitle: { color: theme.text, fontSize: 18, fontWeight: '600' },
  helpBtn: { color: theme.text, fontSize: 18, borderWidth: 1, borderColor: theme.text, borderRadius: 12, width: 24, height: 24, textAlign: 'center', lineHeight: 22 },
  
  // Idle UI
  readyCard: { backgroundColor: theme.card, padding: 30, borderRadius: 20, alignItems: 'center', marginBottom: 20 },
  lensBox: { width: 100, height: 100, borderRadius: 24, borderWidth: 2, borderColor: theme.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 20, backgroundColor: 'rgba(255,107,107,0.1)' },
  lensInner: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.background, borderWidth: 4, borderColor: theme.border },
  readyTitle: { color: theme.text, fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  readySub: { color: theme.textDim, fontSize: 14, textAlign: 'center', marginBottom: 20, paddingHorizontal: 20 },
  flashBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.background, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  flashText: { color: theme.textDim, fontSize: 12, fontWeight: 'bold' },

  instructionsCard: { backgroundColor: theme.card, padding: 20, borderRadius: 20, marginBottom: 30 },
  instTitle: { color: theme.text, fontSize: 14, fontWeight: 'bold', marginBottom: 16 },
  instRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  instIcon: { fontSize: 20, marginRight: 16, backgroundColor: theme.border, padding: 8, borderRadius: 8, overflow: 'hidden' },
  instText: { color: theme.textDim, fontSize: 14, flex: 1 },

  gradientBtn: { paddingVertical: 18, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  gradientBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  secureText: { color: theme.textDim, fontSize: 12, textAlign: 'center', marginTop: 'auto' },

  // Recording UI
  measuringCard: { flexDirection: 'row', backgroundColor: theme.card, padding: 24, borderRadius: 20, marginBottom: 20, alignItems: 'center' },
  measuringTitle: { color: theme.text, fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  measuringTime: { color: theme.primary, fontSize: 36, fontWeight: '900', marginBottom: 4 },
  measuringSub: { color: theme.textDim, fontSize: 14 },
  circularProgress: { position: 'relative', width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
  progressTextContainer: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
  progressText: { color: theme.text, fontSize: 16, fontWeight: 'bold' },

  liveCard: { backgroundColor: theme.card, padding: 20, borderRadius: 20, marginBottom: 20 },
  liveHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  liveTitle: { color: theme.text, fontSize: 14, fontWeight: 'bold' },
  chartArea: { height: 160, width: '100%', marginBottom: 10, borderLeftWidth: 1, borderBottomWidth: 1, borderColor: theme.border },
  chartAxisX: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 0, marginTop: 4 },
  axisText: { color: theme.textDim, fontSize: 10 },
  axisLabel: { color: theme.textDim, fontSize: 10, textAlign: 'center', marginTop: 4 },

  liveStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  liveStatBox: { backgroundColor: theme.background, flex: 1, padding: 12, borderRadius: 12, marginHorizontal: 4 },
  liveStatLabel: { color: theme.textDim, fontSize: 11, marginBottom: 4 },
  liveStatValue: { color: theme.text, fontSize: 16, fontWeight: 'bold' },

  tipsBox: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingHorizontal: 10 },
  tipTitle: { color: theme.text, fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  tipText: { color: theme.textDim, fontSize: 12, lineHeight: 18 },
  
  analyzingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: theme.background === '#0F172A' ? 'rgba(15,23,42,0.9)' : 'rgba(248,250,252,0.9)', justifyContent: 'center', alignItems: 'center' },
  analyzingText: { color: theme.text, fontSize: 18, fontWeight: 'bold', marginTop: 16 }
});

export default CameraScreen;
