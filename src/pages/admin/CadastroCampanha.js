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
} from 'react-icons/fi';

// =========================================================================
// ⭐️ COMPONENTE AUXILIAR 1: Modal de Edição de Campanha (DEFINIÇÃO CORRETA)
// =========================================================================
const EditCampanhaModal = ({ campanha, onSave, onCancel, loading }) => {
    // Mapeia os nomes das propriedades
    const initialFormData = {
        name: campanha.name || '',
        supplier_id: campanha.supplier_id || '',
        // Garante que o formato é 'yyyy-mm-dd' para o input type="date"
        start_date: campanha.start_date ? campanha.start_date.split('T')[0] : '',
        end_date: campanha.end_date ? campanha.end_date.split('T')[0] : '',
        discount_percentage: campanha.discount_percentage || ''
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

                    {/* Linha 3: Desconto */}
                    <div className={styles.row}>
                        <div className={styles.fieldGroup} style={{ maxWidth: '150px' }}>
                            <label>Desconto (%)</label>
                            <input type="number" name="discount_percentage" value={formData.discount_percentage} onChange={handleChange} required min="0" max="100" className={styles.inputModal} />
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

    // Paginação
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 5;

    // --- Funções de Dados (CRUD) ---

    const buscarCampanhas = useCallback(async () => {
        setLoading(true);
        setMessage(null);
        try {
            // Rota de busca: GET /api/campaigns
            const response = await api.get('/api/campaigns');
            setCampanhas(response.data);
            // Mensagem de erro 404 será removida após o primeiro sucesso
            if (response.data.length > 0) {
                 setMessage(null);
            }
        } catch (error) {
            console.error('Erro ao buscar campanhas:', error);
            // Manter a mensagem de erro 404 se a busca falhar
            setMessage({ type: 'error', text: 'Erro ao buscar campanhas. Verifique a rota /api/campaigns.' });
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
                discount_percentage: Number(form.discount_percentage)
            };
            // Rota de criação: POST /api/campaigns
            await api.post('/api/campaigns', payload);

            setForm({ name: '', supplier_id: '', start_date: '', end_date: '', discount_percentage: '' });
            buscarCampanhas();
            setMessage({ type: 'success', text: 'Campanha criada com sucesso!' });
        } catch (error) {
            console.error('Erro ao criar campanha:', error);
            setMessage({ type: 'error', text: 'Erro ao criar campanha. Verifique a rota /api/campaigns.' });
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
            // Rota de atualização: PUT /api/campaigns/:id
            await api.put(`/api/campaigns/${id}`, dataToSend);

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

    const startDelete = (id) => {
        setDeleteId(id);
        setShowConfirm(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteId) return;
        setShowConfirm(false);
        setLoading(true);
        setMessage(null);

        try {
            // Rota de exclusão: DELETE /api/campaigns/:id
            await api.delete(`/api/campaigns/${deleteId}`);
            setCampanhas(oldList => oldList.filter(item => item._id !== deleteId));
            setMessage({ type: 'success', text: "Campanha excluída com sucesso!" });
            if (expandedId === deleteId) setExpandedId(null);

        } catch (error) {
            console.error("Erro ao excluir:", error);
            setMessage({ type: 'error', text: "Erro ao excluir campanha." });
        } finally {
            setLoading(false);
            setDeleteId(null);
        }
    };

    const cancelDelete = () => {
        setDeleteId(null);
        setShowConfirm(false);
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
    // Mantenho estes dentro do componente principal para melhor escopo, conforme seu código

    const ConfirmationModal = () => (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Confirmação de Exclusão</h3>
            <p className={styles.modalText}>Tem certeza que deseja EXCLUIR PERMANENTEMENTE esta campanha? Esta ação não pode ser desfeita.</p>
            <div className={styles.modalActions}>
                <button className={`${styles.submitButton} ${styles.btnCancel}`} onClick={cancelDelete}>
                Cancelar
                </button>
                <button
                className={`${styles.submitButton} ${styles.btnDanger}`}
                onClick={handleConfirmDelete}
                disabled={loading}
                >
                {loading ? 'Processando...' : 'Confirmar Exclusão'}
                </button>
            </div>
            </div>
        </div>
    );

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
            <div className={styles['detail-half-span']}>
                <p className={styles['detail-text-p']}>
                    <strong className={styles.detailLabel}>Desconto Aplicado:</strong> {item.discount_percentage}%
                </p>
            </div>
        </div>
    );

    // --- Renderização Principal ---

    return (
        <div className={styles['dashboard-container']}>

        {/* Sidebar (Mantido como estava) */}
        <aside className={styles.sidebar}>
            <ul>
            <Link href="/admin" className={styles.linkReset}><li><div className={styles.menuItem}><FiGrid size={20} /><span>Dashboard</span></div></li></Link>
            <Link href="/admin/CadastroLogista" className={styles.linkReset}><li><div className={styles.menuItem}><FiUser size={20} /><span>Cadastro Logista</span></div></li></Link>
            <Link href="/admin/CadastroFornecedor" className={styles.linkReset}><li><div className={styles.menuItem}><FiUsers size={20} /><span>Cadastro Fornecedor</span></div></li></Link>
            <Link href="/admin/CadastroProdutos" className={styles.linkReset}><li><div className={styles.menuItem}><FiPackage size={20} /><span>Cadastro Produtos</span></div></li></Link>
            <Link href="/admin/campanhas" className={styles.linkReset}><li className={styles.active}><div className={styles.menuItem}><FiBox size={20} /><span>Campanhas</span></div></li></Link>
            </ul>
            <div style={{ marginTop: 'auto', padding: '20px 0' }}>
            <Link href="/logout" className={styles.linkReset}>
                <li style={{ padding: '18px 30px', color: '#dc3545', borderRight: '4px solid transparent' }}>
                <div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></li>
            </Link>
            </div>
        </aside>

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

                            return (
                                <React.Fragment key={item._id}>
                                    <div
                                        className={`${styles['provider-list-item']} ${isExpanded ? styles['item-expanded'] : ''}`}
                                        // O onClick do item principal apenas expande/fecha, sem interferir nos botões
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
                                                onClick={(e) => { e.stopPropagation(); startDelete(item._id); }}
                                                title="Excluir Campanha"
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