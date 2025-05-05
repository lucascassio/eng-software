import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5185/api';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  course: string;
  registrationDate: string;
  isActive: boolean;
}

export interface RegisterData {
  Name: string;
  Email: string;
  Course: string;
  Password: string;
}

export interface LoginData {
  Email: string;
  Password: string;
}

export interface UpdateUserDTO {
  name: string;
  email: string;
  course: string;
  isActive: boolean;
}

export const UserService = {
  // Métodos de autenticação
  async register(userData: RegisterData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/users`, userData);
      console.log('Usuário cadastrado com sucesso:', response.data);
      return response.data;
    } catch (error) {
      throw new Error(
        axios.isAxiosError(error)
          ? error.response?.data || 'Erro ao cadastrar usuário'
          : 'Erro desconhecido ao cadastrar'
      );
    }
  },

  async authenticate(loginData: LoginData): Promise<string> {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/authenticate`, loginData);
      const token = response.data;

      if (!token) {
        throw new Error('Token não recebido na resposta');
      }

      Cookies.set('authToken', token);

      return token;
    } catch (error) {
      throw new Error(
        axios.isAxiosError(error)
          ? error.response?.data || 'Erro ao autenticar'
          : 'Erro desconhecido ao autenticar'
      );
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
  },

  async getUserById(id: number): Promise<UserProfile> {
    try {
      const response = await axios.get<UserProfile>(`${API_BASE_URL}/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(
        axios.isAxiosError(error)
          ? error.response?.data || 'Erro ao buscar usuário'
          : 'Erro desconhecido ao buscar usuário'
      );
    }
  },

  async updateUser(id: number, data: UpdateUserDTO): Promise<void> {
    try {
      await axios.put(`${API_BASE_URL}/users/${id}`, data);
    } catch (error) {
      throw new Error(
        axios.isAxiosError(error)
          ? error.response?.data || 'Erro ao atualizar usuário'
          : 'Erro desconhecido ao atualizar usuário'
      );
    }
  },

  async resetPassword(email: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/users/reset-password`, {
        Email: email,
        CurrentPassword: currentPassword,
        NewPassword: newPassword,
        ConfirmNewPassword: newPassword,
      });
      console.log('Senha redefinida com sucesso:', response.data);
    } catch (error) {
      throw new Error(
        axios.isAxiosError(error)
          ? error.response?.data || 'Erro ao redefinir senha'
          : 'Erro desconhecido ao redefinir senha'
      );
    }
  },

  async deleteUser(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/users/${id}`);
    } catch (error) {
      throw new Error(
        axios.isAxiosError(error)
          ? error.response?.data || 'Erro ao deletar usuário'
          : 'Erro desconhecido ao deletar usuário'
      );
    }
  },
};