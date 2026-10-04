from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import sys
import os
import json
import datetime
import numpy as np
import matplotlib.pyplot as plt

# Ensure the parent directory is in the python path to import predict.py
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(project_root)

from predict import predict_signal_quality
from src.preprocessing import bandpass_filter

app = FastAPI(title="PPG Signal Quality API", version="1.0")

# Allow requests from the React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SignalPayload(BaseModel):
    signal: List[float]
    fs: float = 30.0

@app.api_route("/", methods=["GET", "HEAD"])
def health_check():
    return {"status": "ok", "message": "PPG Signal Quality API is running."}

@app.post("/predict")
def predict_sqi(payload: SignalPayload):
    if len(payload.signal) < 30:
        raise HTTPException(status_code=400, detail="Signal too short. Minimum 30 samples required.")
        
    if all(x == 0.0 for x in payload.signal):
        return {"quality": "Poor", "sqi": 0.0, "confidence": 1.0, "error": "Signal is completely flat (all zeros)."}
        
    # --- DIAGNOSTIC PRINTS FOR VERIFICATION ---
    print("\n--- NEW PPG MEASUREMENT ---")
    print(f"Samples: {len(payload.signal)}")
    print(f"Sampling rate: {payload.fs:.2f}")
    print("First 10 samples:")
    for val in payload.signal[:10]:
        print(f"  {val}")
    # ------------------------------------------

    result = predict_signal_quality(payload.signal, fs=payload.fs)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
        
    # --- DIAGNOSTIC PRINTS FOR FEATURES ---
    print("\n--- EXTRACTED FEATURES ---")
    if "features" in result:
        features = result["features"]
        for key, val in features.items():
            print(f"{key}: {val}")
    print(f"\nFINAL QUALITY: {result.get('quality')} (SQI: {result.get('sqi')})")
    print("----------------------------\n")
    # --------------------------------------

    # --- SAVE DATA & PLOT ---
    try:
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        quality_folder = result.get("quality", "Unknown")
        save_dir = os.path.join(project_root, "captured_signals", timestamp)
        os.makedirs(save_dir, exist_ok=True)
        
        # Save JSONs
        with open(os.path.join(save_dir, "prediction.json"), "w") as f:
            json.dump(result, f, indent=4)
            
        # Re-filter for saving and plotting
        signal_arr = np.array(payload.signal)
        filtered_arr = bandpass_filter(signal_arr, fs=payload.fs)
        
        # Save CSVs
        np.savetxt(os.path.join(save_dir, "raw.csv"), signal_arr, delimiter=",")
        np.savetxt(os.path.join(save_dir, "filtered.csv"), filtered_arr, delimiter=",")
        
        # Generate Plot
        plt.figure(figsize=(10, 6))
        
        plt.subplot(2, 1, 1)
        plt.title(f"Raw PPG Signal (Quality: {quality_folder}, SQI: {result.get('sqi')})")
        plt.plot(signal_arr, color='gray')
        plt.ylabel("Intensity")
        plt.grid(True, alpha=0.3)
        
        plt.subplot(2, 1, 2)
        plt.title("Bandpass Filtered Signal (0.5 - 4.0 Hz)")
        plt.plot(filtered_arr, color='red')
        plt.xlabel("Samples")
        plt.ylabel("Amplitude")
        plt.grid(True, alpha=0.3)
        
        plt.tight_layout()
        plt.savefig(os.path.join(save_dir, "waveform.png"), dpi=150)
        plt.close()
        
        print(f"✅ Data archived at: {save_dir}")
        
    except Exception as e:
        print(f"⚠️ Failed to save data/plot: {e}")
    # ------------------------

    return result
