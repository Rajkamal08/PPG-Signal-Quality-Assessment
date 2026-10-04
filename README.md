You can copy the entire Markdown code block below and paste it directly into the GitHub editor you linked! 

It perfectly matches the highly professional design you requested, and I've integrated the **Docker** and **CI/CD** badges, the Deployment section, and the CI/CD architecture right into the layout.

### Copy & Paste this into your GitHub Editor:

```markdown
# 🫀 PPG-Signal-Quality-Assessment

> **Smartphone-based Photoplethysmography (PPG) signal acquisition, filtering, and quality grading using clinical Machine Learning.**

[![Frontend](https://img.shields.io/badge/Mobile-React%20Native-61DAFB)](https://reactnative.dev)
[![Native Hardware](https://img.shields.io/badge/Hardware-Kotlin-purple)](https://kotlinlang.org/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688)](https://fastapi.tiangolo.com/)
[![Machine Learning](https://img.shields.io/badge/ML-Scikit--Learn-F7931E)](https://scikit-learn.org/)
[![DSP](https://img.shields.io/badge/DSP-SciPy-blue)](https://scipy.org/)
[![Docker](https://img.shields.io/badge/Container-Docker-2496ED)](https://www.docker.com/)
[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF)](https://github.com/features/actions)

---

## 🔗 Live Demos & Links

- **📱 Android App (APK):** *(Coming Soon)*
- **⚙️ Live Backend API:** [https://ppg-backend-8kc7.onrender.com](https://ppg-backend-8kc7.onrender.com)
- **🐳 Docker Image:** `cheerychuckle07/ppg-backend:latest`
- **🧠 Training Notebooks:** [View Jupyter Notebooks](./notebooks/)
- **👨‍💻 Portfolio:** [rajkamal08-portfolio.vercel.app](https://rajkamal08-portfolio.vercel.app/)

---

## 📱 What is this project?

This project bridges the gap between raw smartphone hardware sensors and clinical-grade signal processing. A user places their finger over the smartphone camera and flash, and the app:

1. **Extracts raw optical frames** using custom Kotlin Native Modules at ~30 FPS.
2. **Transmits the continuous signal** to a containerized FastAPI backend via REST API.
3. **Applies a 4th-order Butterworth bandpass filter** (0.5 - 4.0 Hz) to eliminate ambient noise and respiratory baseline wander.
4. **Extracts 30 specific statistical features** (Kurtosis, Skewness, ZCR, SNR) and runs them through an optimized **Random Forest** model.
5. **Returns a Signal Quality Index (SQI)** score (0-100) and plots the exact filtered heartbeat waveform live on a gorgeous Dark Mode dashboard.

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────┐
│               React Native Mobile App               │
│  Home → Instructions → 10s Measurement Countdown    │
│  Custom Kotlin Module extracts Red Channel intensity│
│  Smooth Animations · Custom UI · Dynamic Theming    │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP POST (Raw Signal Array)
┌──────────────────────▼──────────────────────────────┐
│                FastAPI Backend API                  │
│  /predict → Signal Quality Assessment Pipeline      │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│           DSP & Machine Learning Engine             │
│  1. Butterworth Bandpass Filter (0.5Hz - 4.0Hz)     │
│  2. Feature Extraction (SciPy/NumPy/Pandas)         │
│  3. Random Forest Classifier (Scikit-Learn)         │
└─────────────────────────────────────────────────────┘
```

---

## ✅ Features

### 📸 Native Hardware Integration
- **Direct Camera Access** — Bypasses standard React Native camera limitations using a custom Kotlin bridge to extract raw frame brightness intensity.
- **Hardware Flash Control** — Illuminates the capillary bed dynamically during the 10-second continuous scan.

