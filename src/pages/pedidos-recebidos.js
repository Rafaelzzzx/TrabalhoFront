import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import styles from '../styles/Loja.module.css';
import api from '../services/api';

import {
    FiGrid,
    FiPackage,
    FiUser,
    FiLogOut,
    FiUsers,
    FiSettings
} from 'react-icons/fi';

const PedidosRecebidos = () => {
    const [pedidos, setPedidos] = useState([]);
    const [filtro, setFiltro] = useState('todos'); // 'todos' | 'pendentes' | 'enviados'

    // Carregar dados da API
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await api.get('/api/pedidos');
                setPedidos(res.data || []);
            } catch (error) {
                console.error('Erro ao carregar pedidos:', error);
            }
        }

        fetchData();
    }, []);

    // Cálculos de totais
    const { totalPedidos, totalPendentes, totalEnviados } = useMemo(() => {
        const total = pedidos.length;

        const pendentes = pedidos.filter(
            p => p.status === 'Pending' || p.status === 'Pendente'
        ).length;

        const enviados = pedidos.filter(
            p => p.status === 'Delivered' || p.status === 'Enviado'
        ).length;

        return {
            totalPedidos: total,
            totalPendentes: pendentes,
            totalEnviados: enviados
        };
    }, [pedidos]);

    // Lista filtrada para a tabela
    const pedidosFiltrados = useMemo(() => {
        if (filtro === 'pendentes') {
            return pedidos.filter(
                p => p.status === 'Pending' || p.status === 'Pendente'
            );
        }

        if (filtro === 'enviados') {
            return pedidos.filter(
                p => p.status === 'Delivered' || p.status === 'Enviado'
            );
        }

        return pedidos;
    }, [filtro, pedidos]);

    const formatarValor = (valor = 0) =>
        new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);

    const formatarData = dataBruta => {
        if (!dataBruta) return '--';
        const d = new Date(dataBruta);
        if (Number.isNaN(d.getTime())) return '--';
        return d.toLocaleDateString('pt-BR');
    };

    return (
        <div className={styles['dashboard-container']}>
            {/* Sidebar reaproveitando o layout da Loja */}
            <nav className={styles.sidebar}>
                <ul>
                    <li>
                        <Link href="/loja" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiGrid size={20} />
                                <span>Dashboard</span>
                            </div>
                        </Link>
                    </li>

                    <li className={styles.active}>
                        <Link href="/pedidos-recebidos" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiPackage size={20} />
                                <span>Pedidos Recebidos</span>
                            </div>
                        </Link>
                    </li>

                    <li>
                        <Link href="/meus-produtos" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiPackage size={20} />
                                <span>Meus Produtos</span>
                            </div>
                        </Link>
                    </li>

                    <li>
                        <Link href="/campanhas" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiUsers size={20} />
                                <span>Campanhas</span>
                            </div>
                        </Link>
                    </li>

                    <li>
                        <Link href="/condicoes-comerciais" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiSettings size={20} />
                                <span>Condições Comerciais</span>
                            </div>
                        </Link>
                    </li>

                    <li>
                        <Link href="/perfil" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiUser size={20} />
                                <span>Perfil</span>
                            </div>
                        </Link>
                    </li>

                    <li>
                        <Link href="/" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiLogOut size={20} />
                                <span>Sair</span>
                            </div>
                        </Link>
                    </li>
                </ul>
            </nav>

            {/* Conteúdo principal */}
            <main className={styles['main-content']}>
                {/* Título */}
                <header className={styles.header}>
                    <h1>Pedidos Recebidos</h1>
                </header>

                {/* Filtros (Todos / Pendentes / Enviados) */}
                <section className={styles.filtersSection}>
                    <div className={styles.filterButtons}>
                        <button
                            type="button"
                            className={`${styles.filterButton} ${
                                filtro === 'todos' ? styles.filterButtonActive : ''
                            }`}
                            onClick={() => setFiltro('todos')}
                        >
                            Todos
                        </button>

                        <button
                            type="button"
                            className={`${styles.filterButton} ${
                                filtro === 'pendentes' ? styles.filterButtonActive : ''
                            }`}
                            onClick={() => setFiltro('pendentes')}
                        >
                            Pendentes
                        </button>

                        <button
                            type="button"
                            className={`${styles.filterButton} ${
                                filtro === 'enviados' ? styles.filterButtonActive : ''
                            }`}
                            onClick={() => setFiltro('enviados')}
                        >
                            Enviados
                        </button>
                    </div>
                </section>

                {/* Card de totais – reaproveitando o summarySection/summaryBox */}
                <section className={styles.summarySection}>
                    <div className={styles.summaryBox}>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Pedidos Totais</span>
                            <span className={styles.summaryValue}>{totalPedidos}</span>
                        </div>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Pendentes</span>
                            <span className={styles.summaryValue}>{totalPendentes}</span>
                        </div>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Pedidos Enviados</span>
                            <span className={styles.summaryValue}>{totalEnviados}</span>
                        </div>
                    </div>
                </section>

                {/* Tabela dos pedidos – reaproveita tableSection/tableWrapper/table */}
                <section className={styles.tableSection}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>Fornecedor</th>
                                <th>Nº do Pedido</th>
                                <th>Valor</th>
                                <th>Status</th>
                                <th>Data</th>
                            </tr>
                            </thead>

                            <tbody>
                            {pedidosFiltrados.map((pedido, index) => (
                                <tr key={pedido._id || index}>
                                    <td>{pedido.store_id || '—'}</td>
                                    <td>{pedido._id || `#${index + 1}`}</td>
                                    <td>{formatarValor(pedido.total_amount)}</td>
                                    <td>{pedido.status || '—'}</td>
                                    <td>{formatarData(pedido.created_at || pedido.date)}</td>
                                </tr>
                            ))}

                            {pedidosFiltrados.length === 0 && (
                                <tr>
                                    <td colSpan={5} className={styles.emptyState}>
                                        Nenhum pedido encontrado para esse filtro.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default PedidosRecebidos;
