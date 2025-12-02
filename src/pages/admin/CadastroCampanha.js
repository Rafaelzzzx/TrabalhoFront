import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
// Importa o CSS fornecido (Loja.module.css)
import styles from '../../styles/Loja.module.css';
import api from '../../services/api';

// Importação dos ícones
import {
  FiGrid,
  FiUser,
  FiUsers,
  FiPackage,
  FiBox,
  FiLogOut,
  FiEdit3,
  FiTrash2,
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiArrowRight, // Para o botão de expandir
  FiShoppingBag,
  FiTag
} from 'react-icons/fi';

// =========================================================================
// ⭐️ COMPONENTE AUXILIAR 1: Modal de Edição de Campanha
// =========================================================================
const EditCampanhaModal = ({ campanha, onSave, onCancel, loading }) => {
    // Mapeia os nomes das propriedades
    const initialFormData = {
        name: campanha.name || '',
        supplier_id: campanha.supplier_id || '',
        // Garante que o formato é 'yyyy-mm-dd' para o input type="date"
        start_date: campanha.start_date ? campanha.start_date.split('T')[0] : '',
        end_date: campanha.end_date ? campanha.end_date.split('T')[0] : '',
        discount_percentage: campanha.discount_percentage || '',
        // Incluir status para edição (se for necessário mudar de off para on)
        status: campanha.status || 'on'
    };

    const [formData, setFormData] = useState(initialFormData);

    // Garante que o estado interno do formulário é resetado se o 'campanha' mudar
    useEffect(() => {
        setFormData(initialFormData);
    }, [campanha]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...formData,
            _id: campanha._id,
            discount_percentage: Number(formData.discount_percentage) // Garante que é número
        });
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
                <h3 className={styles.modalTitle}>Editar Campanha: {campanha.name}</h3>

                <form onSubmit={handleSubmit}>

                    {/* Linha 1: Nome e ID do Fornecedor */}
                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Nome da Campanha</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>ID do Fornecedor</label>
                            <input type="text" name="supplier_id" value={formData.supplier_id} onChange={handleChange} required className={styles.inputModal} />
                        </div>
                    </div>

                    {/* Linha 2: Datas */}
                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Data de Início</label>
                            <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Data de Fim</label>
                            <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} required className={styles.inputModal} />
                        </div>
                    </div>

                    {/* Linha 3: Desconto e Status */}
                    <div className={styles.row}>
                        <div className={styles.fieldGroup} style={{ maxWidth: '150px' }}>
                            <label>Desconto (%)</label>
                            <input type="number" name="discount_percentage" value={formData.discount_percentage} onChange={handleChange} required min="0" max="100" className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup} style={{ maxWidth: '150px' }}>
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

