// src/api/mutator/instance.ts
import Axios, { type AxiosRequestConfig } from 'axios';

export const AXIOS_INSTANCE = Axios.create({
  baseURL: import.meta.env.VITE_CORE_API_URL,
});

export const customInstance = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const oidcKey = `oidc.user:${import.meta.env.VITE_COGNITO_AUTHORITY}:${import.meta.env.VITE_COGNITO_CLIENT_ID}`;
    const oidcData = sessionStorage.getItem(oidcKey);
    if (oidcData) {
      const user = JSON.parse(oidcData);
      const token = user.access_token;
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }
  } catch (error) {
    console.error('No se pudo adjuntar el token JWT:', error);
  }

  try {
    const response = await AXIOS_INSTANCE({ ...config });
    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 403) {
      // Disparamos evento global para abrir el modal de desbloqueo
      window.dispatchEvent(new CustomEvent('account-blocked'));
    }
    throw error;
  }
};