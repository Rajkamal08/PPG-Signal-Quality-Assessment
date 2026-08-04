import axios from 'axios';

// Connect to the live production server on Render
const API_URL = 'https://ppg-backend-8kc7.onrender.com/predict';

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
