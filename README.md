# 🫀 Smartphone-based PPG Signal Quality Assessment

An end-to-end Machine Learning pipeline and mobile application designed to acquire, filter, and grade Photoplethysmography (PPG) signals in real-time using only a smartphone camera and flash. 

This project bridges the gap between raw optical hardware sensors and clinical-grade signal processing, providing a **Signal Quality Index (SQI)** score to determine if a captured heartbeat waveform is valid for downstream health metric analysis (like Heart Rate Variability, SpO2, or Blood Pressure estimation).

---

## 🚀 Project Complexity & Architecture
**Difficulty Level:** Advanced (Full-Stack Machine Learning + Native Mobile Hardware Integration)

This project spans three distinct engineering domains:
1. **Native Hardware Interfacing (Kotlin/Android):** Bypassing standard React Native camera limitations to extract raw frame brightness intensity at ~30 FPS to construct a raw optical signal.
2. **Digital Signal Processing (DSP):** Applying 4th-order Butterworth bandpass filters (0.5Hz - 4.0Hz) to remove baseline wander (respiration) and high-frequency noise (ambient light variations).
3. **Machine Learning (Python/Scikit-Learn):** Extracting statistical time-domain features and classifying the signal using an optimized Random Forest model trained on the clinical BUT-PPG dataset.

---

## 🛠️ Technology Stack

### Mobile Application (Frontend)
- **Framework:** React Native (0.74+)
- **Hardware Integration:** Custom Android Native Modules (Kotlin) for raw frame extraction.
- **Camera API:** `react-native-vision-camera`
- **UI/UX:** Dark-mode optimized, dynamic theming via React Context, and hardware-accelerated SVG charts (`react-native-svg`).

### Machine Learning & DSP (Backend)
- **Server:** FastAPI (Python) for ultra-fast, lightweight inference.
- **Model:** Random Forest Classifier (achieving robust accuracy on noisy edge-case data).
- **Signal Processing:** `SciPy`, `NumPy`, `Pandas` for Butterworth filtering and peak detection.
- **Features Extracted:** 
  - **Kurtosis & Skewness** (Measuring the morphological shape of the systolic peak)
  - **Zero-Crossing Rate (ZCR)** (Detecting high-frequency motion artifacts)
  - **Signal-to-Noise Ratio (SNR)** (Frequency-domain power analysis)

---

## 📈 System Workflow

1. **Acquisition:** The user places their finger over the smartphone camera and flash. The Kotlin Native Module records the average red-channel intensity of every frame for 10 seconds.
2. **Transmission:** The raw array of floating-point values and the exact sampling rate (`fs`) are transmitted to the FastAPI backend.
3. **Filtering:** The backend applies a bandpass filter to isolate the 0.5 - 4.0 Hz frequency band (equivalent to 30 - 240 BPM).
4. **Feature Extraction:** Statistical features are calculated from the cleaned waveform.
5. **Classification:** The Random Forest model grades the signal as `Good`, `Moderate`, or `Poor`, and assigns an out-of-100 **SQI Score** based on classification probability.
6. **Visualization:** The mobile app draws the true filtered waveform in real-time using SVG paths and presents a clinical dashboard.

---

## ⚙️ How to Run Locally

### 1. Start the Backend API
```bash
# Navigate to project root
cd PPG-IIIT

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server on port 8000
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Run the Mobile App
Because this project uses custom Kotlin Native Modules, it **cannot** be run via Expo Go. You must compile the native Android code.

```bash
# Forward the backend port to your Android device
adb reverse tcp:8000 tcp:8000

# Navigate to the mobile directory
cd mobile

# Install Node dependencies
npm install

# Build and deploy the Android app
npx react-native run-android
```

---

## 📸 Screenshots
*(To do: Add screenshots of the beautiful Dark Mode Camera Screen, the Analysis loader, and the final Dashboard UI here)*

---

## 🧠 Dataset & Training
The ML model was trained using the [Brno University of Technology Smartphone PPG Database (BUT-PPG)](https://physionet.org/content/but-ppg/2.0.0/). The raw signals were preprocessed, segmented into 10-second windows, and manually labeled for signal quality before feature extraction and training.

---
*Developed as a Final Year Academic Project.*
