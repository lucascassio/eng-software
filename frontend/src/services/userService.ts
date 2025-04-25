import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5185/api';

interface RegisterData {
  Name: string;
  Email: string;
  Course: string;
  Password: string;
}

interface LoginData {
  Email: string;
  Password: string;
}

export const AuthService = {
  async register(userData: RegisterData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/users`, userData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Erro ao cadastrar usuário');
      }
      throw new Error('Erro desconhecido ao cadastrar');
    }
  },

  async authenticate(loginData: LoginData): Promise<string> { // Agora retorna direto a string do token
    try {
      const response = await axios.post(`${API_BASE_URL}/users/authenticate`, loginData);
      
      const token = response.data;
      
      if (!token) {
        throw new Error('Token não recebido na resposta');
      }
      
      Cookies.set('authToken', token);
      
      return token;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Erro ao autenticar');
      }
      throw new Error('Erro desconhecido ao autenticar');
    }
  },

  getToken(): string | undefined {
    return Cookies.get('authToken');
  },

  logout(): void {
    Cookies.remove('authToken');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
};

// Configura o axios para incluir o token automaticamente
axios.interceptors.request.use(config => {
  const token = AuthService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});