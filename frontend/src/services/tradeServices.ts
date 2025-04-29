// src/services/tradeServices.ts

import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5185/api';

interface Book {
  bookId: number;
  title: string;
  author: string;
  genre: string;
  publisher: string;
  year: number;
  pages: number;
  sinopse?: string;
  isAvailable: boolean;
  ownerId: number;
  registrationDate: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  course: string;
  registrationDate: string;
  isActive: boolean;
}

export interface Trade {
  tradeId: number;
  requesterId: number;
  offeredBookId: number;
  targetBookId: number;
  createdAt: string;
  updatedAt: string;
  status: string;
  offeredBook: Book;
  targetBook: Book;
  requester: User;
}

export const TradeService = {
  // Buscar detalhes de uma troca específica
  async getTradeById(id: number): Promise<Trade> {
    try {
      const response = await axios.get(`${API_BASE_URL}/trades/${id}`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erro ao buscar troca');
    }
  },

  // Criar uma nova troca
  async createTrade(dto: { OfferedBookId: number; TargetBookId: number }): Promise<Trade> {
    try {
      const response = await axios.post(`${API_BASE_URL}/trades`, dto);
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erro ao criar troca');
    }
  },

  // Listar trocas feitas pelo usuário logado (solicitadas)
  async getMyRequests(): Promise<Trade[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/trades/requester`);
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erro ao buscar suas solicitações');
    }
  },

  // Listar trocas recebidas (para seus livros)
  async getReceivedRequests(): Promise<Trade[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/trades/received`);
      console.log('Resposta recebida:', response.data); // Debug
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar solicitações recebidas:', error); // Debug
      handleAxiosError(error, 'Erro ao buscar solicitações recebidas');
    }
  },

  // Atualizar livros de uma troca
  async updateTrade(id: number, dto: { OfferedBookId?: number; TargetBookId?: number }): Promise<Trade> {
    try {
      const response = await axios.put(`${API_BASE_URL}/trades/${id}`, dto);
      return response.data;
    } catch (error) {
      handleAxiosError(error, 'Erro ao atualizar troca');
    }
  },

  // Alterar status de uma troca (aceitar, recusar, cancelar, concluir)
  async changeStatus(id: number, status: string): Promise<Trade> {
    try {
        // Send a JSON object with a status property, not a raw string
        const response = await axios.patch(`${API_BASE_URL}/trades/${id}/status`, 
            { status: status },  // ← This is the key change
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        return response.data;
    } catch (error) {
        handleAxiosError(error, 'Erro ao alterar status da troca');
    }
}
};

// Função utilitária para tratar erros de forma padronizada
function handleAxiosError(error: unknown, defaultMessage: string): never {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data || defaultMessage;
    throw new Error(typeof message === 'string' ? message : defaultMessage);
  }
  throw new Error(defaultMessage);
}

// Configura o axios para sempre mandar o token automaticamente
axios.interceptors.request.use(config => {
  const token = Cookies.get('authToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
