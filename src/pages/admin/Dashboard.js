import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import withAuth from '../../components/withAuth';
import { FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiBox, FiShoppingBag, FiTag } from 'react-icons/fi';
import { FaShieldAlt } from 'react-icons/fa';
import api from '../../services/api'; // Sua conexão com o backend
import styles from '../../styles/Loja.module.css';

// Componente reutilizável para a tabela
const TabelaUltimos = ({ title, dados, tipo }) => (
    <div className={styles['orders-table-section']}>
        <h2>{title}</h2>
        {dados.length === 0 ? (
            <p style={{ padding: '15px', color: '#666' }}>Nenhum registro encontrado.</p>
        ) : (
            <table className={styles['orders-table']}>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Cidade / ID</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {dados.map((item) => (
                        <tr key={item._id}>
                            {/* Lógica para diferenciar campos de Loja vs Fornecedor */}
                            <td>
                                {tipo === 'loja' ? item.store_name : item.supplier_name}
                            </td>
                            <td>
                                {item.cidade || item._id.substring(0, 8) + '...'}
                            </td>
                            <td>
                                <span style={{
                                    color: item.status === 'on' ? 'green' : 'red',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    fontSize: '12px'
                                }}>
                                    {item.status || 'ON'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
    </div>
);

function Dashboard() {
    // Estados para armazenar os dados REAIS da API
    const [stats, setStats] = useState({
        totalLojas: 0,
        totalFornecedores: 0,
        pedidosTotais: 0, // Placeholder se não tiver rota de pedidos ainda
        campanhas: 0
    });

    const [ultimasLojas, setUltimasLojas] = useState([]);
    const [ultimosFornecedores, setUltimosFornecedores] = useState([]);
    const [loading, setLoading] = useState(true);

    // Função para buscar dados ao carregar a página
    useEffect(() => {
        async function fetchData() {
            try {
                // 1. Buscando Lojas
                const resLojas = await api.get('/api/lojas');
                const lojasData = resLojas.data || [];

                // 2. Buscando Fornecedores
                // Ajuste a rota se for diferente no seu backend
                const resFornecedores = await api.get('/api/fornecedores/cadastroFornecedor');
                const fornecedoresData = resFornecedores.data || [];

                // 3. Processando os dados para o Dashboard

                // Pegando os 5 últimos cadastrados (assumindo que o último vem no final do array)
                // Usamos .slice(-5).reverse() para pegar os últimos e inverter a ordem (mais novo primeiro)
                // Se seu backend já devolve ordenado, ajuste aqui.
                const recentsLojas = [...lojasData].reverse().slice(0, 5);
                const recentsFornecedores = [...fornecedoresData].reverse().slice(0, 5);

                setUltimasLojas(recentsLojas);
                setUltimosFornecedores(recentsFornecedores);

                setStats({
                    totalLojas: lojasData.length,
                    totalFornecedores: fornecedoresData.length,
                    pedidosTotais: 0, // Defina zero ou busque de uma rota de pedidos se tiver
                    campanhas: 0     // Defina zero ou busque de uma rota de campanhas
                });

            } catch (error) {
                console.error("Erro ao carregar dados do Dashboard:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    // Cards dinâmicos com dados do estado
    const cardData = [
        { title: 'Total de Lojistas', value: loading ? '...' : stats.totalLojas, color: '#0c2b4e' },
        { title: 'Total de Fornecedores', value: loading ? '...' : stats.totalFornecedores, color: '#1a4a7d' },
        { title: 'Pedidos Totais', value: 'Em breve', color: '#4CAF50' }, // Placeholder
        { title: 'Campanhas Ativas', value: 'Em breve', color: '#dc3545' }, // Placeholder
    ];

    return (
        <div className={styles['dashboard-container']}>

            {/* --- SIDEBAR --- */}
            <nav className={styles.sidebar}>
                <ul>
                    <li className={styles.active}>
                        <Link href="/admin/Dashboard" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiGrid size={20} /><span>Dashboard</span>
                            </div>
                        </Link>
                    </li>

                    <li>
                        <Link href="/admin/CadastroFornecedor" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiUsers size={20} /><span>Cadastrar Fornecedores</span>
                            </div>
                        </Link>
                    </li>

                    <li>
                        <Link href="/admin/CadastroLogista" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiBox size={20} /><span>Cadastrar Logistas</span>
                            </div>
                        </Link>
                    </li>

                    <li>
                        <Link href="/admin/CadastroProduto" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiPackage size={20} /><span>Cadastrar Produtos</span>
                            </div>
                        </Link>
                    </li>
                    <li>
                        <Link href="/admin/CadastroPedidos" className={styles.linkReset}>
                        <div className={styles.menuItem}>
                            <FiShoppingBag size={20} /><span>Pedidos</span>
                        </div></Link>
                    </li>

                    <li>
                        <Link href="/admin/CadastroCampanhas" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiTag size={20} /><span>Campanhas</span>
                        </div></Link>
                    </li>

                    <li>
                        <Link href="/admin/perfil" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiUser size={20} /><span>Perfil</span>
                            </div>
                        </Link>
                    </li>

                    <li>
                        <Link href="/admin/Login" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiLogOut size={20} /><span>Sair</span>
                            </div>
                        </Link>
                    </li>
                </ul>
            </nav>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <main className={styles['main-content']}>

                <header className={styles.header}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaShieldAlt size={32} color="#0c2b4e" />
                        Painel do administrador - Central de compras
                    </h1>
                </header>

                {/* --- CARDS DE MÉTRICAS --- */}
                <div className={styles['dashboard-cards']}>
                    {cardData.map((card, index) => (
                        <div key={index} className={styles.card} style={{ borderLeftColor: card.color }}>
                            <h3>{card.title}</h3>
                            <p>{card.value}</p>
                        </div>
                    ))}
                </div>

                {/* --- TABELAS DE DADOS REAIS --- */}

                <div style={{ marginBottom: '25px' }}>
                    <TabelaUltimos
                        title="Últimos logistas cadastrados"
                        dados={ultimasLojas}
                        tipo="loja"
                    />
                </div>

                <TabelaUltimos
                    title="Últimos fornecedores cadastrados"
                    dados={ultimosFornecedores}
                    tipo="fornecedor"
                />

            </main>
        </div>
    );
}

export default withAuth(Dashboard);