// =========================================================================
// ⭐️ COMPONENTE PRINCIPAL: Campanhas
// =========================================================================
export default function Campanhas() {
    const [campanhas, setCampanhas] = useState([]);
    const [form, setForm] = useState({
        name: '',
        supplier_id: '',
        start_date: '',
        end_date: '',
        discount_percentage: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null); // Feedback de sucesso/erro
    const [editingCampanha, setEditingCampanha] = useState(null); // Estado para edição
    const [deleteId, setDeleteId] = useState(null); // Estado para exclusão
    const [showConfirm, setShowConfirm] = useState(false); // Estado para modal de confirmação
    const [expandedId, setExpandedId] = useState(null); // Estado para expandir detalhes
    // ⭐️ NOVO ESTADO: Armazena a ação atual (deactivate ou delete)
    const [currentAction, setCurrentAction] = useState('deactivate');

    // Paginação
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 5;

    // --- Funções de Dados (CRUD) ---

    const buscarCampanhas = useCallback(async () => {
        setLoading(true);
        setMessage(null);
        try {
            // Rota de busca: GET /api/campanhas
            const response = await api.get('/api/campanhas');
            // Mapeia os dados para garantir que todos tenham status, se o backend não fornecer
            const dataWithStatus = response.data.map(item => ({
                ...item,
                status: item.status || 'on' // Adiciona status 'on' por padrão
            }));
            setCampanhas(dataWithStatus);
            if (dataWithStatus.length > 0) {
                 setMessage(null);
            }
        } catch (error) {
            console.error('Erro ao buscar campanhas:', error);
            setMessage({ type: 'error', text: 'Erro ao buscar campanhas. Verifique a rota /api/campanhas.' });
        } finally {
             setLoading(false);
        }
    }, []);

    useEffect(() => {
        buscarCampanhas();
    }, [buscarCampanhas]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const payload = {
                ...form,
                discount_percentage: Number(form.discount_percentage),
                status: 'on' // Nova campanha começa ativa
            };
            await api.post('/api/campanhas', payload);

            setForm({ name: '', supplier_id: '', start_date: '', end_date: '', discount_percentage: '' });
            buscarCampanhas();
            setMessage({ type: 'success', text: 'Campanha criada com sucesso!' });
        } catch (error) {
            console.error('Erro ao criar campanha:', error);
            setMessage({ type: 'error', text: 'Erro ao criar campanha. Verifique a rota /api/campanhas.' });
        } finally {
            setLoading(false);
        }
    };

    // --- Ações na Lista (Update/Delete/Expand) ---

    const startEdit = (campanha) => {
        setMessage(null);
        setEditingCampanha(campanha);
    };

    const cancelEdit = () => {
        setEditingCampanha(null);
    };

    const handleUpdateSubmit = async (updatedData) => {
        setLoading(true);
        setMessage(null);
        const id = updatedData._id;
        const { _id, ...dataToSend } = updatedData;

        try {
            await api.put(`/api/campanhas/${id}`, dataToSend);

            setCampanhas(oldList => oldList.map(item =>
                item._id === id ? { ...item, ...dataToSend } : item
            ));

            setEditingCampanha(null);
            setMessage({ type: 'success', text: "Campanha atualizada com sucesso!" });

        } catch (error) {
            console.error("Erro ao atualizar:", error);
            setMessage({ type: 'error', text: "Erro ao atualizar campanha." });
        } finally {
            setLoading(false);
        }
    };

    // ⭐️ NOVO: Inicia a ação (desativar ou deletar)
    const startAction = (id, type) => {
        setDeleteId(id);
        setCurrentAction(type); // Define a ação que será executada
        setShowConfirm(true);
    };


    // ⭐️ NOVO: Função refatorada para lidar com desativação (PUT) ou exclusão definitiva (DELETE)
    const handleConfirmAction = async () => {
        if (!deleteId) return;
        setShowConfirm(false);
        setLoading(true);
        setMessage(null);

        try {
            if (currentAction === 'delete') {
                // Lógica para EXCLUSÃO PERMANENTE (DELETE)
                await api.delete(`/api/campanhas/${deleteId}`);
                setCampanhas(oldList => oldList.filter(item => item._id !== deleteId));
                setMessage({ type: 'success', text: "Campanha excluída permanentemente com sucesso!" });

            } else {
                // Lógica para DESATIVAÇÃO (PUT para status: 'off')
                await api.put(`/api/campanhas/${deleteId}`, { status: 'off' });

                setCampanhas(oldList => oldList.map(item =>
                    item._id === deleteId ? { ...item, status: 'off' } : item
                ));
                setMessage({ type: 'success', text: "Campanha desativada com sucesso!" });
            }

            if (expandedId === deleteId) setExpandedId(null);

        } catch (error) {
            console.error(`Erro ao ${currentAction}:`, error);
            const actionName = currentAction === 'delete' ? 'excluir' : 'desativar';
            const errorMessage = error.response?.data?.error || "Erro de rede/servidor.";
            setMessage({ type: 'error', text: `Erro ao ${actionName}: ${errorMessage}` });
        } finally {
            setLoading(false);
            setDeleteId(null);
            setCurrentAction('deactivate'); // Reseta a ação para o padrão
        }
    };

    const cancelDelete = () => {
        setDeleteId(null);
        setShowConfirm(false);
        setCurrentAction('deactivate'); // Reseta a ação
    };

    const handleToggleExpand = (id) => {
        setExpandedId(currentId => (currentId === id ? null : id));
    };

    // --- Funções Auxiliares (Data e Paginação) ---

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const nextSlide = () => {
        if (currentIndex + itemsPerPage < campanhas.length) {
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

      const visibleItems = campanhas.slice(currentIndex, currentIndex + itemsPerPage);
      const totalPages = Math.ceil(campanhas.length / itemsPerPage);
      const currentPage = Math.floor(currentIndex / itemsPerPage) + 1;


    // --- Subcomponentes JSX (Modal de Confirmação e Detalhes Expandidos) ---
    const ConfirmationModal = () => {
        const isDelete = currentAction === 'delete';
        const title = isDelete ? 'Confirmação de Exclusão Permanente' : 'Confirmação de Desativação';
        const text = isDelete
          ? 'Tem certeza que deseja EXCLUIR PERMANENTEMENTE esta campanha? Esta ação não pode ser desfeita.'
          : 'Tem certeza que deseja DESATIVAR esta campanha? Ela será marcada como inativa e poderá ser excluída permanentemente depois.';

        return (
            <div className={styles.modalBackdrop}>
                <div className={styles.modalContent}>
                <h3 className={styles.modalTitle}>{title}</h3>
                <p className={styles.modalText}>{text}</p>
                <div className={styles.modalActions}>
                    <button className={`${styles.submitButton} ${styles.btnCancel}`} onClick={cancelDelete}>
                    Cancelar
                    </button>
                    <button
                    className={`${styles.submitButton} ${styles.btnDanger}`}
                    onClick={handleConfirmAction}
                    disabled={loading}
                    >
                    {loading ? 'Processando...' : `Confirmar ${isDelete ? 'Exclusão' : 'Desativação'}`}
                    </button>
                </div>
                </div>
            </div>
        );
    };

    const ExpandedDetailsRow = ({ item }) => (
        <div className={styles['expanded-details-row']}>
            <div className={styles['detail-full-span']}>
                <p className={styles['detail-text-p']}>
                    <strong className={styles.detailLabel}>ID Completo:</strong> {item._id}
                </p>
            </div>
            <div className={styles['detail-half-span']}>
                <p className={styles['detail-text-p']}>
                    <strong className={styles.detailLabel}>Fornecedor ID:</strong> {item.supplier_id}
                </p>
            </div>
            <div className={`${styles['detail-half-span']} ${styles['detail-status']}`}>
                <p className={styles['detail-text-p']}>
                    <strong className={styles.detailLabel}>Status:</strong>
                    <span className={item.status === 'off' ? styles.statusOff : styles.statusOn}>
                        {' '}{item.status || 'on'}
                    </span>
                </p>
            </div>
        </div>
    );

    // --- Renderização Principal ---

    return (
        <div className={styles['dashboard-container']}>

        {/* Sidebar (Mantido como estava) */}
      <nav className={styles.sidebar}>
    <ul>
        {/* 1. Dashboard */}
        <li>
            <Link href="/admin/Dashboard" className={styles.linkReset}>
                <div className={styles.menuItem}>
                    <FiGrid size={20} /><span>Dashboard</span>
                </div>
            </Link>
        </li>

        {/* 2. Cadastro Fornecedor (PRIMEIRO) */}
        <li>
            <Link href="/admin/CadastroFornecedor" className={styles.linkReset}>
                <div className={styles.menuItem}>
                    <FiUsers size={20} /><span>Cadastrar Fornecedores</span>
                </div>
            </Link>
        </li>

        {/* 3. Cadastro Logista (SEGUNDO) */}
        <li>
            <Link href="/admin/CadastroLogista" className={styles.linkReset}>
                <div className={styles.menuItem}>
                    <FiBox size={20} /><span>Cadastrar Lojistas</span>
                </div>
            </Link>
        </li>

        {/* 4. Cadastro Produtos */}
        <li>
            <Link href="/admin/CadastroProduto" className={styles.linkReset}>
                <div className={styles.menuItem}>
                    <FiPackage size={20} /><span>Cadastrar Produtos</span>
                </div>
            </Link>
        </li>

        {/* 5. Pedidos */}
        <li>
            <Link href="/admin/CadastroPedidos" className={styles.linkReset}>
                <div className={styles.menuItem}>
                    <FiShoppingBag size={20} /><span>Pedidos</span>
                </div>
            </Link>
        </li>

        {/* 6. Campanhas */}
        <li>
            <Link href="/admin/Campanhas" className={styles.linkReset}>
                <div className={styles.menuItem}>
                    <FiTag size={20} /><span>Campanhas</span>
                </div>
            </Link>
        </li>

        {/* 7. Perfil */}
        <li>
            <Link href="/admin/perfil" className={styles.linkReset}>
                <div className={styles.menuItem}>
                    <FiUser size={20} /><span>Perfil</span>
                </div>
            </Link>
        </li>

        {/* 8. Sair (Agora junto com os outros) */}
        <li>
            <Link href="/Login" className={styles.linkReset}>
                <div className={styles.menuItem}>
                    <FiLogOut size={20} /><span>Sair</span>
                </div>
            </Link>
        </li>
    </ul>
</nav>

        <main className={styles['main-content']}>

            <header className={styles.header}>
                <h1>Gerenciamento de Campanhas</h1>
            </header>

            {/* Mensagens de Feedback */}
            {message && (
                <div className={`${styles.alertMessage} ${styles[message.type]}`}>
                {message.text.split('\n').map((line, index) => (<p key={index} className={styles.messageLine}>{line}</p>))}
                </div>
            )}

            {/* CARD DE CRIAÇÃO DE CAMPANHA (FORMULÁRIO) */}
            <div className={styles.formCard}>
                <h2 className={styles.sectionTitle}>Nova Campanha</h2>

                <form onSubmit={handleSubmit}>
                    {/* Linhas do Formulário (Mantidas como estavam) */}
                    <div className={styles.row}>
                        <div className={`${styles.fieldGroup} ${styles.inputMedium}`}>
                            <label htmlFor="name">Nome da Campanha<span className={styles.requiredAsterisk}>*</span></label>
                            <input type="text" name="name" id="name" placeholder="Ex: Liquidação de Verão" value={form.name} onChange={handleChange} required />
                        </div>
                        <div className={`${styles.fieldGroup} ${styles.fieldGroupThird}`}>
                            <label htmlFor="supplier_id">ID do Fornecedor<span className={styles.requiredAsterisk}>*</span></label>
                            <input type="text" name="supplier_id" id="supplier_id" placeholder="ID do Fornecedor (Ex: 123)" value={form.supplier_id} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={`${styles.fieldGroup} ${styles.fieldGroupThird}`}>
                            <label htmlFor="start_date">Data de Início<span className={styles.requiredAsterisk}>*</span></label>
                            <input type="date" name="start_date" id="start_date" value={form.start_date} onChange={handleChange} required />
                        </div>
                        <div className={`${styles.fieldGroup} ${styles.fieldGroupThird}`}>
                            <label htmlFor="end_date">Data de Fim<span className={styles.requiredAsterisk}>*</span></label>
                            <input type="date" name="end_date" id="end_date" value={form.end_date} onChange={handleChange} required />
                        </div>
                        <div className={`${styles.fieldGroup} ${styles.fieldGroupThird}`}>
                            <label htmlFor="discount_percentage">Desconto (%)<span className={styles.requiredAsterisk}>*</span></label>
                            <input type="number" name="discount_percentage" id="discount_percentage" placeholder="0-100" value={form.discount_percentage} onChange={handleChange} required min="0" max="100" />
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <div></div>
                        <button type="submit" className={styles.submitButton} disabled={loading}>
                            {loading ? 'Criando...' : 'Criar Campanha'}
                        </button>
                    </div>
                </form>
            </div>

            <hr className={styles.divider} />

            {/* LISTA DE CAMPANHAS (Grid Style) */}
            <div className={styles['search-section']}>
                <h2 className={styles['search-header']}>Campanhas Ativas</h2>

                <div className={styles['provider-list-container']}>
                    {/* HEADER DA TABELA */}
                    <div className={styles['provider-list-header']}>
                        <div className={styles['header-cell']} style={{ flex: '3fr' }}>Nome</div>
                        <div className={styles['header-cell']} style={{ flex: '1.5fr' }}>Fornecedor (ID)</div>
                        <div className={styles['header-cell']} style={{ flex: '2fr' }}>Início</div>
                        <div className={styles['header-cell']} style={{ flex: '2fr' }}>Fim</div>
                        <div className={styles['header-cell-actions']} style={{ width: '130px' }}>Ações</div>
                    </div>

                    {/* CORPO DA TABELA (Itens) */}
                    {visibleItems.length > 0 ? (
                        visibleItems.map((item) => {
                            const isExpanded = expandedId === item._id;
                            // ⭐️ NOVO: Verifica o status
                            const isDeactivated = item.status === 'off';

                            // ⭐️ NOVO: Classes dinâmicas para item cinza
                            let itemClasses = styles['provider-list-item'];
                            if (isExpanded) itemClasses += ` ${styles['item-expanded']}`;
                            if (isDeactivated) itemClasses += ` ${styles['item-status-off']}`;


                            return (
                                <React.Fragment key={item._id}>
                                    <div
                                        className={itemClasses}
                                        onClick={() => handleToggleExpand(item._id)}
                                    >
                                        <div className={styles['detail-cell-name']} style={{ flex: '3fr' }}>
                                            <p>{item.name}</p>
                                        </div>
                                        <div className={styles['detail-cell']} style={{ flex: '1.5fr' }}>
                                            {item.supplier_id}
                                        </div>
                                        <div className={styles['detail-cell']} style={{ flex: '2fr' }}>
                                            {formatDate(item.start_date)}
                                        </div>
                                        <div className={styles['detail-cell']} style={{ flex: '2fr' }}>
                                            {formatDate(item.end_date)}
                                        </div>

                                        <div className={styles['item-actions']} style={{ width: '130px' }}>
                                            {/* Botões de Ação */}
                                            <button
                                                className={`${styles['btn-detail']} ${isExpanded ? styles['btn-rotated'] : ''}`}
                                                title={isExpanded ? "Esconder Detalhes" : "Ver Detalhes"}
                                                onClick={(e) => { e.stopPropagation(); handleToggleExpand(item._id); }}
                                                disabled={loading}
                                            >
                                                <FiArrowRight size={20} />
                                            </button>
                                            <button
                                                className={styles['btn-edit']}
                                                onClick={(e) => { e.stopPropagation(); startEdit(item); }}
                                                title="Editar Campanha"
                                                disabled={loading}
                                            >
                                                <FiEdit3 size={18} />
                                            </button>
                                            <button
                                                className={styles['btn-delete']}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // ⭐️ Lógica de dois passos:
                                                    if (isDeactivated) {
                                                        startAction(item._id, 'delete'); // Exclusão definitiva
                                                    } else {
                                                        startAction(item._id, 'deactivate'); // Desativação
                                                    }
                                                }}
                                                title={isDeactivated ? "Excluir Permanentemente" : "Desativar Campanha"}
                                                disabled={loading}
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    {isExpanded && <ExpandedDetailsRow item={item} />}
                                </React.Fragment>
                            );
                        })
                    ) : (
                        <div className={styles['no-data']}>
                            {loading ? 'Carregando campanhas...' : 'Nenhuma campanha encontrada.'}
                        </div>
                    )}
                </div>

                {/* Paginação */}
                {campanhas.length > itemsPerPage && (
                    <div className={styles.paginationControls}>
                        <button className={styles['nav-btn']} onClick={prevSlide} disabled={currentIndex === 0 || loading}>
                            <FiChevronLeft size={24} />
                        </button>
                        <span className={styles.pageInfo}>Página {currentPage} de {totalPages}</span>
                        <button className={styles['nav-btn']} onClick={nextSlide} disabled={currentIndex + itemsPerPage >= campanhas.length || loading}>
                            <FiChevronRight size={24} />
                        </button>
                    </div>
                )}
            </div>

            {/* MODALS */}
            {showConfirm && <ConfirmationModal />}
            {editingCampanha && (
                <EditCampanhaModal
                    campanha={editingCampanha}
                    onSave={handleUpdateSubmit}
                    onCancel={cancelEdit}
                    loading={loading}
                />
            )}
        </main>
        </div>
    );
}