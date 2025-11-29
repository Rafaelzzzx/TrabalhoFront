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

  const BuscaFornecedores = () => {
    // Estados dos inputs de busca
    const [searchId, setSearchId] = useState('');
    const [searchName, setSearchName] = useState('');
    const [searchEmail, setSearchEmail] = useState('');

    // Estado dos dados
    const [fornecedores, setFornecedores] = useState([]);
    const [loading, setLoading] = useState(false);

    // Controle de paginação (Carrossel)
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 5;

    // Função de Busca
    const handleSearch = async () => {
      setLoading(true);
      setCurrentIndex(0); // Reseta paginação ao buscar
      try {
        // Estratégia: Buscar TODOS e filtrar no front (mais flexível para multi-campos)
        // OU buscar na API se tiver rota específica.
        // Dado o requisito "deixar em branco puxa todos", faremos o seguinte:

        const response = await api.get('/cadastroFornecedor'); // Rota que retorna todos
        let dados = response.data;

        // Filtragem no Front-end baseada nos inputs (se houver algo digitado)
        if (searchId) {
          dados = dados.filter(f => f._id.includes(searchId));
        }
        if (searchName) {
          dados = dados.filter(f => f.supplier_name.toLowerCase().includes(searchName.toLowerCase()));
        }
        if (searchEmail) {
          dados = dados.filter(f => f.contact_email.toLowerCase().includes(searchEmail.toLowerCase()));
        }

        setFornecedores(dados);
      } catch (error) {
        console.error("Erro ao buscar fornecedores:", error);
        alert("Erro ao buscar dados.");
      } finally {
        setLoading(false);
      }
    };

    // Função de Deletar
    const handleDelete = async (id) => {
      const confirm = window.confirm("Tem certeza? Isso apagará o fornecedor e o usuário de acesso.");
      if (!confirm) return;

      try {
        await api.delete(`/cadastroFornecedor/${id}`);

        // Remove da lista visualmente
        setFornecedores(prev => prev.filter(item => item._id !== id));
        alert("Fornecedor removido com sucesso!");
      } catch (error) {
        console.error("Erro ao deletar:", error);
        alert("Erro ao deletar fornecedor.");
      }
    };

    // Funções do Carrossel (Próximo e Anterior)
    const nextSlide = () => {
      if (currentIndex + itemsPerPage < fornecedores.length) {
        setCurrentIndex(currentIndex + itemsPerPage);
      }
    };

    const prevSlide = () => {
      if (currentIndex - itemsPerPage >= 0) {
        setCurrentIndex(currentIndex - itemsPerPage);
      }
    };

    // Fatiar a lista para exibir apenas 5
    const visibleItems = fornecedores.slice(currentIndex, currentIndex + itemsPerPage);

    return (
      <div className={styles.container}>
        <h2>Gerenciar Fornecedores</h2>

        {/* Área de Busca */}
        <div className={styles.searchBar}>
          <div className={styles.inputGroup}>
              <FiHash className={styles.icon} />
              <input
                  type="text"
                  placeholder="Buscar por ID"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
              />
          </div>

          <div className={styles.inputGroup}>
              <FiUser className={styles.icon} />
              <input
                  type="text"
                  placeholder="Buscar por Nome"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
              />
          </div>

          <div className={styles.inputGroup}>
              <FiMail className={styles.icon} />
              <input
                  type="text"
                  placeholder="Buscar por Email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
              />
          </div>

          <button onClick={handleSearch} className={styles.btnSearch}>
              <FiSearch /> Buscar
          </button>
        </div>

        {/* Resultados / Carrossel */}
        {fornecedores.length > 0 && (
          <div className={styles.resultsArea}>

              <button
                  className={styles.navButton}
                  onClick={prevSlide}
                  disabled={currentIndex === 0}
              >
                  <FiChevronLeft size={24} />
              </button>

              <div className={styles.cardsContainer}>
                  {visibleItems.map((fornecedor) => (
                      <div key={fornecedor._id} className={styles.card}>
                          <div className={styles.cardHeader}>
                              <h3>{fornecedor.supplier_name}</h3>
                              <button
                                  className={styles.btnDelete}
                                  onClick={() => handleDelete(fornecedor._id)}
                                  title="Deletar Fornecedor e Usuário"
                              >
                                  <FiTrash2 />
                              </button>
                          </div>
                          <p><strong>ID:</strong> <span className={styles.smallId}>{fornecedor._id}</span></p>
                          <p><strong>Email:</strong> {fornecedor.contact_email}</p>
                          <p><strong>Resp:</strong> {fornecedor.responsavel}</p>
                      </div>
                  ))}
              </div>

              <button
                  className={styles.navButton}
                  onClick={nextSlide}
                  disabled={currentIndex + itemsPerPage >= fornecedores.length}
              >
                  <FiChevronRight size={24} />
              </button>
          </div>
        )}

        {loading && <p>Carregando...</p>}
        {!loading && fornecedores.length === 0 && <p className={styles.noData}>Nenhum fornecedor carregado. Clique em buscar.</p>}
      </div>
    );
  };


};

export default Loja;