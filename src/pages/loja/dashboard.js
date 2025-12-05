import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router'; // Importante para o menu funcionar

import styles from '@/styles/lojas.module.css'; // Confirme se o caminho do CSS está certo
import api from '@/services/api';

import {
  FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiUserCheck,
  FiSearch
} from 'react-icons/fi';

const DashboardLoja = () => {
  const router = useRouter();

  // --- Lógica do Dashboard ---
  const [dashboardData, setDashboardData] = useState({
    totalRealizados: 0,
    valorTotal: 0,
    totalPendentes: 0
  });
  const [pedidosRecentes, setPedidosRecentes] = useState([]);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await api.get('/api/pedidos');
        const lista = res.data || [];

        const totalRealizados = lista.length;
        const valorTotal = lista.reduce((acc, item) => acc + (item.total_amount || 0), 0);
        const totalPendentes = lista.filter(
          p => p.status === "Pending" || p.status === "Pendente"
        ).length;

        setDashboardData({ totalRealizados, valorTotal, totalPendentes });
        setPedidosRecentes(lista.slice(0, 5)); // Pega apenas os 5 últimos
      } catch (error) {
        console.error("Erro dashboard:", error);
      }
    }
    fetchDashboard();
  }, []);

  return (
    <div className={styles['dashboard-container']}>

      {/* --- SIDEBAR CORRIGIDA --- */}
      <nav className={styles.sidebar}>
        <ul>
          {/* 1. Dashboard (Ativo) */}
          <li className={styles.active}>
            <Link href="/loja/dashboard" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiGrid size={20} /><span>Dashboard</span>
              </div>
            </Link>
          </li>

          {/* 2. Buscar Fornecedores */}
          <li>
            <Link href="/loja/fornecedoresdisponiveis" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiSearch size={20} /><span>Buscar Fornecedores</span>
              </div>
            </Link>
          </li>

          {/* 3. Meus Pedidos */}
          <li>
            <Link href="/loja/pedidos" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiPackage size={20} /><span>Meus Pedidos</span>
              </div>
            </Link>
          </li>

          {/* 4. Perfil */}
          <li>
            <Link href="/loja/perfil" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiUser size={20} /><span>Meu Perfil</span>
              </div>
            </Link>
          </li>

          {/* 5. Sair */}
          <li>
            <Link href="/" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiLogOut size={20} /><span>Sair</span>
              </div>
            </Link>
          </li>
        </ul>
      </nav>

      {/* --- CONTEÚDO PRINCIPAL (Só Dashboard) --- */}
      <main className={styles['main-content']}>
        <header className={styles.header}>
          <h1>DASHBOARD</h1>
          <div className={styles['profile-area']}>
            <FiUserCheck size={24} />
            <span>Visão Geral</span>
          </div>
        </header>

        <section className={styles['dashboard-cards']}>
          <div className={styles.card}>
            <h3>Pedidos Realizados</h3>
            <p>{dashboardData.totalRealizados}</p>
          </div>
          <div className={styles.card}>
            <h3>Valor Total</h3>
            <p>
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dashboardData.valorTotal)}
            </p>
          </div>
          <div className={styles.card}>
            <h3>Pendentes</h3>
            <p>{dashboardData.totalPendentes}</p>
          </div>
        </section>

        <section className={styles['orders-table-section']}>
          <h2>Últimos Pedidos</h2>
          <table className={styles['orders-table']}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Loja/Ref</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {pedidosRecentes.length > 0 ? (
                pedidosRecentes.map((pedido) => (
                  <tr key={pedido._id}>
                    <td>{pedido._id.substring(0, 8)}...</td>
                    <td>{pedido.store_id}</td>
                    <td>
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.total_amount)}
                    </td>
                    <td>{pedido.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{textAlign: 'center', padding: '15px'}}>Nenhum pedido recente.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default DashboardLoja;