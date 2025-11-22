import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Loja.module.css';
import api from '../services/api';

import {
  FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiUserCheck
} from 'react-icons/fi';

const Loja = () => {
  // Estados
  const [dashboardData, setDashboardData] = useState({
    totalRealizados: 0,
    valorTotal: 0,
    totalPendentes: 0
  });

  const [pedidos, setPedidos] = useState([]);

  // Carregar dados da API
  useEffect(() => {
    async function fetchData() {
      try {
        const resDashboard = await api.get('/api/pedidos');

        const pedidos = resDashboard.data;

        const totalRealizados = pedidos.length;
        const valorTotal = pedidos.reduce((acc, item) => acc + (item.total_amount || 0), 0);
        const totalPendentes = pedidos.filter(
          p => p.status === "Pending" || p.status === "Pendente"
        ).length;

        setDashboardData({
          totalRealizados,
          valorTotal,
          totalPendentes
        });

        setPedidos(pedidos);

      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
      }
    }

    fetchData();
  }, []);

  return (
    <div className={styles['dashboard-container']}>

      {/* Sidebar */}
      <nav className={styles.sidebar}>
        <ul>
          <li className={styles.active}>
            <Link href="/loja">
              <div className={styles.menuItem}>
                <FiGrid size={20} /><span>Dashboard</span>
              </div>
            </Link>
          </li>

          <li>
            <Link href="/admin/fornecedores">
              <div className={styles.menuItem}>
                <FiUsers size={20} /><span>Fornecedores</span>
              </div>
            </Link>
          </li>

          <li>
            <Link href="/admin/pedidos">
              <div className={styles.menuItem}>
                <FiPackage size={20} /><span>Pedidos</span>
              </div>
            </Link>
          </li>

          <li>
            <Link href="/admin/perfil">
              <div className={styles.menuItem}>
                <FiUser size={20} /><span>Perfil</span>
              </div>
            </Link>
          </li>

          <li>
            <Link href="/">
              <div className={styles.menuItem}>
                <FiLogOut size={20} /><span>Sair</span>
              </div>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Conteúdo */}
      <main className={styles['main-content']}>
        <header className={styles.header}>
          <h1>MINHA LOJA</h1>
          <div className={styles['profile-area']}>
            <FiUserCheck size={24} />
            <span>Perfil da Loja</span>
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
            <p>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              }).format(dashboardData.valorTotal)}
            </p>
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
                <th>ID</th>
                <th>Fornecedor</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido._id}>
                  <td>{pedido._id}</td>
                  <td>{pedido.store_id}</td>
                  <td>
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(pedido.total_amount)}
                  </td>
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
