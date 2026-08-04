import axios from 'axios';

// Since you are connected via USB, we will use localhost and ADB reverse to bypass Windows Firewall
const API_URL = 'http://127.0.0.1:8000/predict';

export const predictSignalQuality = async (signalArray, fs = 30) => {
  try {
    const response = await axios.post(API_URL, {
      signal: signalArray,
      fs: fs
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error.message);
    if (error.response) {
      return { 
        quality: 'Error', 
        error: error.response.data.detail || 'Server returned an error' 
      };
    }
    return { quality: 'Error', error: 'Could not connect to the backend server. Check your IP address.' };
  }
};
