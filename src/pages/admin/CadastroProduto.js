import React, { useState } from 'react';
import Link from 'next/link';
import api from '../../services/api';
import styles from '../../styles/Loja.module.css';
import {
  FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiBox,
  FiSearch, FiArrowRight, FiTrash2, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';

// ============================================================================
// COMPONENTE AUXILIAR: BuscaProdutos (MODIFICADO PARA EXCLUSÃO EM DUAS ETAPAS)
// ============================================================================
const BuscaProdutos = ({ mainMessageSetter }) => {
    const [searchId, setSearchId] = useState('');
    const [searchName, setSearchName] = useState('');
    const [searchCategory, setSearchCategory] = useState('');

    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    // [NOVO ESTADO]: Para diferenciar Desativação de Exclusão Definitiva
    const [actionType, setActionType] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [searchMessage, setSearchMessage] = useState(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 5;

    const handleToggleExpand = (id) => {
        setExpandedId(current => current === id ? null : id);
    };

    const handleSearch = async () => {
        setLoading(true);
        setSearched(true);
        setSearchMessage(null);
        setCurrentIndex(0);
        setExpandedId(null);

        try {
            const response = await api.get('/api/produtos');
            let dados = response.data;
            if (searchId) dados = dados.filter(p => p._id.includes(searchId));
            if (searchName) dados = dados.filter(p => p.name?.toLowerCase().includes(searchName.toLowerCase()));
            if (searchCategory) dados = dados.filter(p => p.category?.toLowerCase().includes(searchCategory.toLowerCase()));
            setProdutos(dados);
        } catch (error) {
            console.error("Erro ao buscar produtos:", error);
            setSearchMessage({ type: 'error', text: "Erro ao buscar produtos." });
        } finally {
            setLoading(false);
        }
    };

    // [REMOVIDO: startDelete] -> Substituído por startAction
    // [REMOVIDO: confirmDelete] -> Substituído por confirmAction

    // [NOVA FUNÇÃO]: Inicia a ação (Desativar ou Excluir)
    const startAction = (id, type) => {
        setDeleteId(id);
        setActionType(type); // 'deactivate' ou 'delete'
        setShowConfirm(true);
    };

    // [NOVA FUNÇÃO]: Executa a ação confirmada
    const confirmAction = async () => {
        if (!deleteId || !actionType) return;
        setLoading(true);
        setShowConfirm(false);
        setSearchMessage(null);

        try {
            if (actionType === 'deactivate') {
                // AÇÃO 1: DESATIVAR (PUT)
                await api.put(`/api/produtos/${deleteId}`, { status: 'off' });

                setProdutos(list => list.map(item =>
                    item._id === deleteId ? { ...item, status: 'off' } : item
                ));
                mainMessageSetter({ type: 'success', text: `Produto desativado com sucesso! (ID: ${deleteId.substring(0, 10)}...)` });

            } else if (actionType === 'delete') {
                // AÇÃO 2: DELETAR PERMANENTEMENTE (DELETE)
                await api.delete(`/api/produtos/${deleteId}`);

                // Remove o produto da lista no frontend
                setProdutos(list => list.filter(item => item._id !== deleteId));
                mainMessageSetter({ type: 'success', text: `Produto excluído permanentemente! (ID: ${deleteId.substring(0, 10)}...)` });
            }

            if (expandedId === deleteId) setExpandedId(null);

        } catch (error) {
            console.error(`Erro ao ${actionType}:`, error);
            const msg = error.response?.data?.error || "Erro de rede/servidor.";
            setSearchMessage({ type: 'error', text: `Erro ao ${actionType === 'delete' ? 'excluir' : 'desativar'}: ${msg}` });
        } finally {
            setLoading(false);
            setDeleteId(null);
            setActionType(null); // Limpa o tipo de ação
        }
    };

    // [AJUSTADO]: Resetar o actionType
    const cancelDelete = () => {
        setDeleteId(null);
        setActionType(null);
        setShowConfirm(false);
    };

    // --- Paginação ---
    const nextSlide = () => {
        if (currentIndex + itemsPerPage < produtos.length) {
            setCurrentIndex(currentIndex + itemsPerPage);
            setExpandedId(null);
        }
    };

    const prevSlide = () => {
        if (currentIndex - itemsPerPage >= 0) {
            setCurrentIndex(currentIndex - itemsPerPage);
            setExpandedId(null);
        }
    };

    const visibleItems = produtos.slice(currentIndex, currentIndex + itemsPerPage);
    const totalPages = Math.ceil(produtos.length / itemsPerPage);
    const currentPage = Math.floor(currentIndex / itemsPerPage) + 1;

    // --- Modal de Confirmação (AGORA DINÂMICO) ---
    const ConfirmationModal = () => {
        // [AJUSTADO]: Conteúdo dinâmico com base no actionType
        const title = actionType === 'delete' ? 'Confirmação de Exclusão Permanente' : 'Confirmação de Desativação';
        const text = actionType === 'delete' ?
            'ATENÇÃO: Deseja realmente excluir este produto do banco de dados? Esta ação é irreversível.' :
            'Deseja realmente desativar este produto? Ele ficará indisponível para venda.';
        const buttonText = actionType === 'delete' ? 'Excluir Permanentemente' : 'Confirmar Desativação';

        return (
            <div className={styles.modalBackdrop}>
                <div className={styles.modalContent}>
                    <h3 className={styles.modalTitle}>{title}</h3>
                    <p className={styles.modalText}>{text}</p>
                    <div className={styles.modalActions}>
                        <button className={`${styles.submitButton} ${styles.btnCancel}`} onClick={cancelDelete}>Cancelar</button>
                        <button className={`${styles.submitButton} ${styles.btnDanger}`} onClick={confirmAction}>{/* [AJUSTADO] */}
                            {buttonText}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // --- Detalhes Expandidos ---
    const ExpandedDetailsRow = ({ item }) => (
        <div className={styles['expanded-details-row']}>
            <div className={styles['detail-full-span']}>
                <p className={styles['detail-text-p']}><strong>ID Completo:</strong> {item._id}</p>
            </div>
            <div className={styles['detail-half-span']}>
                <p className={styles['detail-text-p']}><strong>Preço:</strong> R$ {parseFloat(item.price).toFixed(2)}</p>
            </div>
            <div className={styles['detail-half-span']}>
                 <p className={styles['detail-text-p']}><strong>Status:</strong> <span className={item.status === 'off' ? styles.statusOff : styles.statusOn}>{item.status}</span></p>
            </div>
            <div className={styles['detail-full-span']}>
                <p className={styles['detail-text-p']}><strong>Fornecedor ID:</strong> {item.supplier_id || 'N/A'}</p>
            </div>
            <div className={styles['detail-full-span']}>
                <p className={styles['detail-text-p']}><strong>Descrição:</strong> {item.description || 'N/A'}</p>
            </div>
        </div>
    );

    return (
        <div className={styles['search-section']}>
            <h2 className={styles['search-header']}>Consultar / Desativar Produtos</h2>

            {searchMessage && <div className={`${styles.alertMessage} ${styles[searchMessage.type]}`}>{searchMessage.text}</div>}

            <div className={styles['search-inputs']}>
                <div className={styles['search-group']}>
                    <label>ID</label>
                    <input type="text" placeholder="Ex: 64b..." value={searchId} onChange={e => setSearchId(e.target.value)} />
                </div>
                <div className={styles['search-group']}>
                    <label>Nome</label>
                    <input type="text" placeholder="Ex: Teclado..." value={searchName} onChange={e => setSearchName(e.target.value)} />
                </div>
                <div className={styles['search-group']}>
                    <label>Categoria</label>
                    <input type="text" placeholder="Ex: Eletrônicos" value={searchCategory} onChange={e => setSearchCategory(e.target.value)} />
                </div>
                <button className={styles['btn-search']} onClick={handleSearch} disabled={loading}>
                    <FiSearch size={20} />
                    {loading ? 'Buscando...' : 'Buscar'}
                </button>
            </div>

            {produtos.length > 0 && (
                <>
                    <div className={styles['provider-list-container']}>
                        {/* HEADER DA LISTA */}
                        <div className={`${styles['provider-list-item']} ${styles['provider-list-header']}`}>
                            <div className={styles['header-cell']}>Nome do Produto</div>
                            <div className={styles['header-cell']}>ID (Início)</div>
                            <div className={styles['header-cell']}>Estoque</div>
                            <div className={styles['header-cell']}>Categoria</div>
                            <div className={styles['header-cell-actions']}>Ações</div>
                        </div>

                        {/* ITENS DA LISTA */}
                        {visibleItems.map(item => {
                            const expanded = expandedId === item._id;
                            const isDeactivated = item.status === 'off';
                            let itemClasses = styles['provider-list-item'];
                            if (expanded) itemClasses += ` ${styles['item-expanded']}`;
                            if (isDeactivated) itemClasses += ` ${styles['item-status-off']}`;

                            return (
                                <React.Fragment key={item._id}>
                                    <div className={itemClasses} onClick={() => handleToggleExpand(item._id)}>
                                        <div className={styles['detail-cell-name']}><p>{item.name}</p></div>
                                        <div className={styles['detail-cell']}><p>{item._id.substring(0, 10)}...</p></div>
                                        <div className={styles['detail-cell']}><p>{item.stock_quantity}</p></div>
                                        <div className={styles['detail-cell']}><p>{item.category || '-'}</p></div>
                                        <div className={styles['item-actions']}>
                                            <button
                                                className={`${styles['btn-detail']} ${expanded ? styles['btn-rotated'] : ''}`}
                                                title={expanded ? "Esconder Detalhes" : "Ver Detalhes"}
                                                onClick={(e) => { e.stopPropagation(); handleToggleExpand(item._id); }}
                                            >
                                                <FiArrowRight size={20} />
                                            </button>

                                            {/* [AJUSTADO]: LÓGICA DO BOTÃO DE EXCLUSÃO/DESATIVAÇÃO */}
                                            <button
                                                className={styles['btn-delete']}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Determina a ação com base no status atual
                                                    if (isDeactivated) {
                                                        startAction(item._id, 'delete'); // Exclusão definitiva
                                                    } else {
                                                        startAction(item._id, 'deactivate'); // Desativação
                                                    }
                                                }}
                                                title={isDeactivated ? "Excluir Permanentemente" : "Desativar Produto"}
                                                disabled={loading} // Não desabilita mais pelo status, só pelo loading
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    {expanded && <ExpandedDetailsRow item={item} />}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* PAGINAÇÃO */}
                    <div className={styles.paginationControls}>
                        <button className={styles['nav-btn']} onClick={prevSlide} disabled={currentIndex === 0 || loading}>
                            <FiChevronLeft size={24} />
                        </button>
                        <span className={styles.pageInfo}>Página {currentPage} de {totalPages}</span>
                        <button className={styles['nav-btn']} onClick={nextSlide} disabled={currentIndex + itemsPerPage >= produtos.length || loading}>
                            <FiChevronRight size={24} />
                        </button>
                    </div>
                </>
            )}

            {searched && produtos.length === 0 && <p className={styles['no-data']}>Nenhum produto encontrado com os filtros especificados.</p>}

            {showConfirm && <ConfirmationModal />}
        </div>
    );
};

// ============================================================================
// COMPONENTE PRINCIPAL: CadastroProdutos
// ============================================================================
export default function CadastroProdutos() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    nome: '', descricao: '', preco: '', estoque: '', fornecedor: '', categoria: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const dadosParaAPI = {
      nome: formData.nome,
      descricao: formData.descricao,
      preco: Number(formData.preco),
      estoque: Number(formData.estoque),
      fornecedor: formData.fornecedor,
      categoria: formData.categoria
    };

    try {
      const response = await api.post('/api/produtos', dadosParaAPI);
      setMessage({ type: 'success', text: `Produto ${response.data.name} cadastrado com sucesso!` });
      setFormData({ nome: '', descricao: '', preco: '', estoque: '', fornecedor: '', categoria: '' });
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      const msg = error.response?.data?.error || "Erro de rede/servidor.";
      setMessage({ type: 'error', text: `Erro ao cadastrar produto: ${msg}` });
    }

    setLoading(false);
  };

  return (
    <div className={styles["dashboard-container"]}>

      {/* SIDEBAR */}
      <nav className={styles.sidebar}>
        <ul>
          <li><Link href="/admin/Dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20} /><span>Dashboard</span></div></Link></li>
          <li><Link href="/admin/CadastroFornecedor" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20} /><span>Cadastrar Fornecedores</span></div></Link></li>
          <li><Link href="/admin/CadastroLogista" className={styles.linkReset}><div className={styles.menuItem}><FiBox size={20} /><span>Cadastrar Logistas</span></div></Link></li>
          <li className={styles.active}><Link href="/admin/CadastroProduto" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Cadastrar Produtos</span></div></Link></li>
          <li><Link href="/admin/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div></Link></li>
          <li><Link href="/Login" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
        </ul>
      </nav>

      {/* MAIN CONTENT */}
      <main className={styles["main-content"]}>

        <header className={styles.header}>
          <h1>Gerenciamento de Produtos</h1>
        </header>

        {/* FEEDBACK MENSAGEM */}
        {message && (
          <div className={`${styles.alertMessage} ${styles[message.type]}`}>
            <p>{message.text}</p>
          </div>
        )}

        {/* 1. FORMULÁRIO DE CADASTRO (NOVO CADASTRO DE PRODUTO) - AGORA NO TOPO */}
        <h2 className={styles.sectionTitle}>Novo Cadastro de Produto</h2>
        <form className={styles.formCard} onSubmit={handleSubmit}>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label>Nome do Produto *</label>
              <input type="text" name="nome" value={formData.nome} onChange={handleChange} required />
            </div>

            <div className={styles.fieldGroup}>
              <label>Categoria *</label>
              <input type="text" name="categoria" value={formData.categoria} onChange={handleChange} required />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label>Descrição</label>
            <textarea name="descricao" value={formData.descricao} onChange={handleChange}></textarea>
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label>Preço (R$) *</label>
              <input type="number" name="preco" step="0.01" value={formData.preco} onChange={handleChange} required />
            </div>

            <div className={styles.fieldGroup}>
              <label>Estoque (Qtd) *</label>
              <input type="number" name="estoque" value={formData.estoque} onChange={handleChange} required />
            </div>

            <div className={styles.fieldGroup}>
              <label>ID do Fornecedor *</label>
              <input type="text" name="fornecedor" value={formData.fornecedor} onChange={handleChange} required />
            </div>
          </div>

          <div className={styles.footer}>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? "Cadastrando..." : "Cadastrar Produto"}
            </button>
          </div>

        </form>

        {/* 2. BUSCA E LISTAGEM DE PRODUTOS (CONSULTAR) - AGORA EMBAIXO */}
        <BuscaProdutos mainMessageSetter={setMessage} />
      </main>
    </div>
  );
}