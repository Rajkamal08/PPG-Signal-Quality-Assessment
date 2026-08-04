import numpy as np
from scipy.stats import kurtosis, skew, median_abs_deviation, entropy, iqr
from scipy.signal import find_peaks, welch, peak_widths, peak_prominences

def compute_spectral_entropy(psd, normalize=False):
    """Computes spectral entropy from the Power Spectral Density (PSD)."""
    psd_norm = psd / np.sum(psd)
    se = entropy(psd_norm)
    if normalize:
        se /= np.log2(len(psd_norm))
    return se

def extract_features(signal, fs=30):
    """
    Extracts 30+ advanced features from a given PPG signal segment.
    """
    features = {}
    
    # --- 1. Statistical (Time Domain) ---
    features['mean'] = np.mean(signal)
    features['median'] = np.median(signal)
    features['variance'] = np.var(signal)
    features['std_dev'] = np.std(signal)
    features['rms'] = np.sqrt(np.mean(signal**2))
    features['mad'] = median_abs_deviation(signal)
    features['iqr'] = iqr(signal)
    features['range'] = np.ptp(signal)
    features['cv'] = features['std_dev'] / features['mean'] if features['mean'] != 0 else 0
    features['kurtosis'] = kurtosis(signal)
    features['skewness'] = skew(signal)
    features['energy'] = np.sum(signal**2)
    
    # Zero crossing rate
    zero_crossings = np.where(np.diff(np.sign(signal)))[0]
    features['zcr'] = len(zero_crossings) / len(signal)
    
    # SNR will be calculated in the frequency domain section below

    # --- 2. Morphological (Peak Analysis) ---
    # Find systolic peaks
    peaks, properties = find_peaks(signal, distance=int(fs*0.5)) # Minimum 0.5s between peaks
    features['peak_count'] = len(peaks)
    
    if len(peaks) > 1:
        peak_intervals = np.diff(peaks)
        features['mean_peak_interval'] = np.mean(peak_intervals)
        features['std_peak_interval'] = np.std(peak_intervals)
        features['rmssd'] = np.sqrt(np.mean(np.diff(peak_intervals)**2)) # Pulse variability
    else:
        features['mean_peak_interval'] = 0
        features['std_peak_interval'] = 0
        features['rmssd'] = 0

    if len(peaks) > 0:
        prominences = peak_prominences(signal, peaks)[0]
        widths = peak_widths(signal, peaks, rel_height=0.5)[0]
        
        features['mean_peak_height'] = np.mean(signal[peaks])
        features['std_peak_height'] = np.std(signal[peaks])
        features['mean_prominence'] = np.mean(prominences)
        features['std_prominence'] = np.std(prominences)
        features['mean_peak_width'] = np.mean(widths)
        features['std_peak_width'] = np.std(widths)
    else:
        features['mean_peak_height'] = 0
        features['std_peak_height'] = 0
        features['mean_prominence'] = 0
        features['std_prominence'] = 0
        features['mean_peak_width'] = 0
        features['std_peak_width'] = 0

    # --- 3. Frequency Domain (Spectral) ---
    freqs, psd = welch(signal, fs, nperseg=len(signal))
    
    # Dominant Frequency
    if len(psd) > 0:
        features['dominant_freq'] = freqs[np.argmax(psd)]
        features['spectral_entropy'] = compute_spectral_entropy(psd)
        
        # Band Powers
        band_low = np.where((freqs >= 0.5) & (freqs < 1.5))[0]
        band_mid = np.where((freqs >= 1.5) & (freqs < 3.0))[0]
        band_high = np.where((freqs >= 3.0) & (freqs <= 8.0))[0]
        
        features['power_low'] = np.sum(psd[band_low]) if len(band_low) > 0 else 0
        features['power_mid'] = np.sum(psd[band_mid]) if len(band_mid) > 0 else 0
        features['power_high'] = np.sum(psd[band_high]) if len(band_high) > 0 else 0
        
        total_power = np.sum(psd)
        features['power_ratio'] = features['power_low'] / total_power if total_power > 0 else 0
        
        # Proper PSD-based SNR: (Power in 0.5-4.0 Hz) / (Power outside 0.5-4.0 Hz)
        cardiac_band = np.where((freqs >= 0.5) & (freqs <= 4.0))[0]
        signal_power = np.sum(psd[cardiac_band]) if len(cardiac_band) > 0 else 0
        noise_power = total_power - signal_power
        
        if noise_power > 0 and signal_power > 0:
            features['snr'] = 10 * np.log10(signal_power / noise_power)
        else:
            features['snr'] = 0.0
            
    else:
        features['dominant_freq'] = 0
        features['spectral_entropy'] = 0
        features['power_low'] = 0
        features['power_mid'] = 0
        features['power_high'] = 0
        features['power_ratio'] = 0
        features['snr'] = 0.0
        
    return features
