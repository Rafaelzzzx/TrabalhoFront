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
    const initialFormData = {
        name: campanha.name || '',
        supplier_id: campanha.supplier_id || '',
        start_date: campanha.start_date ? campanha.start_date.split('T')[0] : '',
        end_date: campanha.end_date ? campanha.end_date.split('T')[0] : '',
        discount_percentage: campanha.discount_percentage || '',
        status: campanha.status || 'on'
    };

    const [formData, setFormData] = useState(initialFormData);

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
            discount_percentage: Number(formData.discount_percentage)
        });
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
                <h3 className={styles.modalTitle}>Editar Campanha: {campanha.name}</h3>

                <form onSubmit={handleSubmit}>
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
                        <button className={`${styles.submitButton} ${styles.btnCancel}`} type="button" onClick={onCancel} disabled={loading}>
                            Cancelar
                        </button>
                        <button className={styles.submitButton} type="submit" disabled={loading}>
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// =========================================================================
// ⭐️ COMPONENTE AUXILIAR 2: BuscaCampanhas (Busca e Listagem)
// =========================================================================
const BuscaCampanhas = () => {
    // Estados da Busca
    const [searchId, setSearchId] = useState('');
    const [searchName, setSearchName] = useState('');
    const [searchSupplier, setSearchSupplier] = useState('');

    // Estados da Lista e Ações
    const [campanhas, setCampanhas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [message, setMessage] = useState(null);

    const [editingCampanha, setEditingCampanha] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [currentAction, setCurrentAction] = useState('deactivate');

    // Paginação
    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 5;

    // --- Funções de Busca ---
    const handleSearch = async () => {
        setLoading(true);
        setSearched(true);
        setMessage(null);
        setCurrentIndex(0);
        setExpandedId(null);
        setEditingCampanha(null);

        try {
            const response = await api.get('/api/campanhas');
            let dados = response.data.map(item => ({
                ...item,
                status: item.status || 'on'
            }));

            // Filtros no frontend
            if (searchId) dados = dados.filter(c => c._id.includes(searchId));
            if (searchName) dados = dados.filter(c => c.name?.toLowerCase().includes(searchName.toLowerCase()));
            if (searchSupplier) dados = dados.filter(c => c.supplier_id?.toLowerCase().includes(searchSupplier.toLowerCase()));

            setCampanhas(dados);
        } catch (error) {
            console.error('Erro ao buscar campanhas:', error);
            setMessage({ type: 'error', text: 'Erro ao buscar campanhas.' });
        } finally {
            setLoading(false);
        }
    };

    // --- Ações (Editar, Deletar, Expandir) ---
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
            setCampanhas(oldList => oldList.map(item => item._id === id ? { ...item, ...dataToSend } : item));
            setEditingCampanha(null);
            setMessage({ type: 'success', text: "Campanha atualizada com sucesso!" });
        } catch (error) {
            console.error("Erro ao atualizar:", error);
            setMessage({ type: 'error', text: "Erro ao atualizar campanha." });
        } finally {
            setLoading(false);
        }
    };

    const startAction = (id, type) => {
        setDeleteId(id);
        setCurrentAction(type);
        setShowConfirm(true);
    };

    const handleConfirmAction = async () => {
        if (!deleteId) return;
        setShowConfirm(false);
        setLoading(true);
        setMessage(null);

        try {
            if (currentAction === 'delete') {
                await api.delete(`/api/campanhas/${deleteId}`);
                setCampanhas(oldList => oldList.filter(item => item._id !== deleteId));
                setMessage({ type: 'success', text: "Campanha excluída permanentemente!" });
            } else {
                await api.put(`/api/campanhas/${deleteId}`, { status: 'off' });
                setCampanhas(oldList => oldList.map(item => item._id === deleteId ? { ...item, status: 'off' } : item));
                setMessage({ type: 'success', text: "Campanha desativada com sucesso!" });
            }
            if (expandedId === deleteId) setExpandedId(null);
        } catch (error) {
            console.error(`Erro ao ${currentAction}:`, error);
            setMessage({ type: 'error', text: `Erro ao executar ação: ${error.response?.data?.error || "Erro de servidor."}` });
        } finally {
            setLoading(false);
            setDeleteId(null);
            setCurrentAction('deactivate');
        }
    };

    const cancelDelete = () => {
        setDeleteId(null);
        setShowConfirm(false);
        setCurrentAction('deactivate');
    };

    const handleToggleExpand = (id) => {
        setExpandedId(currentId => (currentId === id ? null : id));
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

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const visibleItems = campanhas.slice(currentIndex, currentIndex + itemsPerPage);
    const totalPages = Math.ceil(campanhas.length / itemsPerPage);
    const currentPage = Math.floor(currentIndex / itemsPerPage) + 1;

    // --- JSX Auxiliares ---
    const ConfirmationModal = () => {
        const isDelete = currentAction === 'delete';
        return (
            <div className={styles.modalBackdrop}>
                <div className={styles.modalContent}>
                    <h3 className={styles.modalTitle}>Confirmação de {isDelete ? 'Exclusão' : 'Desativação'}</h3>
                    <p className={styles.modalText}>
                        Tem certeza que deseja {isDelete ? 'EXCLUIR PERMANENTEMENTE' : 'DESATIVAR'} esta campanha?
                    </p>
                    <div className={styles.modalActions}>
                        <button className={`${styles.submitButton} ${styles.btnCancel}`} onClick={cancelDelete}>Cancelar</button>
                        <button className={`${styles.submitButton} ${styles.btnDanger}`} onClick={handleConfirmAction} disabled={loading}>
                            {loading ? 'Processando...' : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const ExpandedDetailsRow = ({ item }) => (
        <div className={styles['expanded-details-row']}>
            <div className={styles['detail-full-span']}>
                <p className={styles['detail-text-p']}><strong>ID Completo:</strong> {item._id}</p>
            </div>
            <div className={styles['detail-half-span']}>
                <p className={styles['detail-text-p']}><strong>Fornecedor ID:</strong> {item.supplier_id}</p>
            </div>
            <div className={`${styles['detail-half-span']} ${styles['detail-status']}`}>
                <p className={styles['detail-text-p']}><strong>Status:</strong> <span className={item.status === 'off' ? styles.statusOff : styles.statusOn}>{item.status || 'on'}</span></p>
            </div>
        </div>
    );

    return (
        <>
            <div className={styles['search-section']}>
                <h2 className={styles['search-header']}>Consultar /Cadastrar Campanhas</h2>

                {message && (
                    <div className={`${styles.alertMessage} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

                {/* --- ÁREA DE BUSCA (INPUTS) --- */}
                <div className={styles['search-inputs']}>
                    <div className={styles['search-group']}>
                        <label>ID</label>
                        <input type="text" placeholder="Ex: 64b..." value={searchId} onChange={e => setSearchId(e.target.value)} />
                    </div>
                    <div className={styles['search-group']}>
                        <label>Nome</label>
                        <input type="text" placeholder="Ex: Verão..." value={searchName} onChange={e => setSearchName(e.target.value)} />
                    </div>
                    <div className={styles['search-group']}>
                        <label>Fornecedor</label>
                        <input type="text" placeholder="ID do Fornecedor..." value={searchSupplier} onChange={e => setSearchSupplier(e.target.value)} />
                    </div>
                    <button className={styles['btn-search']} onClick={handleSearch} disabled={loading}>
                        <FiSearch size={20} />
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                </div>

                {/* --- LISTA DE RESULTADOS --- */}
                {campanhas.length > 0 ? (
                    <>
                        <div className={styles['provider-list-container']}>
                            <div className={`${styles['provider-list-item']} ${styles['provider-list-header']}`}>
                                <div className={styles['header-cell']} style={{ flex: '3fr' }}>Nome</div>
                                <div className={styles['header-cell']} style={{ flex: '1.5fr' }}>Fornecedor</div>
                                <div className={styles['header-cell']} style={{ flex: '2fr' }}>Início</div>
                                <div className={styles['header-cell']} style={{ flex: '2fr' }}>Fim</div>
                                <div className={styles['header-cell-actions']} style={{ width: '130px' }}>Ações</div>
                            </div>

                            {visibleItems.map((item) => {
                                const isExpanded = expandedId === item._id;
                                const isDeactivated = item.status === 'off';
                                let itemClasses = styles['provider-list-item'];
                                if (isExpanded) itemClasses += ` ${styles['item-expanded']}`;
                                if (isDeactivated) itemClasses += ` ${styles['item-status-off']}`;

                                return (
                                    <React.Fragment key={item._id}>
                                        <div className={itemClasses} onClick={() => handleToggleExpand(item._id)}>
                                            <div className={styles['detail-cell-name']} style={{ flex: '3fr' }}><p>{item.name}</p></div>
                                            <div className={styles['detail-cell']} style={{ flex: '1.5fr' }}>{item.supplier_id}</div>
                                            <div className={styles['detail-cell']} style={{ flex: '2fr' }}>{formatDate(item.start_date)}</div>
                                            <div className={styles['detail-cell']} style={{ flex: '2fr' }}>{formatDate(item.end_date)}</div>

                                            <div className={styles['item-actions']} style={{ width: '130px' }}>
                                                <button className={`${styles['btn-detail']} ${isExpanded ? styles['btn-rotated'] : ''}`} onClick={(e) => { e.stopPropagation(); handleToggleExpand(item._id); }}><FiArrowRight size={20} /></button>
                                                <button className={styles['btn-edit']} onClick={(e) => { e.stopPropagation(); startEdit(item); }}><FiEdit3 size={18} /></button>
                                                <button className={styles['btn-delete']} onClick={(e) => { e.stopPropagation(); isDeactivated ? startAction(item._id, 'delete') : startAction(item._id, 'deactivate'); }}><FiTrash2 size={18} /></button>
                                            </div>
                                        </div>
                                        {isExpanded && <ExpandedDetailsRow item={item} />}
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        <div className={styles.paginationControls}>
                            <button className={styles['nav-btn']} onClick={prevSlide} disabled={currentIndex === 0 || loading}><FiChevronLeft size={24} /></button>
                            <span className={styles.pageInfo}>Página {currentPage} de {totalPages}</span>
                            <button className={styles['nav-btn']} onClick={nextSlide} disabled={currentIndex + itemsPerPage >= campanhas.length || loading}><FiChevronRight size={24} /></button>
                        </div>
                    </>
                ) : (
                    !loading && searched && <p className={styles['no-data']}>Nenhuma campanha encontrada com os filtros especificados.</p>
                )}
            </div>

            {showConfirm && <ConfirmationModal />}
            {editingCampanha && <EditCampanhaModal campanha={editingCampanha} onSave={handleUpdateSubmit} onCancel={cancelEdit} loading={loading} />}
        </>
    );
};

// =========================================================================
// ⭐️ COMPONENTE PRINCIPAL: CadastroCampanha (Formulário + Busca)
// =========================================================================
export default function CadastroCampanha() {
    const [form, setForm] = useState({ name: '', supplier_id: '', start_date: '', end_date: '', discount_percentage: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const payload = { ...form, discount_percentage: Number(form.discount_percentage), status: 'on' };
            await api.post('/api/campanhas', payload);
            setForm({ name: '', supplier_id: '', start_date: '', end_date: '', discount_percentage: '' });
            setMessage({ type: 'success', text: 'Campanha criada com sucesso! Atualize a busca abaixo para ver.' });
        } catch (error) {
            console.error('Erro ao criar campanha:', error);
            setMessage({ type: 'error', text: 'Erro ao criar campanha.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles['dashboard-container']}>
            <nav className={styles.sidebar}>
                <ul>
                    <li><Link href="/admin/Dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20} /><span>Dashboard</span></div></Link></li>
                    <li><Link href="/admin/CadastroFornecedor" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20} /><span>Fornecedores</span></div></Link></li>
                    <li><Link href="/admin/CadastroLogista" className={styles.linkReset}><div className={styles.menuItem}><FiBox size={20} /><span>Lojistas</span></div></Link></li>
                    <li><Link href="/admin/CadastroProduto" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Produtos</span></div></Link></li>
                    <li><Link href="/admin/CadastroPedidos" className={styles.linkReset}><div className={styles.menuItem}><FiShoppingBag size={20} /><span>Pedidos</span></div></Link></li>
                    <li className={styles.active}><Link href="/admin/CadastroCampanha" className={styles.linkReset}><div className={styles.menuItem}><FiTag size={20} /><span>Campanhas</span></div></Link></li>
                  {/*  <li><Link href="/admin/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div></Link></li> */}
                    <li><Link href="/admin/Login" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
                </ul>
            </nav>

            <main className={styles['main-content']}>
                <header className={styles.header}>
                    <h1>Cadastro de Campanhas</h1>
                </header>

                {message && <div className={`${styles.alertMessage} ${styles[message.type]}`}>{message.text}</div>}

                <div className={styles.formCard}>
                    <h2 className={styles.sectionTitle}>Nova Campanha</h2>
                    <form onSubmit={handleSubmit}>
                        <div className={styles.row}>
                            <div className={`${styles.fieldGroup} ${styles.inputMedium}`}>
                                <label htmlFor="name">Nome da Campanha<span className={styles.requiredAsterisk}>*</span></label>
                                <input type="text" name="name" id="name" placeholder="Ex: Liquidação" value={form.name} onChange={handleChange} required />
                            </div>
                            <div className={`${styles.fieldGroup} ${styles.fieldGroupThird}`}>
                                <label htmlFor="supplier_id">ID do Fornecedor<span className={styles.requiredAsterisk}>*</span></label>
                                <input type="text" name="supplier_id" id="supplier_id" placeholder="ID..." value={form.supplier_id} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={`${styles.fieldGroup} ${styles.fieldGroupThird}`}>
                                <label htmlFor="start_date">Início<span className={styles.requiredAsterisk}>*</span></label>
                                <input type="date" name="start_date" id="start_date" value={form.start_date} onChange={handleChange} required />
                            </div>
                            <div className={`${styles.fieldGroup} ${styles.fieldGroupThird}`}>
                                <label htmlFor="end_date">Fim<span className={styles.requiredAsterisk}>*</span></label>
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

                {/* Componente de Busca */}
                <BuscaCampanhas />
            </main>
        </div>
    );
}