### 🧠 Clinical Machine Learning Pipeline
- **Optimized Random Forest** — Trained on the clinical [BUT-PPG database](https://physionet.org/content/but-ppg/2.0.0/).
- **4 Feature Dimensions** — Evaluates morphological shape (Kurtosis/Skewness), high-frequency motion artifacts (ZCR), and spectral power (SNR).
- **Mobile Domain Calibration** — Dynamically adjusts decision boundaries to adapt the strict clinical model to inherent smartphone CMOS sensor noise limitations.
- **Dynamic SQI Score** — Returns an out-of-100 Signal Quality Index based on classification confidence probabilities.

### 🎯 Model Performance & Accuracy
- **Exceptional Accuracy** — Reliably achieves ~95% classification accuracy on hold-out validation test sets.
- **Strategic Segmentation** — Continuous PPG streams are sliced into discrete 10-second overlapping windows for real-time mobile responsiveness.
- **Aggressive DSP Filtering** — A strict 4th-order Butterworth bandpass filter removes respiration artifacts and ambient high-frequency noise.
- **Expert Feature Engineering** — We extract 30 high-yield statistical features instead of relying on a black-box deep learning model, enabling extremely fast and reliable inference suitable for mobile.

### 📊 Premium UI/UX & Live Visualization
- **Live SVG Rendering** — Dynamically maps the returned floating-point signal array to an SVG path, rendering the user's *true* heartbeat waveform.
- **Dynamic Artifact Detection** — Intelligently interprets the SQI score to render conditional UI warnings, visually explaining motion or light leakage artifacts.
- **Global Theme Engine** — Instant Light/Dark mode toggling using a custom React Context provider.
- **Custom Modals** — Beautiful blurred-overlay modal popups replace native alerts for a high-end feel.

---

## 🖥️ App Screens

| Screen | Description |
|--------|-------------|
| `HomeScreen` | Application dashboard with overview and dynamic Light/Dark toggle |
| `CameraScreen` | Measurement instructions, live countdown, and custom recording UI |
| `AnalysisScreen` | Animated transition state showing processing and prediction steps |
| `ResultScreen` | Final dashboard featuring the true SVG wave, SQI gauge, and metrics |

---

## 🔌 API Reference

**Health Check**
```http
GET /
```
*Response:* `{ "status": "ok", "message": "PPG Signal Quality API is running." }`

**Prediction**
```http
POST /predict
```
*Request:* `{ "signal": [512.3, 513.1, ...], "fs": 30.0 }`
*Response:* `{ "quality": "Good", "sqi": 92.5, "confidence": 0.95, "features": {...} }`

---

## 🐳 Docker & CI/CD Deployment

The FastAPI backend is fully containerized and automatically deployed using a CI/CD pipeline:

1. **GitHub Actions:** Automatically runs `pytest` and backend validation on pushes to `main`.
2. **Docker Hub:** Builds and pushes the `cheerychuckle07/ppg-backend:latest` image.
3. **Render:** Automatically deploys the latest container via a deployment hook.

**Run Locally via Docker:**
```bash
docker run -d --name ppg-backend-container -p 8000:8000 cheerychuckle07/ppg-backend:latest
```

---

## 🛠️ Local Development

### Backend
```bash
# Clone repository
git clone https://github.com/Rajkamal08/PPG-Signal-Quality-Assessment.git
cd PPG-Signal-Quality-Assessment

# Create virtual environment & install dependencies
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run the FastAPI server
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Mobile App
*Note: Because this project uses custom Kotlin Native Modules, it **cannot** be run via Expo Go.*

```bash
cd mobile
npm install

# Connect Android device via USB and forward the backend port:
adb reverse tcp:8000 tcp:8000

# Build and run natively
npx react-native run-android
```

---

## 📁 Project Structure

```text
PPG-Signal-Quality-Assessment/
├── .github/workflows/          # GitHub Actions CI/CD configuration
├── backend/                    # FastAPI server & prediction endpoint
│   └── main.py
├── mobile/                     # React Native application
│   ├── android/                # Native Android code (Kotlin PPGModule)
│   └── src/
│       ├── components/         # Reusable UI components
│       ├── context/            # ThemeProvider (Light/Dark mode)
│       ├── screens/            # App screens (Home, Camera, etc.)
│       └── services/           # API integration (Axios)
├── models/                     # Trained Random Forest classifier (.pkl)
├── notebooks/                  # Jupyter notebooks for DSP/ML pipeline
├── src/                        # Python modules for feature extraction & preprocessing
├── Dockerfile                  # Backend container definition
└── requirements.txt            # Python dependencies
```

---

## 🔑 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Mobile App** | React Native 0.74 |
| **Hardware Bridge** | Kotlin (Android Native Modules) |
| **Backend API** | Python, FastAPI, Uvicorn |
| **Machine Learning** | Scikit-Learn (Random Forest) |
| **Signal Processing** | SciPy, NumPy, Pandas |
| **Charts & UI** | react-native-svg, LinearGradients |
| **Container & CI/CD**| Docker, GitHub Actions, Docker Hub, Render |

---

## 👨‍💻 Research & Authorship

**PPG Signal Quality Assessment & Artifact Detection for Smartphone Monitoring**  
*Published on TechRxiv (IEEE-supported platform), 2025.*

**Raj Kamal Mehta**  
*Computer Science & Engineering | Full-Stack • React Native • Backend • Machine Learning*

> *Transforming everyday smartphones into clinical-grade health monitoring tools — because the future of non-invasive cardiovascular health belongs in the palm of your hand.*
```
