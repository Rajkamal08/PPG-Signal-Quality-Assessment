import numpy as np
from scipy.signal import butter, filtfilt, detrend

def bandpass_filter(signal, fs=30, lowcut=0.5, highcut=8.0, order=4):
    """
    Apply a Butterworth bandpass filter to the PPG signal.
    """
    nyq = 0.5 * fs
    low = lowcut / nyq
    high = highcut / nyq
    b, a = butter(order, [low, high], btype='band')
    
    # We require padlen to be less than the length of the signal
    # If the signal is too short (e.g., length < 27), this will fail.
    # We assume the caller has checked len(signal) >= 30.
    filtered_signal = filtfilt(b, a, signal)
    return filtered_signal

def normalize_signal(signal):
    """
    Apply Z-score normalization to the signal.
    """
    mean_val = np.mean(signal)
    std_val = np.std(signal)
    
    if std_val == 0:
        return np.zeros_like(signal)
        
    normalized = (signal - mean_val) / std_val
    return normalized

def preprocess_ppg(signal, fs=30):
    """
    Complete preprocessing pipeline for a single PPG signal:
    1. Bandpass filter
    2. Detrend (remove linear trend / baseline wander)
    3. Z-score Normalize
    4. Reject bad windows (return None if flatline)
    
    Args:
        signal (np.array): Raw PPG signal array.
        fs (int): Sampling frequency in Hz.
        
    Returns:
        np.array or None: Preprocessed signal, or None if the signal is invalid/flat.
    """
    if len(signal) < 30:
        return None
        
    # Check for flatline or extreme NaN values
    if np.isnan(signal).any() or np.std(signal) < 1e-6:
        return None
        
    # 1. Filter
    filtered = bandpass_filter(signal, fs)
    
    # 2. Detrend
    detrended = detrend(filtered, type='linear')
    
    # We no longer normalize here! We normalize the feature matrix later.
    return detrended
