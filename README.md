````markdown
# 🫀 PPG-Signal-Quality-Assessment

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

- **📱 Android App (APK):** Coming Soon
- **⚙️ Live Backend API:** https://ppg-backend-8kc7.onrender.com
- **🐳 Docker Image:** `cheerychuckle07/ppg-backend:latest`
- **🧠 Training Notebooks:** [View Jupyter Notebooks](./notebooks/)

---

## 📱 What is this project?

This project bridges smartphone hardware with automated PPG signal processing and machine learning-based quality assessment.

A user places their finger over the smartphone camera and flash, and the application:

1. Captures raw optical intensity frames using a custom Kotlin Native Module.
2. Extracts the PPG signal from the camera stream.
3. Sends the signal to a FastAPI backend through a REST API.
4. Applies digital signal processing and feature extraction.
5. Classifies the signal quality using a Random Forest model.
6. Returns the quality classification, SQI, confidence, and extracted features.
7. Visualizes the processed heartbeat waveform on the mobile application.

---

# 🏗️ System Architecture

```text
┌────────────────────────────────────────────────────────────┐
│                  React Native Mobile App                   │
│                                                            │
│  Home → Instructions → Measurement → Analysis → Result    │
│                                                            │
│  Camera + Flash                                             │
│       ↓                                                     │
│  Custom Kotlin Native Module                                │
│       ↓                                                     │
│  Raw PPG Signal                                             │
└────────────────────────────┬───────────────────────────────┘
                             │
                             │ HTTP POST /predict
                             ▼
┌────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                          │
│                                                            │
│  REST API → Signal Processing → Feature Extraction         │
│                         ↓                                  │
│                  ML Prediction Pipeline                    │
└────────────────────────────┬───────────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────────┐
│              DSP & Machine Learning Engine                 │
│                                                            │
│  Butterworth Bandpass Filter (0.5Hz – 4.0Hz)              │
│                     ↓                                      │
│             Feature Extraction                             │
│                     ↓                                      │
│          Feature Scaling / Transformation                  │
│                     ↓                                      │
│          Random Forest Classifier                           │
│                     ↓                                      │
│       Good / Moderate / Poor + SQI + Confidence            │
└────────────────────────────────────────────────────────────┘
````

---

# 🔄 CI/CD & Deployment Architecture

The backend is automatically tested, containerized, published, and deployed using GitHub Actions, Docker, Docker Hub, and Render.

```text
                         Developer
                             │
                             │ git push
                             ▼
                    ┌─────────────────┐
                    │     GitHub      │
                    │   Repository    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ GitHub Actions  │
                    │                 │
                    │ • Checkout      │
                    │ • Python Setup  │
                    │ • Dependencies  │
                    │ • Pytest        │
                    │ • Validation    │
                    └────────┬────────┘
                             │
                        Push to main
                             │
                             ▼
                    ┌─────────────────┐
                    │  Docker Build   │
                    │  FastAPI Image  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Docker Hub    │
                    │                 │
                    │ ppg-backend     │
                    └────────┬────────┘
                             │
                             │ Deploy Hook
                             ▼
                    ┌─────────────────┐
                    │     Render      │
                    │ Docker Web      │
                    │    Service      │
                    └────────┬────────┘
                             │
                             ▼
                     Live FastAPI API
```

### CI/CD Workflow

**Pull Request:**

```text
Pull Request
     ↓
Checkout
     ↓
Setup Python
     ↓
Install Dependencies
     ↓
Run Pytest
     ↓
Backend Validation
```

**Push to `main`:**

```text
Push
 ↓
Tests
 ↓
Backend Validation
 ↓
Docker Build
 ↓
Docker Hub Push
 ↓
Render Deploy Hook
 ↓
Live Backend
```

Sensitive credentials are managed through GitHub Actions Secrets:

```text
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
RENDER_DEPLOY_HOOK
```

---

## ✅ Features

### 📸 Native Hardware Integration

* **Direct Camera Access** — Custom Kotlin Native Module extracts raw frame intensity from the smartphone camera.
* **Hardware Flash Control** — Smartphone flash provides illumination during PPG acquisition.
* **10-second Measurement** — Captures a continuous PPG signal for real-time assessment.

### 🧠 Machine Learning Pipeline

* **Random Forest Classifier** trained using the BUT-PPG database.
* **Signal Quality Classification** into Good, Moderate, and Poor.
* **Feature Engineering** using statistical and signal-processing characteristics.
* **Signal Quality Index (SQI)** calculated from model prediction confidence.
* **Mobile Domain Calibration** to improve robustness against smartphone sensor noise.

### 📊 Digital Signal Processing

* 4th-order Butterworth bandpass filtering.
* Frequency range: **0.5 Hz – 4.0 Hz**.
* Baseline wander and high-frequency noise reduction.
* PPG waveform preprocessing and normalization.
* Statistical and frequency-domain feature extraction.

### 🎯 Model Performance

* **89.7% classification accuracy** on the current validated model.
* Designed for fast inference suitable for mobile-assisted signal assessment.
* Uses interpretable engineered signal features rather than an end-to-end deep learning model.

### 📱 Mobile UI/UX

* Live PPG waveform visualization using `react-native-svg`.
* SQI-based result dashboard.
* Dynamic artifact warnings.
* Light/Dark theme support.
* Animated measurement and analysis states.
* Custom modal interfaces.

---

## 🖥️ App Screens

| Screen           | Description                                       |
| ---------------- | ------------------------------------------------- |
| `HomeScreen`     | Application dashboard and theme controls          |
| `CameraScreen`   | Measurement instructions and live PPG acquisition |
| `AnalysisScreen` | Processing and prediction state                   |
| `ResultScreen`   | SQI, quality classification, waveform and metrics |

---

# 🔌 API Reference

### Health Check

```http
GET /
```

Response:

```json
{
  "status": "ok",
  "message": "PPG Signal Quality API is running."
}
```

### Prediction

```http
POST /predict
```

Request:

```json
{
  "signal": [512.3, 513.1, 514.2, 515.0],
  "fs": 30.0
}
```

Response contains:

```text
quality
sqi
confidence
features
```

---

# 🐳 Docker

The FastAPI backend is containerized using Docker.

### Docker Image

```text
cheerychuckle07/ppg-backend:latest
```

### Build

```bash
docker build -t ppg-backend .
```

### Run

```bash
docker run -d \
  --name ppg-backend-container \
  -p 8000:8000 \
  ppg-backend
