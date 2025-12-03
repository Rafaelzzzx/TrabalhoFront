import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import withAuth from '../../components/withAuth';
import {
    FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiBox, FiShoppingBag, FiTag,
    FiArrowRight, FiSearch, FiEdit, FiTrash2, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { FaShieldAlt } from 'react-icons/fa';
import api from '../../services/api';
import styles from '../../styles/Geral.module.css';


const ListaUltimos = ({ title, dados, tipo }) => {
    const gridTemplate = '2fr 1fr 1fr';

    return (
        <div className={styles['search-section']} style={{ marginTop: '25px' }}>
            <h2 className={styles['search-header']}>{title}</h2>

            <div className={styles['provider-list-container']}>
                <div className={`${styles['provider-list-item']} ${styles['provider-list-header']}`} style={{ gridTemplateColumns: gridTemplate }}>
                    <div className={styles['header-cell']}>Nome</div>
                    <div className={styles['header-cell']}>Cidade / ID</div>
                    <div className={styles['header-cell']}>Status</div>
                </div>

                {dados.length === 0 ? (
                    <p style={{ padding: '20px', color: '#666', textAlign: 'center' }}>Nenhum registro encontrado.</p>
                ) : (
                    dados.map((item) => {
                        const status = item.status || 'on';
                        const isOnline = String(status).toLowerCase() === 'on';

                        return (
                            <div key={item._id} className={styles['provider-list-item']} style={{ gridTemplateColumns: gridTemplate }}>
                                <div className={styles['detail-cell-name']}>
                                    <p>{tipo === 'loja' ? item.store_name : item.supplier_name}</p>
                                </div>
                                <div className={styles['detail-cell']}>
                                    {item.cidade || (item._id ? item._id.substring(0, 8) + '...' : '-')}
                                </div>
                                <div className={styles['detail-cell']}>
                                    <span style={{
                                        color: isOnline ? '#28a745' : '#dc3545',
                                        fontWeight: 'bold',
                                        fontSize: '12px'
                                    }}>
                                        {isOnline ? 'ATIVO' : 'INATIVO'}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};


const EditUsuarioModal = ({ usuario, onSave, onCancel, loading }) => {
    const [formData, setFormData] = useState({
        name: usuario.name || '',
        email: usuario.contact_email || usuario.email || '',
        level: usuario.level || 'admin',
        status: usuario.status || 'on'
    });

    useEffect(() => {
        setFormData({
            name: usuario.name || '',
            email: usuario.contact_email || usuario.email || '',
            level: usuario.level || 'admin',
            status: usuario.status || 'on'
        });
    }, [usuario]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, _id: usuario._id });
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
                <h3 className={styles.modalTitle}>Editar Usuário: {usuario.name}</h3>
                <form onSubmit={handleSubmit}>
                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Nome</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className={styles.inputModal} />
                        </div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Nível de Acesso</label>
                            <select name="level" value={formData.level} onChange={handleChange} className={styles.inputModal}>
                                <option value="admin">Admin</option>
                                <option value="logista">Lojista</option>
                                <option value="fornecedor">Fornecedor</option>
                            </select>
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className={styles.inputModal}>
                                <option value="on">Ativo</option>
                                <option value="off">Inativo</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.modalActions}>
                        <button className={`${styles.submitButton} ${styles.btnCancel}`} type="button" onClick={onCancel} disabled={loading}>Cancelar</button>
                        <button className={styles.submitButton} type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const BuscaUsuarios = () => {
    const [searchId, setSearchId] = useState('');
    const [searchName, setSearchName] = useState('');
    const [searchEmail, setSearchEmail] = useState('');

    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const [editingUsuario, setEditingUsuario] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [currentAction, setCurrentAction] = useState('deactivate');
    const [expandedId, setExpandedId] = useState(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const itemsPerPage = 5;



    const handleSearch = async () => {
        setLoading(true);
        setMessage(null);
        setExpandedId(null);
        setEditingUsuario(null);

        try {

            const response = await api.get('/api/cadastroUsuario?status=all');


            let dados = response.data || [];


            if (searchId) dados = dados.filter(u => u._id.includes(searchId));
            if (searchName) dados = dados.filter(u => (u.name || '').toLowerCase().includes(searchName.toLowerCase()));
            if (searchEmail) dados = dados.filter(u => (u.contact_email || u.email || '').toLowerCase().includes(searchEmail.toLowerCase()));

            setUsuarios(dados);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            setMessage({ type: 'error', text: "Erro ao buscar usuários. Verifique se a rota /api/cadastroUsuario existe." });
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (usuario) => {
        setMessage(null);
        setEditingUsuario(usuario);
    };

    const handleUpdateSubmit = async (updatedData) => {
        setLoading(true);
        setMessage(null);
        const { _id, ...dataToSend } = updatedData;

        try {

            await api.put(`/api/cadastroUsuario/${_id}`, dataToSend);

            setUsuarios(old => old.map(u => u._id === _id ? { ...u, ...dataToSend } : u));
            setEditingUsuario(null);
            setMessage({ type: 'success', text: "Usuário atualizado com sucesso!" });
        } catch (error) {
            console.error("Erro ao atualizar:", error);
            setMessage({ type: 'error', text: "Erro ao atualizar usuário." });
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

        try {
            if (currentAction === 'delete') {

                await api.delete(`/api/cadastroUsuario/${deleteId}`);
                setUsuarios(old => old.filter(u => u._id !== deleteId));
                setMessage({ type: 'success', text: "Usuário excluído permanentemente!" });
            } else {

                await api.put(`/api/cadastroUsuario/${deleteId}`, { status: 'off' });
                setUsuarios(old => old.map(u => u._id === deleteId ? { ...u, status: 'off' } : u));
                setMessage({ type: 'success', text: "Usuário desativado com sucesso!" });
            }
        } catch (error) {
            console.error(`Erro ao ${currentAction}:`, error);
            setMessage({ type: 'error', text: "Erro ao executar ação." });
        } finally {
            setLoading(false);
            setDeleteId(null);
        }
    };

    const nextSlide = () => { if (currentIndex + itemsPerPage < usuarios.length) setCurrentIndex(currentIndex + itemsPerPage); };
    const prevSlide = () => { if (currentIndex - itemsPerPage >= 0) setCurrentIndex(currentIndex - itemsPerPage); };
    const handleToggleExpand = (id) => setExpandedId(curr => curr === id ? null : id);

    const visibleItems = usuarios.slice(currentIndex, currentIndex + itemsPerPage);
    const totalPages = Math.ceil(usuarios.length / itemsPerPage);
    const currentPage = Math.floor(currentIndex / itemsPerPage) + 1;

    return (
        <div className={styles['search-section']} style={{ marginTop: '40px' }}>
            <h2 className={styles['search-header']}>Consultar / Gerenciar Usuários do Sistema</h2>

            {message && <div className={`${styles.alertMessage} ${styles[message.type]}`}>{message.text}</div>}

            <div className={styles['search-inputs']}>
                <div className={styles['search-group']}>
                    <label>ID</label>
                    <input type="text" placeholder="Ex: 64b..." value={searchId} onChange={e => setSearchId(e.target.value)} />
                </div>
                <div className={styles['search-group']}>
                    <label>Nome</label>
                    <input type="text" placeholder="Ex: Admin..." value={searchName} onChange={e => setSearchName(e.target.value)} />
                </div>
                <div className={styles['search-group']}>
                    <label>Email</label>
                    <input type="text" placeholder="Ex: contato@..." value={searchEmail} onChange={e => setSearchEmail(e.target.value)} />
                </div>
                <button className={styles['btn-search']} onClick={handleSearch} disabled={loading}>
                    <FiSearch size={20} /> {loading ? '...' : 'Buscar'}
                </button>
            </div>

            {usuarios.length > 0 && (
                <>
                    <div className={styles['provider-list-container']}>
                        <div className={`${styles['provider-list-item']} ${styles['provider-list-header']}`}>
                            <div className={styles['header-cell']}>Nome</div>
                            <div className={styles['header-cell']}>Email</div>
                            <div className={styles['header-cell']}>Nível</div>
                            <div className={styles['header-cell']}>Status</div>
                            <div className={styles['header-cell-actions']}>Ações</div>
                        </div>

                        {visibleItems.map(item => {
                            const isExpanded = expandedId === item._id;
                            const isOff = item.status === 'off';
                            return (
                                <React.Fragment key={item._id}>
                                    <div className={`${styles['provider-list-item']} ${isExpanded ? styles['item-expanded'] : ''} ${isOff ? styles['item-status-off'] : ''}`}
                                         onClick={() => handleToggleExpand(item._id)}>
                                        <div className={styles['detail-cell-name']}><p>{item.name}</p></div>
                                        <div className={styles['detail-cell']}><p>{item.contact_email || item.email}</p></div>
                                        <div className={styles['detail-cell']}><p>{item.level}</p></div>
                                        <div className={styles['detail-cell']}><p>{item.status || 'on'}</p></div>
                                        <div className={styles['item-actions']}>
                                            <button className={`${styles['btn-detail']} ${isExpanded ? styles['btn-rotated'] : ''}`} onClick={(e) => { e.stopPropagation(); handleToggleExpand(item._id); }}>
                                                <FiArrowRight size={20} />
                                            </button>
                                            <button className={styles['btn-edit']} onClick={(e) => { e.stopPropagation(); startEdit(item); }}>
                                                <FiEdit size={18} />
                                            </button>
                                            <button className={styles['btn-delete']} onClick={(e) => { e.stopPropagation(); isOff ? startAction(item._id, 'delete') : startAction(item._id, 'deactivate'); }}>
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    {isExpanded && (
                                        <div className={styles['expanded-details-row']}>
                                            <div className={styles['detail-full-span']}>
                                                <p className={styles['detail-text-p']}><strong>ID:</strong> {item._id}</p>
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                    <div className={styles.paginationControls}>
                        <button className={styles['nav-btn']} onClick={prevSlide} disabled={currentIndex === 0}><FiChevronLeft size={24} /></button>
                        <span className={styles.pageInfo}>Página {currentPage} de {totalPages}</span>
                        <button className={styles['nav-btn']} onClick={nextSlide} disabled={currentIndex + itemsPerPage >= usuarios.length}><FiChevronRight size={24} /></button>
                    </div>
                </>
            )}

            {showConfirm && (
                <div className={styles.modalBackdrop}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalTitle}>{currentAction === 'delete' ? 'Excluir Usuário?' : 'Desativar Usuário?'}</h3>
                        <p className={styles.modalText}>Tem certeza que deseja continuar? Essa ação afeta o acesso do usuário.</p>
                        <div className={styles.modalActions}>
                            <button className={`${styles.submitButton} ${styles.btnCancel}`} onClick={() => setShowConfirm(false)}>Cancelar</button>
                            <button className={`${styles.submitButton} ${styles.btnDanger}`} onClick={handleConfirmAction} disabled={loading}>Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            {editingUsuario && <EditUsuarioModal usuario={editingUsuario} onSave={handleUpdateSubmit} onCancel={() => setEditingUsuario(null)} loading={loading} />}
        </div>
    );
};

// ============================================================================
//  PÁGINA DASHBOARD PRINCIPAL
// ============================================================================
function Dashboard() {
    const [stats, setStats] = useState({
        totalLojas: 0,
        totalFornecedores: 0,
        pedidosTotais: 0,
        campanhasAtivas: 0
    });

    const [ultimasLojas, setUltimasLojas] = useState([]);
    const [ultimosFornecedores, setUltimosFornecedores] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDataSafe = async (url) => {
        try {
            const response = await api.get(url);
            return response.data || [];
        } catch (error) {
            console.warn(`Aviso: Não foi possível carregar ${url}`, error.message);
            return [];
        }
    };

    useEffect(() => {
        async function loadAllData() {
            setLoading(true);

            const lojasData = await fetchDataSafe('/api/lojas?status=all');
            const fornecedoresData = await fetchDataSafe('/api/fornecedores?status=all');
            const pedidosData = await fetchDataSafe('/api/pedidos');
            const campanhasData = await fetchDataSafe('/api/campanhas');

            const recentsLojas = [...lojasData].reverse().slice(0, 5);
            const recentsFornecedores = [...fornecedoresData].reverse().slice(0, 5);

            const totalCampanhasAtivas = campanhasData.filter(c => String(c.status).toLowerCase() === 'on').length;

            setUltimasLojas(recentsLojas);
            setUltimosFornecedores(recentsFornecedores);

            setStats({
                totalLojas: lojasData.length,
                totalFornecedores: fornecedoresData.length,
                pedidosTotais: pedidosData.length,
                campanhasAtivas: totalCampanhasAtivas
            });

            setLoading(false);
        }

        loadAllData();
    }, []);

    const cardData = [
        { title: 'Total de Lojistas', value: loading ? '...' : stats.totalLojas, color: '#0c2b4e' },
        { title: 'Total de Fornecedores', value: loading ? '...' : stats.totalFornecedores, color: '#1a4a7d' },
        { title: 'Pedidos Totais', value: loading ? '...' : stats.pedidosTotais, color: '#4CAF50' },
        { title: 'Campanhas Ativas', value: loading ? '...' : stats.campanhasAtivas, color: '#dc3545' },
    ];

    return (
        <div className={styles['dashboard-container']}>

            <nav className={styles.sidebar}>
                <ul>
                    <li className={styles.active}>
                        <Link href="/admin/Dashboard" className={styles.linkReset}>
                            <div className={styles.menuItem}>
                                <FiGrid size={20} /><span>Dashboard</span>
                            </div>
                        </Link>
                    </li>
                    <li><Link href="/admin/CadastroFornecedor" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20} /><span>Fornecedores</span></div></Link></li>
                    <li><Link href="/admin/CadastroLogista" className={styles.linkReset}><div className={styles.menuItem}><FiBox size={20} /><span>Lojistas</span></div></Link></li>
                    <li><Link href="/admin/CadastroProduto" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Produtos</span></div></Link></li>
                    <li><Link href="/admin/CadastroPedidos" className={styles.linkReset}><div className={styles.menuItem}><FiShoppingBag size={20} /><span>Pedidos</span></div></Link></li>
                    <li><Link href="/admin/CadastroCampanha" className={styles.linkReset}><div className={styles.menuItem}><FiTag size={20} /><span>Campanhas</span></div></Link></li>
                {/*   <li><Link href="/admin/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div></Link></li> */}
                    <li><Link href="/admin/Login" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
                </ul>
            </nav>

            <main className={styles['main-content']}>

                <header className={styles.header}>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaShieldAlt size={32} color="#0c2b4e" />
                        Painel do Administrador
                    </h1>
                </header>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
                    {cardData.map((card, index) => (
                        <div key={index} className={styles.formCard} style={{ flex: '1', minWidth: '200px', borderLeft: `5px solid ${card.color}`, padding: '25px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#555', fontSize: '16px' }}>{card.title}</h3>
                            <p style={{ margin: '0', fontSize: '28px', fontWeight: 'bold', color: '#333' }}>{card.value}</p>
                        </div>
                    ))}
                </div>

                <hr className={styles.divider} />

                <ListaUltimos title="Últimos Lojistas Cadastrados" dados={ultimasLojas} tipo="loja" />
                <ListaUltimos title="Últimos Fornecedores Cadastrados" dados={ultimosFornecedores} tipo="fornecedor" />

                <hr className={styles.divider} />

                <BuscaUsuarios />

            </main>
        </div>
    );
}

export default withAuth(Dashboard);