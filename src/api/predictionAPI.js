import axios from 'axios';

const MODEL_API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

const predictionApiClient = axios.create({
    baseURL: MODEL_API_URL,
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});

const PredictionAPI = {
    predict: async (formData) => {
        try {
            const response = await predictionApiClient.post('/predict', formData);
            return response.data;
        } catch (error) {
            if (error.response) {
                console.error(`Prediction failed: ${error.response.status} - ${error.response.data?.error || 'Unknown error'}`);
            } else if (error.request) {
                console.error('No response received from prediction server');
            } else {
                console.error(`Request error: ${error.message}`);
            }
            throw error;
        }
    },
};

export default PredictionAPI;