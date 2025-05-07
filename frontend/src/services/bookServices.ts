import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:5185/api';

export interface Book {
  bookId: number;
  title: string;
  author: string;
  genre: string;
  publisher: string;
  pages: number;
  year: number;
  sinopse?: string;
  isAvailable: boolean;
  ownerId: number;
  registrationDate: string;
  coverImageUrl?: string;
}

export interface BookRequestDTO {
  title: string;
  author: string;
  genre: string;
  publisher: string;
  pages: number;
  year: number;
  sinopse?: string;
  coverImage?: File;
}

export interface BookUpdateDTO {
  title?: string;
  author?: string;
  genre?: string;
  publisher?: string;
  pages?: number;
  year?: number;
  sinopse?: string;
  isAvailable?: boolean;
  coverImage?: File;
}

export const BookService = {
  async getBooksByUserId(userId: number): Promise<Book[]> {
    try {
      const response = await axios.get<Book[]>(`${API_BASE_URL}/books/user/${userId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data || 'Erro ao buscar seus livros');
      }
      throw new Error('Erro desconhecido ao buscar livros');
    }
  },

  async getBookById(id: number): Promise<Book> {
    const response = await axios.get<Book>(`${API_BASE_URL}/books/${id}`);
    return response.data;
  },

  async getAllBooks(): Promise<Book[]> {
    const response = await axios.get<Book[]>(`${API_BASE_URL}/books`);
    return response.data;
  },

  async createBook(data: BookRequestDTO): Promise<Book> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('author', data.author);
    formData.append('genre', data.genre);
    formData.append('publisher', data.publisher);
    formData.append('pages', data.pages.toString());
    formData.append('year', data.year.toString());
    if (data.sinopse) formData.append('sinopse', data.sinopse);
    if (data.coverImage) formData.append('coverImage', data.coverImage);

    const response = await axios.post<Book>(
      `${API_BASE_URL}/books`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  async updateBook(id: number, bookData: BookUpdateDTO): Promise<Book> {
    const formData = new FormData();
    if (bookData.title) formData.append('title', bookData.title);
    if (bookData.author) formData.append('author', bookData.author);
    if (bookData.genre) formData.append('genre', bookData.genre);
    if (bookData.publisher) formData.append('publisher', bookData.publisher);
    if (bookData.pages != null) formData.append('pages', bookData.pages.toString());
    if (bookData.year != null) formData.append('year', bookData.year.toString());
    if (bookData.sinopse) formData.append('sinopse', bookData.sinopse);
    if (bookData.isAvailable != null) formData.append('isAvailable', String(bookData.isAvailable));
    if (bookData.coverImage) formData.append('coverImage', bookData.coverImage);

    const response = await axios.put<Book>(
      `${API_BASE_URL}/books/${id}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  async deleteBook(id: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/books/${id}`);
  }
};

// Configura o axios para incluir o token automaticamente
axios.interceptors.request.use(config => {
  const token = Cookies.get('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
