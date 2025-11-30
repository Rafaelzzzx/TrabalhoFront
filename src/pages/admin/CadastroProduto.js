import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../services/api';
import styles from '../../styles/Loja.module.css';
import {
  FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiBox,
  FiSearch, FiArrowRight, FiTrash2, FiChevronLeft, FiChevronRight, FiEdit
} from 'react-icons/fi';

// --- COMPONENTE: MODAL DE EDIÇÃO PARA PRODUTOS ---
// Adicionada a prop setSearchMessage para validação de frontend
const EditProdutoModal = ({ produto, onSave, onCancel, loading, setSearchMessage }) => {
    // Mapeamento e conversão de tipos para o formulário (todos como string para o input)
    const initialFormData = {
        name: produto.name || '',
        description: produto.description || '',
        price: produto.price ? String(produto.price) : '',
        stock_quantity: produto.stock_quantity ? String(produto.stock_quantity) : '',
        supplier_id: produto.supplier_id || '',
        category: produto.category || '',
        status: produto.status || 'on'
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        setFormData(initialFormData);
    }, [produto]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. Parsing e validação dos números
        const parsedPrice = String(formData.price).replace(',', '.');
        const finalPrice = parseFloat(parsedPrice);
        const finalStock = formData.stock_quantity ? parseInt(formData.stock_quantity, 10) : 0;

        // Validação de números
        if (isNaN(finalPrice) || isNaN(finalStock)) {
             setSearchMessage({ type: 'error', text: "Erro de validação: Preço e Estoque devem ser números válidos." });
             return;
        }

        // 2. CONSTRUÇÃO EXPLÍCITA DO OBJETO DE ATUALIZAÇÃO (CORRIGINDO O BUG)
        // Isso garante que todos os campos, incluindo 'name', sejam passados
        // com os tipos corretos (Float, Int, String) para o backend.
        const dataToSend = {
            name: formData.name,
            description: formData.description,
            price: finalPrice, // Float
            stock_quantity: finalStock, // Integer
            supplier_id: formData.supplier_id,
            category: formData.category,
            status: formData.status || 'on',
            _id: produto._id // ID é mantido para o handler
        };

        // Limpa mensagens de erro antes de tentar salvar
        setSearchMessage(null);

        onSave(dataToSend);
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent} style={{ maxWidth: '700px' }}>
                <h3 className={styles.modalTitle}>Editar Produto: {produto.name}</h3>

                <form onSubmit={handleSubmit}>

                    {/* Linha 1: Nome e Categoria */}
                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Nome do Produto *</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Categoria *</label>
                            <input type="text" name="category" value={formData.category} onChange={handleChange} required className={styles.inputModal} />
                        </div>
                    </div>

                    {/* Descrição */}
                    <div className={styles.fieldGroup}>
                        <label>Descrição</label>
                        <textarea name="description" value={formData.description || ''} onChange={handleChange} className={styles.inputModal}></textarea>
                    </div>

                    {/* Linha 2: Preço, Estoque, Fornecedor */}
                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Preço (R$) *</label>
                            <input type="text" name="price" value={formData.price} onChange={handleChange} required className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Estoque (Qtd) *</label>
                            <input type="text" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} required className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>ID do Fornecedor *</label>
                            <input type="text" name="supplier_id" value={formData.supplier_id} onChange={handleChange} required className={styles.inputModal} />
                        </div>
                    </div>

                    {/* Status */}
                    <div className={styles.row}>
                         <div className={styles.fieldGroup}>
                             <label>Status</label>
                             <select name="status" value={formData.status || 'on'} onChange={handleChange} className={styles.inputModal}>
                                 <option value="on">Ativo</option>
                                 <option value="off">Inativo</option>
                             </select>
                         </div>
                    </div>


                    <div className={styles.modalActions}>
                        <button
                            className={`${styles.submitButton} ${styles.btnCancel}`}
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            className={styles.submitButton}
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============================================================================
// COMPONENTE AUXILIAR: BuscaProdutos (MODIFICADO COM EDIÇÃO)
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
    const [actionType, setActionType] = useState(null);
    const [expandedId, setExpandedId] = useState(null);
    const [searchMessage, setSearchMessage] = useState(null); // Mensagens específicas da busca/listagem

    // ⭐️ NOVO ESTADO PARA EDIÇÃO
    const [editingProduto, setEditingProduto] = useState(null);

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
        setEditingProduto(null); // Fecha o modal de edição ao buscar

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

    // ⭐️ Iniciar a Edição
    const startEdit = (produto) => {
        mainMessageSetter(null); // Limpa a mensagem principal
        setSearchMessage(null); // Limpa a mensagem de busca/edição
        setEditingProduto(produto);
    };

    // ⭐️ Cancelar a Edição
    const cancelEdit = () => {
        setEditingProduto(null);
        setSearchMessage(null); // Garante que a mensagem de erro do modal seja limpa ao fechar
    };

    // ⭐️ Submissão da Atualização (PUT)
    const handleUpdateSubmit = async (updatedData) => {
        setLoading(true);
        setSearchMessage(null);
        const id = updatedData._id;

        // Remove o ID do corpo da requisição e prepara o PUT
        // O `updatedData` AGORA contém os campos 'name', 'price', etc., com os tipos corretos
        const { _id, ...dataToSend } = updatedData;

        try {
            // Rota de atualização (PUT)
            await api.put(`/api/produtos/${id}`, dataToSend);

            // Atualiza o estado da lista no frontend com os novos dados
            setProdutos(oldList => oldList.map(item =>
                item._id === id ? { ...item, ...dataToSend } : item
            ));

            setEditingProduto(null); // Fecha o modal
            mainMessageSetter({ type: 'success', text: "Produto atualizado com sucesso!" });

        } catch (error) {
            console.error("Erro ao atualizar:", error);
            // Captura erros de validação do Mongoose/Backend
            const errorMessage = error.response?.data?.erro || error.response?.data?.error || "Erro desconhecido ao salvar.";
            setSearchMessage({ type: 'error', text: `Erro ao atualizar produto: ${errorMessage}` });
        } finally {
            setLoading(false);
        }
    };


    // [FUNÇÃO]: Inicia a ação (Desativar ou Excluir)
    const startAction = (id, type) => {
        setDeleteId(id);
        setActionType(type); // 'deactivate' ou 'delete'
        setShowConfirm(true);
    };

    // [FUNÇÃO]: Executa a ação confirmada
    const confirmAction = async () => {
        if (!deleteId || !actionType) return;
        setLoading(true);
        setShowConfirm(false);
        setSearchMessage(null);

        try {
            if (actionType === 'deactivate') {
                // AÇÃO 1: DESATIVAR (PUT)
                // Isto usa a mesma rota PUT, mas envia apenas { status: 'off' }
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
                        <button className={`${styles.submitButton} ${styles.btnDanger}`} onClick={confirmAction}>
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
            <h2 className={styles['search-header']}>Consultar / Gerenciar Produtos</h2>

            {/* Mensagem de erro/sucesso da BUSCA/EDIÇÃO/AÇÃO */}
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

                                        {/* AÇÕES */}
                                        <div className={styles['item-actions']}>

                                            {/* 1. Botão de Expandir/Detalhes */}
                                            <button
                                                className={`${styles['btn-detail']} ${expanded ? styles['btn-rotated'] : ''}`}
                                                title={expanded ? "Esconder Detalhes" : "Ver Detalhes"}
                                                onClick={(e) => { e.stopPropagation(); handleToggleExpand(item._id); }}
                                            >
                                                <FiArrowRight size={20} />
                                            </button>

                                            {/* 2. ⭐️ NOVO: Botão de Editar */}
                                            <button
                                                className={styles['btn-edit']}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startEdit(item); // Inicia a edição
                                                }}
                                                title="Editar Produto"
                                                disabled={loading}
                                            >
                                                <FiEdit size={18} />
                                            </button>

                                            {/* 3. Botão de Excluir/Desativar */}
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
                                                disabled={loading}
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

            {/* ⭐️ Renderiza o Modal de Edição se houver um produto selecionado */}
            {editingProduto && (
                <EditProdutoModal
                    produto={editingProduto}
                    onSave={handleUpdateSubmit}
                    onCancel={cancelEdit}
                    loading={loading}
                    setSearchMessage={setSearchMessage} // Passa o setter de mensagens
                />
            )}
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
      name: formData.nome,
      description: formData.descricao,
      price: Number(formData.preco),
      stock_quantity: Number(formData.estoque),
      supplier_id: formData.fornecedor,
      category: formData.categoria
    };

    // Validação básica do formulário de cadastro
    if (isNaN(dadosParaAPI.price) || isNaN(dadosParaAPI.stock_quantity)) {
        setMessage({ type: 'error', text: "Erro: Preço e Estoque devem ser números válidos." });
        setLoading(false);
        return;
    }

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
        {/* Passamos o setMessage para que o BuscaProdutos possa exibir mensagens de sucesso/erro na área principal */}
        <hr className={styles.divider} />
        <BuscaProdutos mainMessageSetter={setMessage} />
      </main>
    </div>
  );
}