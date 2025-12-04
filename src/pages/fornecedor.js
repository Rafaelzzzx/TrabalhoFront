import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Loja.module.css';
import api from '../services/api';

import {
    LayoutDashboard,
    FileText,
    Package,
    Megaphone,
    Settings,
    User,
    LogOut,
    UserCircle
} from 'lucide-react';

const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState({
        totalRecebidos: 0,
        valorTotal: 0,
        totalEnviados: 0,
        totalCampanhasAtivas: 0,
    });

    const [orders, setOrders] = useState([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await api.get('/api/pedidos');
                const pedidosApi = res.data || [];

                const totalRecebidos = pedidosApi.length;
                const valorTotal = pedidosApi.reduce(
                    (acc, item) => acc + (item.total_amount || 0),
                    0
                );
                const totalEnviados = pedidosApi.filter(
                    p => p.status === 'Enviado' || p.status === 'Delivered'
                ).length;

                setDashboardData({
                    totalRecebidos,
                    valorTotal,
                    totalEnviados,
                    totalCampanhasAtivas: 3,
                });

                const pedidosTratados = pedidosApi.map((p, index) => ({
                    id: p._id || `#${index + 1}`,
                    entity: p.store_id || 'Loja não informada',
                    value: new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                    }).format(p.total_amount || 0),
                    status: p.status || '—',
                }));

                setOrders(pedidosTratados);
            } catch (error) {
                console.error('Erro ao carregar pedidos do fornecedor:', error);
            }
        }

        fetchData();
    }, []);

    const stats = [
        { label: 'Pedidos Recebidos', value: dashboardData.totalRecebidos },
        {
            label: 'Valor Total Vendido',
            value: new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
            }).format(dashboardData.valorTotal),
        },
        { label: 'Pedidos Enviados', value: dashboardData.totalEnviados },
        { label: 'Campanhas Ativas', value: dashboardData.totalCampanhasAtivas },
    ];

    return (
        <div className={styles['dashboard-container']}>
            {/* SIDEBAR */}
            <aside className={styles.sidebar}>
                <nav>
                    <ul>
                        <NavItem
                            icon={<LayoutDashboard size={20} />}
                            label="Painel"
                            href="/fornecedor"
                            active
                        />
                        <NavItem
                            icon={<FileText size={20} />}
                            label="Pedidos Recebidos"
                            href="/fornecedor/pedidos"
                        />
                        <NavItem
                            icon={<Package size={20} />}
                            label="Meus Produtos"
                            href="/fornecedor/produtos"
                        />
                        <NavItem
                            icon={<Megaphone size={20} />}
                            label="Campanhas"
                            href="/fornecedor/campanhas"
                        />
                        <NavItem
                            icon={<Settings size={20} />}
                            label="Condições Comerciais"
                            href="/fornecedor/condicoes"
                        />
                        <NavItem
                            icon={<User size={20} />}
                            label="Perfil"
                            href="/fornecedor/perfil"
                        />
                        <NavItem
                            icon={<LogOut size={20} />}
                            label="Sair"
                            href="/"
                        />
                    </ul>
                </nav>
            </aside>

            {/* MAIN */}
            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <h1>FORNECEDOR XYZ</h1>
                    <div className={styles['profile-area']}>
                        <UserCircle size={24} />
                        <span>Fornecedor</span>
                    </div>
                </header>

                {/* CARDS DE MÉTRICA */}
                <section className={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <div key={index} className={styles.statCard}>
                            <h3>{stat.label}</h3>
                            <p>{stat.value}</p>
                        </div>
                    ))}
                </section>

                {/* TABELA ESTILO PLANILHA */}
                <section className={styles.sectionContainer}>
                    <h2>Últimos Pedidos</h2>

                    <div className={styles.tableWrapper}>
                        <div className={styles.spreadsheetHeader}>
                            <div className={styles.colIndex}></div>
                            <div className={styles.col}>A</div>
                            <div className={styles.col}>B</div>
                            <div className={styles.col}>C</div>
                            <div className={styles.col}>D</div>
                        </div>

                        <table className={styles.dataTable}>
                            <thead>
                            <tr>
                                <th className={styles.rowNum}>1</th>
                                <th>Nº do Pedido</th>
                                <th>Loja</th>
                                <th>Valor</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {orders.map((order, index) => (
                                <tr key={index}>
                                    <td className={styles.rowNum}>{index + 2}</td>
                                    <td>{order.id}</td>
                                    <td>{order.entity}</td>
                                    <td>{order.value}</td>
                                    <td>{order.status}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* CAMPANHAS ATIVAS (AQUI QUE TAVA DIFERENTE) */}
                <section className={styles.campaignSection}>
                    <div className={styles.campaignCard}>
                        <h3>Campanhas Ativas</h3>
                        <h4>Campanha, Cashback 10% SC</h4>
                        <p>
                            Pedidos acima de R$ 300<br />
                            recebem 10% de volta.
                        </p>

                        <div className={styles.campaignActions}>
                            <button className={styles.btnPrimary}>Editar</button>
                            <button className={styles.btnText}>Desativar</button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

const NavItem = ({ icon, label, href, active }) => (
    <li className={active ? styles.active : ''}>
        <Link href={href} className={styles.linkReset}>
            <div className={styles.menuItem}>
                {icon}
                <span>{label}</span>
            </div>
        </Link>
    </li>
);

export default Dashboard;