```

Local API:

```text
http://localhost:8000
```

The Docker image contains only the backend runtime and required ML/DSP dependencies. Large datasets, development files, mobile code, and local environment files are excluded through `.dockerignore`.

---

# ☁️ Deployment

### Backend

| Component          | Platform          |
| ------------------ | ----------------- |
| Containerization   | Docker            |
| Container Registry | Docker Hub        |
| Deployment         | Render            |
| API Framework      | FastAPI + Uvicorn |
| CI/CD              | GitHub Actions    |

### Production API

```text
https://ppg-backend-8kc7.onrender.com
```

Deployment flow:

```text
Git Push
   ↓
GitHub Actions
   ↓
Automated Tests
   ↓
Docker Build
   ↓
Docker Hub
   ↓
Render
   ↓
FastAPI Container
```

The mobile application communicates with the deployed backend through the REST API.

---

# 🧪 Testing

The backend uses **Pytest** and FastAPI's `TestClient`.

Run tests locally:

```bash
python -m pytest
```

The CI pipeline automatically executes the test suite before publishing the Docker image.

---

# 🚀 Local Development

## Backend

Clone the repository:

```bash
git clone https://github.com/Rajkamal08/PPG-Signal-Quality-Assessment.git
cd PPG-Signal-Quality-Assessment
```

Create a virtual environment:

```bash
python -m venv venv
```

### Windows

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the backend:

```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

---

## Mobile App

Because the application uses custom Kotlin Native Modules, it requires a native React Native Android environment and cannot run through Expo Go.

```bash
cd mobile
npm install
```

Connect an Android device and forward the backend port:

```bash
adb reverse tcp:8000 tcp:8000
```

Run the application:

```bash
npx react-native run-android
```

---

# 📁 Project Structure

```text
PPG-Signal-Quality-Assessment/
│
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI/CD
│
├── backend/
│   ├── __init__.py
│   └── main.py                   # FastAPI application
│
├── mobile/                        # React Native application
│   ├── android/                   # Native Android/Kotlin code
│   └── src/
│       ├── components/            # Reusable components
│       ├── context/               # Theme provider
│       ├── screens/               # Application screens
│       └── services/              # API integration
│
├── models/                        # Trained ML models
│
├── notebooks/                     # ML and DSP experiments
│
├── src/                           # Signal processing modules
│
├── tests/
│   └── test_main.py               # Backend tests
│
├── predict.py                     # Prediction pipeline
├── requirements.txt               # Development dependencies
├── requirements-docker.txt        # Docker runtime dependencies
├── Dockerfile                     # Backend container definition
├── .dockerignore                  # Docker build exclusions
└── README.md
```

---

# 🔬 Machine Learning Pipeline

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
      │
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
      │
      ├── Good
      ├── Moderate
      └── Poor
      │
      ▼
SQI + Confidence
```

---

# 🗃️ Dataset

The project uses the **Brno University of Technology Smartphone PPG Database (BUT-PPG 2.0.0)** for signal processing and model development.

The dataset is not included in this repository.

---

# 🛠️ Tech Stack

| Layer             | Technology                  |
| ----------------- | --------------------------- |
| Mobile            | React Native                |
| Native Hardware   | Kotlin                      |
| Backend           | Python, FastAPI, Uvicorn    |
| Machine Learning  | Scikit-learn, Random Forest |
| Signal Processing | SciPy, NumPy, Pandas        |
| Visualization     | React Native SVG            |
| Storage           | AsyncStorage                |
| Testing           | Pytest                      |
| Containerization  | Docker                      |
| CI/CD             | GitHub Actions              |
| Registry          | Docker Hub                  |
| Deployment        | Render                      |
| Version Control   | Git, GitHub                 |

---

# 🔗 Project Links

* **GitHub:** [https://github.com/Rajkamal08/PPG-Signal-Quality-Assessment](https://github.com/Rajkamal08/PPG-Signal-Quality-Assessment)
* **Live API:** [https://ppg-backend-8kc7.onrender.com](https://ppg-backend-8kc7.onrender.com)
* **Docker Image:** `cheerychuckle07/ppg-backend:latest`
* **Portfolio:** [https://rajkamal08-portfolio.vercel.app](https://rajkamal08-portfolio.vercel.app)

---

# 📄 Research

**PPG Signal Quality Assessment & Artifact Detection for Smartphone Monitoring**

Published on **TechRxiv (IEEE-supported platform), 2025**.

---

# 👨‍💻 Author

**Raj Kamal Mehta**

Computer Science & Engineering
Full-Stack • React Native • Backend • Machine Learning

---

> **Transforming everyday smartphones into accessible tools for reliable PPG signal quality assessment.**

```
```
