// Import Axios library (ensure you have it installed: npm install axios or yarn add axios)
import axios from 'axios';

// --- Configuration ---
const BASE_URL = 'https://109.207.101.139'; // Replace with your API's base URL
const TIMEOUT_DURATION = 15000; // 15 seconds
const MAX_RETRIES = 0; // Maximum number of retries for failed requests (optional)
const RETRY_DELAY = 1000; // Delay between retries in milliseconds (optional)

// --- Create Axios Instance ---
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_DURATION,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Request Interceptor ---
// This interceptor runs before each request is sent.
axiosInstance.interceptors.request.use(
  (config) => {
    // --- Authentication ---
    // Example: Add an authorization token to headers if available
    const token = JSON.parse(localStorage.getItem('token')); // Or get it from your auth context/store
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // Must return the config object, otherwise the request will be blocked
  },
  (error) => {
    console.error('Request Setup Error:', error);
    return Promise.reject(error); // Propagate the error
  }
);

// --- Response Interceptor ---
// This interceptor runs after a response is received.
axiosInstance.interceptors.response.use(
  (response) => {
    // --- Successful Response Handling (2xx status codes) ---
    // console.log('Response Received:', JSON.stringify(response.data, null, 2));

    // --- Data Transformation ---
    // You can transform the response data here if needed
    // return response.data; // Often, you might want to directly return the data object

    return response; // Return the full response object
  },
  async (error) => {
    // --- Error Response Handling (non-2xx status codes and network errors) ---
    const originalRequest = error.config; // The original request configuration

    // --- Network Error or Timeout ---
    if (error.code === 'ECONNABORTED' || !error.response) {
      console.error('Network Error or Timeout:', error.message);
      // You could implement a retry mechanism here (see example below)
      // Or display a generic network error message to the user
      // Example: showToast('Network error. Please check your connection.');
      return Promise.reject({
        ...error,
        message: 'Network error or request timed out. Please try again.',
        isNetworkError: true,
      });
    }

    // --- HTTP Error Status Codes ---
    const { status, data } = error.response;

    switch (status) {
      case 400: // Bad Request
        console.error('Bad Request:', data);
        // Example: showToast(data.message || 'Invalid request.');
        break;
      case 401: // Unauthorized
        console.error('Unauthorized:', data);
        // Example: Redirect to login page or refresh token
        // if (originalRequest.url !== '/auth/refresh-token') { // Avoid infinite loops
        //   try {
        //     // const newAccessToken = await refreshToken();
        //     // axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        //     // originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        //     // return axiosInstance(originalRequest); // Retry the original request with new token
        //   } catch (refreshError) {
        //     // console.error('Token refresh failed:', refreshError);
        //     // window.location.href = '/login'; // Redirect to login
        //     return Promise.reject(refreshError);
        //   }
        // }
        // showToast('Session expired. Please log in again.');
        // window.location.href = '/login';
        break;
      case 403: // Forbidden
        console.error('Forbidden:', data);
        // Example: showToast('You do not have permission to perform this action.');
        break;
      case 404: // Not Found
        console.error('Resource Not Found:', data);
        // Example: showToast('The requested resource was not found.');
        break;
      case 429: // Too Many Requests
        console.error('Too Many Requests:', data);
        // Example: showToast('Too many requests. Please try again later.');
        break;
      case 500: // Internal Server Error
      case 502: // Bad Gateway
      case 503: // Service Unavailable
      case 504: // Gateway Timeout
        console.error(`Server Error (${status}):`, data);
        // Example: showToast('A server error occurred. Please try again later.');
        break;
      default:
        console.error(`Unhandled HTTP Error (${status}):`, data);
      // Example: showToast(`An unexpected error occurred: ${status}`);
    }

    // --- Optional: Retry Mechanism for specific errors (e.g., 5xx or network errors) ---
    // Be cautious with retries to avoid overwhelming the server or creating infinite loops.
    if (
      (error.isNetworkError || (status >= 500 && status <= 599)) &&
      (!originalRequest._retryCount || originalRequest._retryCount < MAX_RETRIES)
    ) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;
      console.log(`Retrying request, attempt ${originalRequest._retryCount}/${MAX_RETRIES}...`);

      // Create a promise to delay the retry
      const delayRetry = new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, RETRY_DELAY * originalRequest._retryCount); // Exponential backoff can also be used
      });

      // After the delay, retry the request
      return delayRetry.then(() => axiosInstance(originalRequest));
    }


    // --- Custom Error Object ---
    // It's good practice to return a consistent error object structure.
    const customError = {
      message: data?.message || error.message || 'An unexpected error occurred.',
      status: status || null,
      data: data || null,
      originalError: error, // Keep the original error for deeper debugging if needed
      isApiClientError: true, // Flag to identify errors from this client
    };

    return Promise.reject(customError); // Propagate the modified error
  }
);

// --- Helper Functions (Example) ---
// You might have UI functions to show error messages
// const showToast = (message, type = 'error') => {
//   // Your toast notification logic here (e.g., using a library like react-toastify)
//   console.log(`[${type.toUpperCase()}] Toast: ${message}`);
// };

// --- How to use the axiosInstance ---
/*
async function fetchData() {
  try {
    const response = await axiosInstance.get('/users');
    console.log('Users:', response.data);
    return response.data;
  } catch (error) {
    if (error.isApiClientError) {
      // Handle errors processed by our interceptor
      console.error('API Client Error:', error.message);
      // showToast(error.message);
      if (error.status === 401) {
        // Specific handling for unauthorized
      }
    } else {
      // Handle other types of errors (e.g., programming errors in the try block)
      console.error('Generic Error in fetchData:', error);
    }
    // Optionally re-throw or return a default value
    // throw error;
  }
}

async function createUser(userData) {
  try {
    const response = await axiosInstance.post('/users', userData);
    console.log('User created:', response.data);
    // showToast('User created successfully!', 'success');
    return response.data;
  } catch (error) {
    console.error('Failed to create user:', error.message);
    // showToast(error.message || 'Failed to create user.');
    // throw error;
  }
}

fetchData();
// createUser({ name: 'John Doe', email: 'john.doe@example.com' });
*/

// Export the configured Axios instance to use it in other parts of your application
export default axiosInstance;

