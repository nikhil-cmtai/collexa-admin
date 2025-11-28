import axios from 'axios';

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_BASE_URL}`,
  withCredentials: true, // This is the crucial part!
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: Handle token expiration globally, e.g., redirect to login
      // window.location.href = '/login';
      console.error("Authentication Error: ", error.response.data);
    }
    return Promise.reject(error);
  }
);

export default apiClient;