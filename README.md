 🫀 PPG-Signal-Quality-Assessment

> **Smartphone-based Photoplethysmography (PPG) signal acquisition, filtering, and quality grading using Machine Learning.**

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

This project bridges the gap between raw smartphone hardware sensors and signal processing for PPG signal quality assessment. A user places their finger over the smartphone camera and flash, and the app:

1. **Extracts raw optical frames** using a custom Kotlin Native Module at approximately 30 FPS.
2. **Transmits the continuous signal** to a containerized FastAPI backend via REST API.
3. **Applies a 4th-order Butterworth bandpass filter** (0.5–4.0 Hz) to reduce baseline wander and high-frequency noise.
4. **Extracts signal-quality features** including Kurtosis, Skewness, ZCR, SNR, and other engineered features.
5. **Runs the features through a Random Forest classifier** to assess signal quality.
6. **Returns a Signal Quality Index (SQI)**, classification, confidence, and extracted features.
7. **Visualizes the processed PPG waveform** on the mobile application.

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────┐
│               React Native Mobile App               │
│  Home → Instructions → 10s Measurement Countdown    │
│  Custom Kotlin Module extracts PPG intensity        │
│  Smooth Animations · Custom UI · Dynamic Theming    │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP POST /predict
┌──────────────────────▼──────────────────────────────┐
│                 FastAPI Backend API                 │
│  /predict → Signal Quality Assessment Pipeline      │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│            DSP & Machine Learning Engine            │
│  1. Butterworth Bandpass Filter (0.5–4.0 Hz)        │
│  2. Feature Extraction                              │
│  3. Feature Scaling                                 │
│  4. Random Forest Classification                    │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 CI/CD & Deployment Architecture

The backend is automatically tested, containerized, published, and deployed using GitHub Actions, Docker, Docker Hub, and Render.

### CI/CD Workflow

- **On Pull Request:**
  `Checkout → Setup Python → Install Dependencies → Run Pytest → Backend Validation`

- **On Push to `main`:**
  `Run Tests → Build Docker Image → Push to Docker Hub → Trigger Render Deploy Hook → Live Backend`

