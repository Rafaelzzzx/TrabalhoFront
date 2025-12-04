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

const CondicoesComerciais = () => {
    const [condicoes, setCondicoes] = useState([]);
    const [filtroBusca, setFiltroBusca] = useState('');

    // Carregar condições da API
    useEffect(() => {
        async function fetchData() {
            try {
                // ajusta o endpoint se o teu backend usar outro caminho
                const res = await api.get('/api/condicoes-comerciais');
                setCondicoes(res.data || []);
            } catch (error) {
                console.error('Erro ao carregar condições comerciais:', error);

                // MOCK só pra tela funcionar enquanto a API não existe
                setCondicoes([
                    { estado: 'SC', cashback: 10, prazo: 45, desconto: '-' },
                    { estado: 'PR', cashback: 5, prazo: 30, desconto: '3%' },
                    { estado: 'RS', cashback: 0, prazo: 20, desconto: '-' }
                ]);
            }
        }

        fetchData();
    }, []);

    // Cálculo dos totais (Estados / Cashback médio / Prazo médio)
    const { totalEstados, cashbackMedio, prazoMedio } = useMemo(() => {
        if (!condicoes.length) {
            return {
                totalEstados: 0,
                cashbackMedio: 0,
                prazoMedio: 0
            };
        }

        const estadosSet = new Set(
            condicoes.map(c => (c.estado || c.state || '').toString().trim()).filter(Boolean)
        );

        const apenasNumericos = condicoes.filter(
            c => typeof c.cashback === 'number' && !Number.isNaN(c.cashback)
        );
        const somaCashback = apenasNumericos.reduce(
            (acc, c) => acc + (c.cashback || 0),
            0
        );
        const cashbackMedio =
            apenasNumericos.length > 0 ? somaCashback / apenasNumericos.length : 0;

        const comPrazo = condicoes.filter(
            c => typeof c.prazo === 'number' && !Number.isNaN(c.prazo)
        );
        const somaPrazo = comPrazo.reduce((acc, c) => acc + (c.prazo || 0), 0);
        const prazoMedio =
            comPrazo.length > 0 ? somaPrazo / comPrazo.length : 0;

        return {
            totalEstados: estadosSet.size,
            cashbackMedio,
            prazoMedio
        };
    }, [condicoes]);

    // Filtro de busca (Estado ou condição)
    const condicoesFiltradas = useMemo(() => {
        if (!filtroBusca.trim()) return condicoes;

        const termo = filtroBusca.toLowerCase();

        return condicoes.filter(c =>
            [
                c.estado,
                c.state,
                c.condicao,
                c.desconto,
                `${c.cashback ?? ''}`,
                `${c.prazo ?? ''}`
            ]
                .filter(Boolean)
                .some(valor => valor.toString().toLowerCase().includes(termo))
        );
    }, [condicoes, filtroBusca]);

    const formatarCashback = valor =>
        `${Number(valor || 0).toLocaleString('pt-BR', {
            maximumFractionDigits: 2
        })}%`;

    const formatarPrazo = valor =>
        `${Number(valor || 0).toLocaleString('pt-BR', {
            maximumFractionDigits: 0
        })} Dias`;

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

                    <li>
                        <Link href="/campanhas" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiUsers size={20} />
                                <span>Campanhas</span>
                            </div>
                        </Link>
                    </li>

                    <li className={styles.active}>
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
                {/* Título principal */}
                <header className={styles.header}>
                    <h1>Condições Comerciais</h1>
                </header>

                {/* Barra de busca + botão “+ Nova Condição” (reuso de actionsSection) */}
                <section className={styles.actionsSection}>
                    <div className={styles.searchWrapper}>
                        <div className={styles.searchIconCircle}>🔍</div>
                        <input
                            type="text"
                            placeholder="Buscar Estado ou condição"
                            className={styles.searchInput}
                            value={filtroBusca}
                            onChange={e => setFiltroBusca(e.target.value)}
                        />
                    </div>

                    <button
                        type="button"
                        className={styles.newCampaignButton}
                        onClick={() =>
                            alert('Aqui entra o fluxo de cadastrar uma nova condição comercial')
                        }
                    >
                        + Nova Condição
                    </button>
                </section>

                {/* Card com métricas (Estados / Cashback médio / Prazo médio) */}
                <section className={styles.summarySection}>
                    <div className={styles.summaryBox}>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Estados por Condição</span>
                            <span className={styles.summaryValue}>{totalEstados}</span>
                        </div>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Cashback médio</span>
                            <span className={styles.summaryValue}>
                {formatarCashback(cashbackMedio)}
              </span>
                        </div>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Prazo Médio</span>
                            <span className={styles.summaryValue}>
                {formatarPrazo(prazoMedio)}
              </span>
                        </div>
                    </div>
                </section>

                {/* Tabela estilo planilha (igual a do Fornecedor) */}
                <section className={styles.tableSection}>
                    <div className={styles.tableWrapper}>
                        {/* Linha A/B/C/D */}
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
                                <th>Estado</th>
                                <th>Cashback</th>
                                <th>Prazo</th>
                                <th>Desconto</th>
                            </tr>
                            </thead>
                            <tbody>
                            {condicoesFiltradas.map((c, index) => (
                                <tr key={index}>
                                    <td className={styles.rowNum}>{index + 2}</td>
                                    <td>{c.estado || c.state || '—'}</td>
                                    <td>{c.cashback != null ? formatarCashback(c.cashback) : '—'}</td>
                                    <td>
                                        {c.prazo != null
                                            ? `${c.prazo}`
                                            : '—'}
                                    </td>
                                    <td>{c.desconto ?? '-'}</td>
                                </tr>
                            ))}

                            {condicoesFiltradas.length === 0 && (
                                <tr>
                                    <td colSpan={5} className={styles.emptyState}>
                                        Nenhuma condição comercial encontrada.
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

export default CondicoesComerciais;
