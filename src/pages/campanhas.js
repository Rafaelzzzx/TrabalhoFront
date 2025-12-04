// src/pages/campanhas.js
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
    FiTag
} from 'react-icons/fi';

const Campanhas = () => {
    const [campanhas, setCampanhas] = useState([]);
    const [filtroBusca, setFiltroBusca] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await api.get('/api/campanhas'); // ajuste o endpoint se precisar
                setCampanhas(res.data || []);
            } catch (error) {
                console.error('Erro ao carregar campanhas:', error);

                // MOCK pra visualizar a tela
                setCampanhas([
                    {
                        _id: '1',
                        nome: 'Cashback 10% SC',
                        tipo: 'Valor',
                        condicao: 'Compra acima de',
                        status: 'Ativa'
                    },
                    {
                        _id: '2',
                        nome: 'Brinde 10 Unid',
                        tipo: 'Quantidade',
                        condicao: 'Acima de 10 Unid',
                        status: 'Inativa'
                    },
                    {
                        _id: '3',
                        nome: 'Desconto R$',
                        tipo: 'Valor',
                        condicao: 'Acima de R$1000',
                        status: 'Ativa'
                    }
                ]);
            }
        }

        fetchData();
    }, []);

    const { totalCampanhas, totalInativas, totalAtivas } = useMemo(() => {
        const total = campanhas.length;
        const inativas = campanhas.filter(
            c => (c.status || '').toLowerCase() === 'inativa'
        ).length;
        const ativas = campanhas.filter(
            c => (c.status || '').toLowerCase() === 'ativa'
        ).length;

        return {
            totalCampanhas: total,
            totalInativas: inativas,
            totalAtivas: ativas
        };
    }, [campanhas]);

    const campanhasFiltradas = useMemo(() => {
        if (!filtroBusca.trim()) return campanhas;

        const termo = filtroBusca.toLowerCase();
        return campanhas.filter(c =>
            [c.nome, c.condicao, c.tipo, c.status]
                .filter(Boolean)
                .some(v => v.toLowerCase().includes(termo))
        );
    }, [campanhas, filtroBusca]);

    return (
        <div className={styles['dashboard-container']}>
            {/* Sidebar reaproveitando o estilo da Loja */}
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

                    <li>
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

                    <li className={styles.active}>
                        <Link href="/campanhas" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiTag size={20} />
                                <span>Campanhas</span>
                            </div>
                        </Link>
                    </li>

                    <li>
                        <Link href="/condicoes-comerciais" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiUsers size={20} />
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
                {/* Título principal */}
                <header className={styles.header}>
                    <h1>Campanhas Promocionais</h1>
                </header>

                {/* Card com totais de campanhas */}
                <section className={styles.summarySection}>
                    <div className={styles.summaryBox}>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Campanhas Totais</span>
                            <span className={styles.summaryValue}>{totalCampanhas}</span>
                        </div>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Campanhas Inativas</span>
                            <span className={styles.summaryValue}>{totalInativas}</span>
                        </div>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Campanhas Ativas</span>
                            <span className={styles.summaryValue}>{totalAtivas}</span>
                        </div>
                    </div>
                </section>

                {/* Barra de busca + botão Nova Campanha */}
                <section className={styles.actionsSection}>
                    <div className={styles.searchWrapper}>
                        <div className={styles.searchIconCircle}>🔍</div>
                        <input
                            type="text"
                            placeholder="Buscar produto ou loja"
                            className={styles.searchInput}
                            value={filtroBusca}
                            onChange={e => setFiltroBusca(e.target.value)}
                        />
                    </div>

                    <button
                        type="button"
                        className={styles.newCampaignButton}
                        onClick={() =>
                            alert('Aqui entra o fluxo de criar nova campanha')
                        }
                    >
                        + Nova Campanha
                    </button>
                </section>

                {/* Tabela de campanhas */}
                <section className={styles.tableSection}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>Nome da Campanha</th>
                                <th>Tipo</th>
                                <th>Condição</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {campanhasFiltradas.map((c, index) => (
                                <tr key={c._id || index}>
                                    <td>{c.nome || '—'}</td>
                                    <td>{c.tipo || '—'}</td>
                                    <td>{c.condicao || '—'}</td>
                                    <td>{c.status || '—'}</td>
                                </tr>
                            ))}

                            {campanhasFiltradas.length === 0 && (
                                <tr>
                                    <td colSpan={4} className={styles.emptyState}>
                                        Nenhuma campanha encontrada.
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

export default Campanhas;
