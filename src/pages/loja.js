import React, { useEffect, useState } from 'react';
import styles from '../styles/Loja.module.css';
import api from '../services/api'; // Importamos a configuração do axios

import {
  FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiUserCheck
} from 'react-icons/fi';

const Loja = () => {
  // 1. Estados para guardar os dados que vêm da API
  const [dashboardData, setDashboardData] = useState({
    totalRealizados: 0,
    valorTotal: 0,
    totalPendentes: 0
  });
  const [pedidos, setPedidos] = useState([]);

  // 2. useEffect: Executa quando a tela carrega
  useEffect(() => {
    // Função para buscar dados dos Cards
    async function fetchDashboardData() {
      try {
        // ATENÇÃO: Ajuste '/dashboard/resumo' para a rota real da sua API
        const response = await api.get('/dashboard/resumo');
        setDashboardData(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      }
    }

    // Função para buscar a lista de Pedidos
    async function fetchPedidos() {
      try {
        // ATENÇÃO: Ajuste '/pedidos' para a rota real da sua API
        const response = await api.get('/pedidos');
        setPedidos(response.data); // Assume que a API retorna um array de pedidos
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
      }
    }

    fetchDashboardData();
    fetchPedidos();
  }, []);

  return (
    <div className={styles['dashboard-container']}>

      {/* Sidebar mantida igual... */}
      <nav className={styles.sidebar}>
         {/* ... seus itens de menu ... */}
         <ul>
          <li className={styles.active}><FiGrid size={20} /><span>Dashboard</span></li>
          <li><FiUsers size={20} /><span>Fornecedores</span></li>
          {/* DICA: Esses botões precisam levar para as outras páginas de cadastro  */}
        </ul>
      </nav>

      <main className={styles['main-content']}>
        <header className={styles.header}>
          <h1>NOME DA LOJA</h1>
          <div className={styles['profile-area']}>
            <FiUserCheck size={24} />
            <span>Minha Loja</span>
          </div>
        </header>

        {/* 3. CARDS COM DADOS REAIS */}
        <section className={styles['dashboard-cards']}>
          <div className={styles.card}>
            <h3>Pedidos Realizados</h3>
            {/* Exibe o dado do estado, não mais o número fixo */}
            <p>{dashboardData.totalRealizados}</p>
          </div>
          <div className={styles.card}>
            <h3>Valor Total Comprado</h3>
            {/* Formatação de dinheiro */}
            <p>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dashboardData.valorTotal)}</p>
          </div>
          <div className={styles.card}>
            <h3>Pedidos Pendentes</h3>
            <p>{dashboardData.totalPendentes}</p>
          </div>
        </section>

        {/* 4. TABELA COM DADOS REAIS */}
        <section className={styles['orders-table-section']}>
          <h2>Últimos Pedidos</h2>
          <table className={styles['orders-table']}>
            <thead>
              <tr>
                <th>Nº Do Pedido</th>
                <th>Fornecedor</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Mapeia (loop) os pedidos vindos da API */}
              {pedidos.map((pedido) => (
                <tr key={pedido.id}>
                  <td>{pedido.numeroPedido || pedido.id}</td>
                  <td>{pedido.fornecedorNome}</td>
                  <td>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.valor)}</td>
                  <td>{pedido.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

      </main>
    </div>
  );
};

export default Loja;