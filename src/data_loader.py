import os
import wfdb
import numpy as np
import pandas as pd

class BUTPPGDataLoader:
    def __init__(self, data_dir):
        """
        Initialize the data loader with the path to the BUT PPG dataset.
        
        Args:
            data_dir (str): Path to 'brno-university-of-technology-smartphone-ppg-database-but-ppg-2.0.0'
        """
        self.data_dir = data_dir
        self.quality_df = None
        self.subject_info_df = None
        self._load_metadata()

    def _load_metadata(self):
        """Loads quality annotations and subject info into pandas DataFrames."""
        quality_path = os.path.join(self.data_dir, 'quality-hr-ann.csv')
        subject_path = os.path.join(self.data_dir, 'subject-info.csv')
        
        if os.path.exists(quality_path):
            self.quality_df = pd.read_csv(quality_path)
            self.quality_df['ID'] = self.quality_df['ID'].astype(str)
            self.quality_df.set_index('ID', inplace=True)
            
        if os.path.exists(subject_path):
            self.subject_info_df = pd.read_csv(subject_path)
            self.subject_info_df['ID'] = self.subject_info_df['ID'].astype(str)
            self.subject_info_df.set_index('ID', inplace=True)

    def get_all_record_ids(self):
        """Returns a list of all record IDs available in the dataset."""
        if self.quality_df is not None:
            return self.quality_df.index.tolist()
        return []

    def get_metadata(self, record_id):
        """
        Retrieves metadata (quality and subject info) for a specific record.
        
        Args:
            record_id (str): The recording ID (e.g., '100001').
            
        Returns:
            dict: Metadata dictionary.
        """
        record_id = str(record_id)
        metadata = {}
        
        if self.quality_df is not None and record_id in self.quality_df.index:
            metadata.update(self.quality_df.loc[record_id].to_dict())
            
        if self.subject_info_df is not None and record_id in self.subject_info_df.index:
            metadata.update(self.subject_info_df.loc[record_id].to_dict())
            
        return metadata

    def load_signals(self, record_id, load_ecg=False):
        """
        Loads the PPG and optionally ECG signals for a given record ID.
        
        The BUT PPG dataset encodes the 10s recordings strangely: 
        PPG has 300 channels at 30Hz for 1 sample, effectively making it a 300-length array.
        ECG has 10000 channels at 1000Hz for 1 sample.
        
        Args:
            record_id (str): The recording ID.
            load_ecg (bool): Whether to load the ECG signal (default False as it is slow).
            
        Returns:
            tuple: (ppg_signal, ecg_signal, ppg_fs, ecg_fs)
        """
        record_id = str(record_id)
        record_dir = os.path.join(self.data_dir, record_id)
        
        ppg_path = os.path.join(record_dir, f"{record_id}_PPG")
        ecg_path = os.path.join(record_dir, f"{record_id}_ECG")
        
        ppg_signal, ppg_fs = None, 30 # default
        ecg_signal, ecg_fs = None, 1000 # default
        
        if os.path.exists(f"{ppg_path}.hea") and os.path.exists(f"{ppg_path}.dat"):
            record_ppg = wfdb.rdrecord(ppg_path)
            
            # Handle shape inconsistencies in the dataset
            # Some recordings are (1, N) and some are (N, 3) for RGB
            if record_ppg.p_signal.shape[0] == 1:
                ppg_signal = record_ppg.p_signal.flatten()
            elif record_ppg.p_signal.shape[1] >= 2:
                # If RGB (3 channels), green channel (index 1) is standard for PPG
                ppg_signal = record_ppg.p_signal[:, 1]
            else:
                ppg_signal = record_ppg.p_signal[:, 0].flatten()
                
            ppg_fs = record_ppg.fs
            
        if load_ecg and os.path.exists(f"{ecg_path}.hea") and os.path.exists(f"{ecg_path}.dat"):
            record_ecg = wfdb.rdrecord(ecg_path)
            ecg_signal = record_ecg.p_signal[0]
            ecg_fs = record_ecg.fs
            
        return ppg_signal, ecg_signal, ppg_fs, ecg_fs
