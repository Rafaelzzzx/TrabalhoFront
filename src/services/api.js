import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001', // Coloque aqui a porta onde SUA API está rodando
});

export default api;