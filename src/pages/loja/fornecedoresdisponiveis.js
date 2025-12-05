import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import styles from '@/styles/lojas.module.css';
import api from '@/services/api';

import {
  FiGrid,
  FiBox,
  FiShoppingBag,
  FiLogOut,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiPlay
} from 'react-icons/fi';

const Fornecedor = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  // Dados
  const [meusProdutos, setMeusProdutos] = useState([]);
  const [pedidosRecebidos, setPedidosRecebidos] = useState([]);
  const [stats, setStats] = useState({
    totalVendas: 0,
    pedidosPendentes: 0,
    produtosAtivos: 0
  });

  // ID do Fornecedor Logado
  const [fornecedorId, setFornecedorId] = useState(null);

  useEffect(() => {
    // Tenta pegar o usuário do localStorage
    const usuarioStored = localStorage.getItem("usuario");
    if (usuarioStored) {
      const user = JSON.parse(usuarioStored);
      // Assumindo que no login de fornecedor, o backend retorna o ID do fornecedor ou o usuário tem vinculo
      // Se não tiver direto, teríamos que fazer uma busca.
      // Para este exemplo, vamos assumir que user.id ou user.fornecedorId está disponível.

      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Buscar Produtos (Filtraremos os deste fornecedor se possível, ou mostra todos)
      // Como o endpoint /api/produtos retorna tudo, vamos filtrar se tivermos o ID.
      const resProd = await api.get('/api/produtos');
      setMeusProdutos(resProd.data || []);

      // 2. Buscar Pedidos
      const resPed = await api.get('/api/pedidos');
      const todosPedidos = resPed.data || [];

      // Filtra pedidos relevantes (status não cancelado para soma, etc)
      setPedidosRecebidos(todosPedidos);

      // Calcular Estatísticas
      const totalVendas = todosPedidos.reduce((acc, p) => acc + (p.total_amount || p.valorTotal || 0), 0);
      const pendentes = todosPedidos.filter(p => p.status === 'PENDENTE' || p.status === 'Pendente').length;
      const ativos = (resProd.data || []).filter(p => p.status === 'on' || p.ativo === true).length;

      setStats({
        totalVendas,
        pedidosPendentes: pendentes,
        produtosAtivos: ativos
      });

    } catch (error) {
      console.error("Erro ao carregar dados do fornecedor:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar status do pedido (Lógica de Negócio do Fornecedor)
  const handleUpdateStatus = async (pedidoId, novoStatus) => {
    if(!window.confirm(`Deseja alterar o status para: ${novoStatus}?`)) return;

    try {
      // Precisamos do ID do usuário logado para passar ao backend (conforme PedidoController)
      const usuarioStored = JSON.parse(localStorage.getItem("usuario") || '{}');
      const usuarioId = usuarioStored.id;

      await api.patch(`/api/pedidos/${pedidoId}/status`, null, {
        params: {
          status: novoStatus,
          usuarioId: usuarioId
        }
      });

      // Atualiza a lista localmente
      setPedidosRecebidos(prev => prev.map(p =>
        p.id === pedidoId || p._id === pedidoId ? { ...p, status: novoStatus } : p
      ));

      alert("Status atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar status. Verifique se você tem permissão.");
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  const renderDashboard = () => (
    <>
      <header className={styles.header}>
        <h1>Painel do Fornecedor</h1>
      </header>

      <section className={styles['dashboard-cards']}>
        <div className={styles.card}>
          <h3>Pedidos Pendentes</h3>
          <p style={{ color: '#e67e22' }}>{stats.pedidosPendentes}</p>
        </div>
        <div className={styles.card}>
          <h3>Produtos Ativos</h3>
          <p style={{ color: '#27ae60' }}>{stats.produtosAtivos}</p>
        </div>
        <div className={styles.card}>
          <h3>Vendas Totais</h3>
          <p style={{ color: '#2980b9' }}>{formatCurrency(stats.totalVendas)}</p>
        </div>
      </section>

      <section className={styles['table-section']}>
        <h2 className={styles['table-header-title']}>Últimos Pedidos Recebidos</h2>
        <table className={styles['custom-table']}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Loja Solicitante</th>
              <th>Data</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {pedidosRecebidos.slice(0, 5).map((pedido) => (
              <tr key={pedido.id || pedido._id}>
                <td>#{(pedido.id || pedido._id).substring(0, 8)}</td>
                <td>{pedido.lojaNome || 'Loja Desconhecida'}</td>
                <td>{new Date(pedido.dataPedido || pedido.order_date).toLocaleDateString()}</td>
                <td>{formatCurrency(pedido.valorTotal || pedido.total_amount)}</td>
                <td>
                  <span className={`${styles['status-badge']} ${styles[`status-${String(pedido.status).toLowerCase()}`]}`}>
                    {pedido.status}
                  </span>
                </td>
              </tr>
            ))}
            {pedidosRecebidos.length === 0 && (
              <tr><td colSpan="5" className={styles['no-data']}>Nenhum pedido recente.</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </>
  );

  const renderProdutos = () => (
    <>
      <header className={styles.header}>
        <h1>Meus Produtos</h1>
      </header>
      <div className={styles['table-section']}>
        <table className={styles['custom-table']}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Preço Base</th>
              <th>Estoque</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {meusProdutos.map((prod) => (
              <tr key={prod.id || prod._id}>
                <td>{prod.nome || prod.name}</td>
                <td>{prod.nomeCategoria || prod.category || '-'}</td>
                <td>{formatCurrency(prod.precoBase || prod.price)}</td>
                <td>{prod.quantidadeEstoque || prod.stock_quantity}</td>
                <td>{prod.ativo || prod.status === 'on' ? 'Ativo' : 'Inativo'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderPedidos = () => (
    <>
      <header className={styles.header}>
        <h1>Gerenciar Pedidos</h1>
      </header>
      <div className={styles['table-section']}>
        <table className={styles['custom-table']}>
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Loja</th>
              <th>Itens</th>
              <th>Total</th>
              <th>Status Atual</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {pedidosRecebidos.map((pedido) => {
              const id = pedido.id || pedido._id;
              const status = String(pedido.status || '').toUpperCase();

              return (
                <tr key={id}>
                  <td>#{id.substring(0, 8)}</td>
                  <td>{pedido.lojaNome || 'Loja...'}</td>
                  <td>{(pedido.itens || pedido.items || []).length} itens</td>
                  <td>{formatCurrency(pedido.valorTotal || pedido.total_amount)}</td>
                  <td>
                    <span className={`${styles['status-badge']} ${styles[`status-${status.toLowerCase()}`]}`}>
                      {status}
                    </span>
                  </td>
                  <td>
                    {/* Lógica de Transição de Status */}
                    {status === 'PENDENTE' && (
                      <button className={`${styles['action-btn']} ${styles['btn-process']}`} onClick={() => handleUpdateStatus(id, 'EM_SEPARACAO')}>
                        <FiPlay /> Separar
                      </button>
                    )}
                    {status === 'EM_SEPARACAO' && (
                      <button className={`${styles['action-btn']} ${styles['btn-send']}`} onClick={() => handleUpdateStatus(id, 'ENVIADO')}>
                        <FiTruck /> Enviar
                      </button>
                    )}
                    {(status === 'PENDENTE' || status === 'EM_SEPARACAO') && (
                      <button className={`${styles['action-btn']} ${styles['btn-cancel']}`} onClick={() => handleUpdateStatus(id, 'CANCELADO')}>
                        <FiXCircle /> Cancelar
                      </button>
                    )}
                    {status === 'ENVIADO' && <span style={{color: '#28a745', fontSize: '13px'}}>Aguardando Entrega</span>}
                    {status === 'ENTREGUE' && <span style={{color: '#28a745', fontWeight: 'bold'}}><FiCheckCircle /> Finalizado</span>}
                    {status === 'CANCELADO' && <span style={{color: '#dc3545'}}>Cancelado</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );

  return (
    <div className={styles['dashboard-container']}>
      {/* SIDEBAR */}
      <nav className={styles.sidebar}>
        <ul>
          <li className={activeView === 'dashboard' ? styles.active : ''} onClick={() => setActiveView('dashboard')}>
            <div className={styles.menuItem}><FiGrid /> <span>Dashboard</span></div>
          </li>
          <li className={activeView === 'produtos' ? styles.active : ''} onClick={() => setActiveView('produtos')}>
            <div className={styles.menuItem}><FiBox /> <span>Meus Produtos</span></div>
          </li>
          <li className={activeView === 'pedidos' ? styles.active : ''} onClick={() => setActiveView('pedidos')}>
            <div className={styles.menuItem}><FiShoppingBag /> <span>Pedidos Recebidos</span></div>
          </li>
          <li>
            <Link href="/" className={styles.linkReset}>
              <div className={styles.menuItem}><FiLogOut /> <span>Sair</span></div>
            </Link>
          </li>
        </ul>
      </nav>

      {/* CONTEÚDO */}
      <main className={styles['main-content']}>
        {loading ? <p>Carregando dados...</p> : (
          <>
            {activeView === 'dashboard' && renderDashboard()}
            {activeView === 'produtos' && renderProdutos()}
            {activeView === 'pedidos' && renderPedidos()}
          </>
        )}
      </main>
    </div>
  );
};

export default Fornecedor;
// export default withAuth(Fornecedor); // Use assim se quiser validar o login antes