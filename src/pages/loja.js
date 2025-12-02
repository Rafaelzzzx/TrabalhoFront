import React, { useEffect, useState } from 'react';
import Link from 'next/link';
// Certifique-se que o caminho do CSS está correto
import styles from '../styles/lojas.module.css';
import api from '../services/api';

import {
  FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiUserCheck,
  FiSearch, FiTrash2, FiEdit, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';

const Loja = () => {
  // Controle de Visualização (Dashboard ou Fornecedores)
  const [activeView, setActiveView] = useState('dashboard');

  // --- LÓGICA DO DASHBOARD ---
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
        setPedidosRecentes(lista.slice(0, 5)); // Pega apenas os 5 últimos para a home
      } catch (error) {
        console.error("Erro dashboard:", error);
      }
    }
    fetchDashboard();
  }, []);

  // --- LÓGICA DE FORNECEDORES ---
  const [fornecedores, setFornecedores] = useState([]);
  const [loadingForn, setLoadingForn] = useState(false);

  // Filtros
  const [buscaId, setBuscaId] = useState('');
  const [buscaNome, setBuscaNome] = useState('');
  const [buscaEmail, setBuscaEmail] = useState('');

  // Paginação Fornecedores
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const buscarFornecedores = async () => {
    setLoadingForn(true);
    setCurrentPage(1);
    try {
      // Supondo rota que retorna todos. Se sua API filtra, mude aqui.
      const response = await api.get('/cadastroFornecedor');
      let dados = response.data || [];

      if (buscaId) dados = dados.filter(f => f._id.includes(buscaId));
      if (buscaNome) dados = dados.filter(f => f.supplier_name.toLowerCase().includes(buscaNome.toLowerCase()));
      if (buscaEmail) dados = dados.filter(f => f.contact_email.toLowerCase().includes(buscaEmail.toLowerCase()));

      setFornecedores(dados);
    } catch (error) {
      console.error("Erro busca:", error);
      alert("Erro ao buscar fornecedores");
    } finally {
      setLoadingForn(false);
    }
  };

  const deletarFornecedor = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir?")) return;
    try {
      await api.delete(`/cadastroFornecedor/${id}`);
      setFornecedores(prev => prev.filter(item => item._id !== id));
      alert("Removido com sucesso!");
    } catch (error) {
      alert("Erro ao remover.");
    }
  };

  // Cálculos de Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentFornecedores = fornecedores.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(fornecedores.length / itemsPerPage);

  // --- COMPONENTES INTERNOS DE RENDERIZAÇÃO ---

  const renderDashboard = () => (
    <>
      <header className={styles.header}>
        <h1>DASHBOARD</h1>
        <div className={styles['profile-area']}>
          <FiUserCheck size={24} />
          <span>Visão Geral</span>
        </div>
      </header>

      {/* Cards */}
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

      {/* Tabela de Pedidos Recentes */}
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
            {pedidosRecentes.map((pedido) => (
              <tr key={pedido._id}>
                <td>{pedido._id}</td>
                <td>{pedido.store_id}</td>
                <td>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pedido.total_amount)}
                </td>
                <td>{pedido.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );

  const renderFornecedores = () => (
    <>
      <header className={styles.header}>
        <h1>FORNECEDORES</h1>
      </header>

      {/* Área de Busca (Usando classes search-section do CSS) */}
      <div className={styles['search-section']}>
        <h3 className={styles['search-header']}>Filtrar Fornecedores</h3>

        <div className={styles['search-inputs']}>
          <div className={styles['search-group']}>
            <label>ID</label>
            <input
              type="text"
              placeholder="Ex: 64a..."
              value={buscaId}
              onChange={e => setBuscaId(e.target.value)}
            />
          </div>
          <div className={styles['search-group']}>
            <label>Nome</label>
            <input
              type="text"
              placeholder="Nome do fornecedor"
              value={buscaNome}
              onChange={e => setBuscaNome(e.target.value)}
            />
          </div>
          <div className={styles['search-group']}>
            <label>Email</label>
            <input
              type="text"
              placeholder="email@exemplo.com"
              value={buscaEmail}
              onChange={e => setBuscaEmail(e.target.value)}
            />
          </div>

          <button className={styles['btn-search']} onClick={buscarFornecedores} disabled={loadingForn}>
             <FiSearch /> {loadingForn ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* Lista / Grid de Resultados */}
      {fornecedores.length > 0 && (
        <div className={styles['provider-list-container']}>

          {/* Cabeçalho da Lista */}
          <div className={styles['provider-list-header']}>
            <div className={styles['header-cell']}>NOME</div>
            <div className={styles['header-cell']}>ID</div>
            <div className={styles['header-cell']}>EMAIL</div>
            <div className={styles['header-cell']}>RESPONSÁVEL</div>
            <div className={styles['header-cell-actions']}>AÇÕES</div>
          </div>

          {/* Itens */}
          {currentFornecedores.map((item) => (
            <div key={item._id} className={styles['provider-list-item']}>
              <div className={`${styles['detail-cell']} ${styles['detail-cell-name']}`}>
                <p>{item.supplier_name}</p>
              </div>
              <div className={styles['detail-cell']} title={item._id}>
                {item._id.substring(0, 8)}...
              </div>
              <div className={styles['detail-cell']}>
                {item.contact_email}
              </div>
              <div className={styles['detail-cell']}>
                {item.responsavel || '-'}
              </div>

              <div className={styles['item-actions']}>
                <button className={styles['btn-edit']} title="Editar">
                  <FiEdit />
                </button>
                <button
                  className={styles['btn-delete']}
                  onClick={() => deletarFornecedor(item._id)}
                  title="Excluir"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}

          {/* Paginação */}
          <div className={styles.paginationControls}>
            <button
              className={styles['nav-btn']}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <FiChevronLeft /> Anterior
            </button>
            <span className={styles.pageInfo}>
              Página {currentPage} de {totalPages}
            </span>
            <button
              className={styles['nav-btn']}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Próximo <FiChevronRight />
            </button>
          </div>

        </div>
      )}

      {!loadingForn && fornecedores.length === 0 && (
        <div className={styles['no-data']}>
          Nenhum fornecedor encontrado ou busca não realizada.
        </div>
      )}
    </>
  );

  // --- RENDERIZAÇÃO PRINCIPAL ---
  return (
    <div className={styles['dashboard-container']}>

      {/* Sidebar */}
      <nav className={styles.sidebar}>
        <ul>
          <li
            className={activeView === 'dashboard' ? styles.active : ''}
            onClick={() => setActiveView('dashboard')}
          >
            <div className={styles.menuItem}>
              <FiGrid size={20} /><span>Dashboard</span>
            </div>
          </li>

          <li
            className={activeView === 'fornecedores' ? styles.active : ''}
            onClick={() => setActiveView('fornecedores')}
          >
            <div className={styles.menuItem}>
              <FiUsers size={20} /><span>Fornecedores</span>
            </div>
          </li>

          {/* Links externos mantidos como Link, ou você pode converter para abas também */}
          <li>
            <Link href="/admin/pedidos" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiPackage size={20} /><span>Pedidos</span>
              </div>
            </Link>
          </li>

          <li>
            <Link href="/admin/perfil" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiUser size={20} /><span>Perfil</span>
              </div>
            </Link>
          </li>

          <li>
            <Link href="/" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiLogOut size={20} /><span>Sair</span>
              </div>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Conteúdo Principal Dinâmico */}
      <main className={styles['main-content']}>
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'fornecedores' && renderFornecedores()}
      </main>
    </div>
  );
};

export default Loja;