*Sensitive credentials (like `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, and `RENDER_DEPLOY_HOOK`) are securely managed through GitHub Actions Secrets.*

---

## ✅ Features

### 📸 Native Hardware Integration
- **Direct Camera Access** — Custom Kotlin Native Module extracts raw frame intensity from the smartphone camera.
- **Hardware Flash Control** — Smartphone flash provides illumination during PPG acquisition.
- **10-second Measurement** — Captures a continuous PPG signal for real-time assessment.

### 🧠 Machine Learning Pipeline
- **Random Forest Classifier** trained using the BUT-PPG database.
- **Signal Quality Classification** into Good, Moderate, and Poor.
- **Feature Engineering** using statistical and signal-processing characteristics.
- **Signal Quality Index (SQI)** derived from model prediction confidence.
- **Mobile Domain Calibration** to improve robustness against smartphone sensor noise.

### 📊 Digital Signal Processing
- **4th-order Butterworth bandpass filtering.**
- **Frequency range:** 0.5–4.0 Hz.
- **Baseline wander and high-frequency noise reduction.**
- **PPG waveform preprocessing** and statistical feature extraction.

### 🎯 Model Performance
- **89.7% classification accuracy** on the current validated model.
- **Designed for fast inference** suitable for mobile-assisted signal assessment.
- **Uses engineered signal features** rather than an end-to-end deep learning model.

### 📱 Premium UI/UX & Live Visualization
- **Live SVG Rendering** — Dynamically renders the processed PPG waveform.
- **Dynamic Artifact Detection** — Displays quality-related warnings based on the prediction.
- **Global Theme Engine** — Light/Dark mode using React Context.
- **Custom Modals** — Custom blurred-overlay modal interfaces.

---

## 🖥️ App Screens

| Screen | Description |
|--------|-------------|
| `HomeScreen` | Application dashboard with overview and theme controls |
| `CameraScreen` | Measurement instructions, live countdown, and recording UI |
| `AnalysisScreen` | Processing and prediction state |
| `ResultScreen` | SQI, quality classification, waveform, and metrics |

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
*Request:* `{ "signal": [512.3, 513.1, 514.2], "fs": 30.0 }`
*Response:* `{ "quality": "Good", "sqi": 92.5, "confidence": 0.95, "features": {...} }`

---

## 🐳 Docker

The FastAPI backend is fully containerized using Docker.

- **Docker Image:** `cheerychuckle07/ppg-backend:latest`
- **Build Locally:** `docker build -t ppg-backend .`
- **Run Locally:** 
  ```bash
  docker run -d --name ppg-backend-container -p 8000:8000 ppg-backend
  ```

*(The Docker image explicitly excludes large datasets, mobile code, and local environments via `.dockerignore` for a lightweight footprint).*

---

## ☁️ Deployment

| Component | Platform |
|-----------|----------|
| **Containerization** | Docker |
| **Container Registry** | Docker Hub |
| **Deployment** | Render |
| **API Framework** | FastAPI + Uvicorn |
| **CI/CD** | GitHub Actions |

**Production API:** [https://ppg-backend-8kc7.onrender.com](https://ppg-backend-8kc7.onrender.com)

---

## 🧪 Testing

The backend uses `pytest` and FastAPI's `TestClient`. The CI pipeline automatically executes the test suite before publishing the Docker image.

**Run tests locally:**
```bash
python -m pytest
```

---

## 🚀 Local Development

### Backend

```bash
# Clone the repository:
git clone https://github.com/Rajkamal08/PPG-Signal-Quality-Assessment.git
cd PPG-Signal-Quality-Assessment

# Create a virtual environment:
python -m venv venv

# Activate it:
venv\Scripts\activate      # Windows
source venv/bin/activate   # Linux / macOS

# Install dependencies:
pip install -r requirements.txt

# Run the FastAPI server from the project root:
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
The API will be available at: `http://127.0.0.1:8000`

### Mobile App
*Because this project uses custom Kotlin Native Modules, it cannot be run through Expo Go.*

```bash
cd mobile
npm install

# Connect an Android device via USB and forward the backend port:
adb reverse tcp:8000 tcp:8000

# Build and run natively:
npx react-native run-android
```

---

## 📁 Project Structure

```text
PPG-Signal-Quality-Assessment/
├── .github/workflows/          # GitHub Actions CI/CD (ci.yml)
├── backend/                    # FastAPI server
│   ├── __init__.py
│   └── main.py
├── mobile/                     # React Native application
│   ├── android/                # Native Android/Kotlin code
│   └── src/
│       ├── components/         # Reusable UI components
│       ├── context/            # Theme provider
│       ├── screens/            # Application screens
│       └── services/           # API integration
├── models/                     # Trained ML models
├── notebooks/                  # ML/DSP experiments
├── src/                        # Signal processing modules
│   ├── tests/                  # Backend tests (test_main.py)
│   └── predict.py              # Prediction pipeline
├── requirements.txt            # Development dependencies
├── requirements-docker.txt     # Docker runtime dependencies
├── Dockerfile                  # Backend container definition
└── .dockerignore               # Docker build exclusions
```

---

## 🔬 Machine Learning Pipeline

```text
Raw PPG Signal
       │
       ▼
Signal Preprocessing
       │
       ▼
Butterworth Bandpass Filter
       │
       ▼
Feature Extraction
  ├── Kurtosis
  ├── Skewness
  ├── Zero-Crossing Rate
  ├── Signal-to-Noise Ratio
  └── Additional Signal Features
       │
       ▼
Feature Scaling
       │
       ▼
Random Forest Classifier
       │
       ▼
Quality Classification
  ├── Good
  ├── Moderate
  └── Poor
       │
       ▼
SQI + Confidence
```

---

## 🗃️ Dataset

The project uses the **Brno University of Technology Smartphone PPG Database (BUT-PPG 2.0.0)** for signal processing and model development. *(Note: The dataset is not included in this repository).*

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Mobile App** | React Native 0.74 |
| **Hardware Bridge** | Kotlin Android Native Modules |
| **Backend API** | Python, FastAPI, Uvicorn |
| **Machine Learning** | Scikit-learn, Random Forest |
| **Signal Processing** | SciPy, NumPy, Pandas |
| **Visualization** | React Native SVG |
| **Storage** | AsyncStorage |
| **Testing** | Pytest |
| **Container & CI/CD** | Docker, Docker Hub, GitHub Actions, Render |

---

## 📄 Research & Authorship

**PPG Signal Quality Assessment & Artifact Detection for Smartphone Monitoring**  
*Published on TechRxiv (IEEE-supported platform), 2025.*

**👨‍💻 Raj Kamal Mehta**  
*Computer Science & Engineering | Full-Stack • React Native • Backend • Machine Learning*

> *Transforming everyday smartphones into accessible tools for reliable PPG signal quality assessment.*
```
