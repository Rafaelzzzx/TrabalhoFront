// src/pages/meus-produtos.js
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

const MeusProdutos = () => {
    const [produtos, setProdutos] = useState([]);

    // Carregar produtos da API
    useEffect(() => {
        async function fetchData() {
            try {
                const res = await api.get('/api/produtos'); // ajuste se precisar
                setProdutos(res.data || []);
            } catch (error) {
                console.error('Erro ao carregar produtos:', error);

                // MOCK pra visualizar a tela
                setProdutos([
                    {
                        _id: '1',
                        nome: 'Refrigerante Lata 350ml',
                        categoria: 'Bebidas',
                        preco: 3.5,
                        estoque: 250
                    },
                    {
                        _id: '2',
                        nome: 'Água mineral 500ml',
                        categoria: 'Bebidas',
                        preco: 2.0,
                        estoque: 80
                    },
                    {
                        _id: '3',
                        nome: 'Sabonete 90g',
                        categoria: 'Higiene',
                        preco: 1.8,
                        estoque: 30
                    },
                    {
                        _id: '4',
                        nome: 'Arroz',
                        categoria: 'Comida',
                        preco: 5.0,
                        estoque: 20
                    }
                ]);
            }
        }

        fetchData();
    }, []);

    // Totais (bem no estilo do mock)
    const { totalProdutos, totalEstoqueBaixo, totalCategorias } = useMemo(() => {
        const total = produtos.length;

        // critério de "baixo estoque"
        const estoqueBaixo = produtos.filter(p => (p.estoque ?? 0) <= 50).length;

        const categoriasSet = new Set(
            produtos
                .map(p => p.categoria || p.category)
                .filter(Boolean)
        );

        return {
            totalProdutos: total,
            totalEstoqueBaixo: estoqueBaixo,
            totalCategorias: categoriasSet.size
        };
    }, [produtos]);

    const formatarPreco = (valor = 0) =>
        new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);

    return (
        <div className={styles['dashboard-container']}>
            {/* Sidebar */}
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

                    <li className={styles.active}>
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
                    <h1>Meus Produtos</h1>
                </header>

                {/* Card com Totais / Estoque Baixo / Categorias
            (reaproveita summarySection/summaryBox/etc do Loja.module.css) */}
                <section className={styles.summarySection}>
                    <div className={styles.summaryBox}>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Totais de Produto</span>
                            <span className={styles.summaryValue}>{totalProdutos}</span>
                        </div>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Estoque Baixo</span>
                            <span className={styles.summaryValue}>{totalEstoqueBaixo}</span>
                        </div>
                        <div className={styles.summaryColumn}>
                            <span className={styles.summaryLabel}>Categorias</span>
                            <span className={styles.summaryValue}>{totalCategorias}</span>
                        </div>
                    </div>
                </section>

                {/* Título + Botão Novo Produto */}
                <section className={styles.productsHeaderSection}>
                    <h2>Meus Produtos</h2>
                    <button
                        type="button"
                        /* aqui eu já reaproveito o MESMO estilo do botão de nova campanha */
                        className={styles.newCampaignButton}
                        onClick={() =>
                            alert('Aqui entra a ação de cadastrar novo produto')
                        }
                    >
                        + Novo Produto
                    </button>
                </section>

                {/* Tabela de produtos (reaproveita tableSection/table/tableWrapper) */}
                <section className={styles.tableSection}>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                            <tr>
                                <th>Produto</th>
                                <th>Categoria</th>
                                <th>Preço</th>
                                <th>Estoque</th>
                            </tr>
                            </thead>
                            <tbody>
                            {produtos.map((p, index) => (
                                <tr key={p._id || index}>
                                    <td>{p.nome || p.name || '—'}</td>
                                    <td>{p.categoria || p.category || '—'}</td>
                                    <td>{formatarPreco(p.preco ?? p.price ?? 0)}</td>
                                    <td>{p.estoque ?? p.stock ?? 0}</td>
                                </tr>
                            ))}

                            {produtos.length === 0 && (
                                <tr>
                                    <td colSpan={4} className={styles.emptyState}>
                                        Nenhum produto cadastrado.
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

export default MeusProdutos;
