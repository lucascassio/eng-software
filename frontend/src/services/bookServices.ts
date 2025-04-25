// src/services/bookService.ts
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
    sinopse?: string;
    isAvailable: boolean;
    ownerId: number;
    registrationDate: string;
  }
  
  interface BookRequestDTO {
    title: string;
    author: string;
    genre: string;
    publisher: string;
    year: number;
    pages: number;
    sinopse?: string;
  }
  
  interface BookUpdateRequestDTO {
    title?: string;
    author?: string;
    genre?: string;
    publisher?: string;
    year?: number;
    pages?: number;
    sinopse?: string;
    isAvailable?: boolean; // Agora em camelCase
  }

export const BookService = {
  async getAllBooks(): Promise<Book[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/books`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Erro ao buscar livros');
      }
      throw new Error('Erro desconhecido ao buscar livros');
    }
  },

  async getBookById(id: number): Promise<Book> {
    try {
      const response = await axios.get(`${API_BASE_URL}/books/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Livro não encontrado');
      }
      throw new Error('Erro desconhecido ao buscar livro');
    }
  },

  async getBooksByGenre(genre: string): Promise<Book[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/books/genre/${genre}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Erro ao buscar livros por gênero');
      }
      throw new Error('Erro desconhecido ao buscar livros por gênero');
    }
  },

  async getBooksByAuthor(author: string): Promise<Book[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/books/author/${author}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Erro ao buscar livros por autor');
      }
      throw new Error('Erro desconhecido ao buscar livros por autor');
    }
  },

  async getBooksByPublisher(publisher: string): Promise<Book[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/books/publisher/${publisher}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Erro ao buscar livros por editora');
      }
      throw new Error('Erro desconhecido ao buscar livros por editora');
    }
  },

  async getBooksByYear(year: number): Promise<Book[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/books/year/${year}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Erro ao buscar livros por ano');
      }
      throw new Error('Erro desconhecido ao buscar livros por ano');
    }
  },

  async getBookByTitle(title: string): Promise<Book[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/books/title/${title}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Erro ao buscar livro por título');
      }
      throw new Error('Erro desconhecido ao buscar livro por título');
    }
  },

  async createBook(bookData: BookRequestDTO): Promise<Book> {
    try {
      const response = await axios.post(`${API_BASE_URL}/books`, bookData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Erro ao criar livro');
      }
      throw new Error('Erro desconhecido ao criar livro');
    }
  },

  async updateBook(id: number, bookData: BookUpdateRequestDTO): Promise<void> {
    try {
      await axios.put(`${API_BASE_URL}/books/${id}`, bookData);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Erro ao atualizar livro');
      }
      throw new Error('Erro desconhecido ao atualizar livro');
    }
  },

  async deleteBook(id: number): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/books/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Erro ao deletar livro');
      }
      throw new Error('Erro desconhecido ao deletar livro');
    }
  },

  async showInterest(bookId: number): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/books/${bookId}/interest`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Erro ao registrar interesse');
      }
      throw new Error('Erro desconhecido ao registrar interesse');
    }
  }
};

// Configura o axios para incluir o token automaticamente
axios.interceptors.request.use(config => {
  const token = Cookies.get('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});