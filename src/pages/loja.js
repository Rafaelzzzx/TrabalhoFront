import React, { useEffect, useState } from 'react';
import Link from 'next/link'; // Importante para os links do menu
import styles from '../styles/Loja.module.css';
// import api from '../services/api'; // Comentado temporariamente

import {
  FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiUserCheck
} from 'react-icons/fi';

const Loja = () => {
  // 1. Estados para guardar os dados
  const [dashboardData, setDashboardData] = useState({
    totalRealizados: 0,
    valorTotal: 0,
    totalPendentes: 0
  });
  const [pedidos, setPedidos] = useState([]);

  // 2. useEffect: Executa quando a tela carrega
  useEffect(() => {

    // --- MODO SIMULAÇÃO (Para a tela funcionar sem Back-end) ---

    // Dados falsos para os Cards
    setDashboardData({
      totalRealizados: 15,
      valorTotal: 1000.00,
      totalPendentes: 3
    });

    // Dados falsos para a Tabela
    setPedidos([
      { id: 1, numeroPedido: '1234', fornecedorNome: 'Fornecedor A', valor: 450.00, status: 'Enviado' },
      { id: 2, numeroPedido: '1235', fornecedorNome: 'Fornecedor B', valor: 800.00, status: 'Pendente' },
      { id: 3, numeroPedido: '1236', fornecedorNome: 'Fornecedor C', valor: 120.00, status: 'Enviado' },
      { id: 4, numeroPedido: '1237', fornecedorNome: 'Fornecedor D', valor: 300.00, status: 'Pendente' },
    ]);

    // --- MODO REAL (Só descomente quando seu servidor Node estiver ligado) ---
    /*
    async function fetchData() {
      try {
        const resDashboard = await api.get('/dashboard/resumo');
        setDashboardData(resDashboard.data);

        const resPedidos = await api.get('/pedidos');
        setPedidos(resPedidos.data);
      } catch (error) {
        console.error("Erro de conexão:", error);
      }
    }
    fetchData();
    */

  }, []);

  return (
    <div className={styles['dashboard-container']}>

      {/* Sidebar */}
      <nav className={styles.sidebar}>
         <ul>
          <li className={styles.active}>
            <FiGrid size={20} /><span>Dashboard</span>
          </li>
          <li>
            {/* Link para a página de fornecedores (que você vai criar depois) */}
            <Link href="/admin/fornecedores">
               <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                 <FiUsers size={20} /><span>Fornecedores</span>
               </div>
            </Link>
          </li>
          <li>
            <FiPackage size={20} /><span>Pedidos</span>
          </li>
          <li>
            <FiUser size={20} /><span>Perfil</span>
          </li>
          <li>
            <FiLogOut size={20} /><span>Sair</span>
          </li>
        </ul>
      </nav>

      {/* Conteúdo Principal */}
      <main className={styles['main-content']}>
        <header className={styles.header}>
          <h1>NOME DA LOJA</h1>
          <div className={styles['profile-area']}>
            <FiUserCheck size={24} />
            <span>Minha Loja</span>
          </div>
        </header>

        {/* Cards */}
        <section className={styles['dashboard-cards']}>
          <div className={styles.card}>
            <h3>Pedidos Realizados</h3>
            <p>{dashboardData.totalRealizados}</p>
          </div>
          <div className={styles.card}>
            <h3>Valor Total Comprado</h3>
            <p>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dashboardData.valorTotal)}</p>
          </div>
          <div className={styles.card}>
            <h3>Pedidos Pendentes</h3>
            <p>{dashboardData.totalPendentes}</p>
          </div>
        </section>

        {/* Tabela */}
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