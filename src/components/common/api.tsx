import { AppClient } from '@/generated';
import axios from "axios";
import { message } from "antd";
import config from '../config.json';
// const BaseUrl = 'https://backoffice.mefiscal.co:8086';
//  const BaseUrl = 'http://localhost:4000';
//const BaseUrl = 'https://backoffice.digibits.info:8086';


let BaseUrl;

if (config.prod === 'yes') {
  BaseUrl = config.baseUrl+":"+config.port;
} else {
  BaseUrl = config.local+":"+config.localPort;
}

console.log("baseurl"+BaseUrl);
const token = sessionStorage.getItem('jwtToken');;


// const storedToken = sessionStorage.getItem('jwtToken');
// const storedUserId = localStorage.getItem('userId');
// if (storedToken) {
//   setUserID(storedToken);
// }

const api = new AppClient({
  BASE: BaseUrl,
  WITH_CREDENTIALS: true,
  HEADERS: {
    Authorization: `Bearer ${token}`,
  }
});

const rawApi = axios.create({
  withCredentials: true,
  baseURL: BaseUrl,
  timeout: 1000 * 40 // 40 seconds
});



// Add a request interceptor
rawApi.interceptors.request.use(
  (config) => {
    // Get the authentication token from your storage
    const token = window.sessionStorage.getItem('jwtToken');

    // Set the token in the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add a response interceptor
rawApi.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      // Handle 401 error here, e.g., refresh token or log the user out
      window.sessionStorage.removeItem('jwtToken');
      window.location.pathname = '/user/login';
      // Example: Refresh token logic
      // const refreshToken = localStorage.getItem('refreshToken'); // Get the refresh token
      // Send a request to refresh the access token and retry the failed request
      // const newAccessToken = await refreshAccessToken(refreshToken); // Implement this function
      // Update the token in storage
      // localStorage.setItem('authToken', newAccessToken);
      // Retry the failed request

      return rawApi(error.config);
    }
    return Promise.reject(error);
  },
);

export const updateAPIToken = () => {

  const token = sessionStorage.getItem('jwtToken');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  api.app.httpRequest.config.HEADERS = headers;
  rawApi.defaults.headers.common = headers;
}

export const ShowError = (error: any) => {
  let msg = error.body?.message
  if (msg == null) {
    msg = error.body
  }
  message.error(msg)
}

export { api, rawApi };

