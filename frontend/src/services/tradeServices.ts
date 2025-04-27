// src/services/tradeServices.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5185/api';

interface Trade {
  tradeId: number;
  offeredBookTitle: string;
  targetBookTitle: string;
  status: string;
  requesterId: number;
  ownerId: number;
  requestDate: string;
}

export const TradeService = {
  async getTradesByUserId(userId: number): Promise<Trade[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/trades/user/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Erro ao buscar suas trocas');
      }
      throw new Error('Erro desconhecido ao buscar suas trocas');
    }
  }
};

// Configura o axios para incluir o token automaticamente (igual seu BookService)
axios.interceptors.request.use(config => {
  const token = Cookies.get('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
