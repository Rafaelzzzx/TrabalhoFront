import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import withAuth from '../../components/withAuth';
import api from '../../services/api';
import styles from '../../styles/Geral.module.css';
import {
  FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiBox,
  FiSearch, FiTrash2, FiChevronLeft, FiChevronRight,
  FiChevronRight as FiArrowRight, FiEdit, FiShoppingBag, FiTag
} from 'react-icons/fi';



const EditFornecedorModal = ({ fornecedor, onSave, onCancel, loading }) => {
    const [formData, setFormData] = useState(fornecedor);


    useEffect(() => {
        setFormData(fornecedor);
    }, [fornecedor]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className={styles.modalBackdrop}>

            <div className={styles.modalContent}>
                <h3 className={styles.modalTitle}>Editar Fornecedor: {fornecedor.supplier_name}</h3>

                <form onSubmit={handleSubmit}>


                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Nome da Loja</label>

                            <input type="text" name="supplier_name" value={formData.supplier_name} onChange={handleChange} required className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Categoria</label>

                            <input type="text" name="supplier_category" value={formData.supplier_category || ''} onChange={handleChange} className={styles.inputModal} />
                        </div>
                    </div>


                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Responsável</label>

                            <input type="text" name="responsavel" value={formData.responsavel || ''} onChange={handleChange} className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Email (Login)</label>

                            <input type="email" name="contact_email" value={formData.contact_email} disabled className={styles.inputModal} />
                        </div>
                    </div>


                    <div className={styles.row}>
                         <div className={styles.fieldGroup}>
                            <label>Telefone</label>

                            <input type="text" name="phone_number" value={formData.phone_number || ''} onChange={handleChange} className={styles.inputModal} />
                        </div>
                    </div>


                    <h4 className={styles.sectionTitle} style={{ marginTop: '15px' }}>Endereço</h4>
                    <div className={styles.row}>
                        <div className={`${styles.fieldGroup} ${styles.fieldGroupThird}`}>
                            <label>Rua/Avenida</label>
                            <input type="text" name="rua" value={formData.rua || ''} onChange={handleChange} className={styles.inputModal} />
                        </div>
                        <div className={`${styles.fieldGroup} ${styles.fieldGroupThird}`}>
                            <label>Cidade</label>
                            <input type="text" name="cidade" value={formData.cidade || ''} onChange={handleChange} className={styles.inputModal} />
                        </div>
                        <div className={`${styles.fieldGroup} ${styles.fieldGroupThird}`}>
                            <label>Estado (UF)</label>
                            {/* AJUSTE 2: Aplicação da classe inputModal. A classe inputModal resolve o problema se o CSS for adicionado/verificado. */}
                            <input type="text" name="estado" value={formData.estado || ''} onChange={handleChange} className={styles.inputModal} />
                        </div>
                    </div>

                    {/* Status */}
                    <h4 className={styles.sectionTitle} style={{ marginTop: '15px' }}>Status</h4>
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



const BuscaFornecedores = () => {
  const [searchId, setSearchId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchIdEmail] = useState('');

  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [editingFornecedor, setEditingFornecedor] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [message, setMessage] = useState(null);
  const [currentAction, setCurrentAction] = useState('deactivate');

  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 5;

  const handleToggleExpand = (id) => {
    setExpandedId(currentId => (currentId === id ? null : id));
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    setMessage(null);
    setCurrentIndex(0);
    setExpandedId(null);
    setEditingFornecedor(null);
    try {

      const response = await api.get('/api/fornecedores');
      let dados = response.data;

      if (searchId) dados = dados.filter(f => f._id.includes(searchId));
      if (searchName) dados = dados.filter(f => f.supplier_name.toLowerCase().includes(searchName.toLowerCase()));
      if (searchEmail) dados = dados.filter(f => f.contact_email.toLowerCase().includes(searchEmail.toLowerCase()));

      setFornecedores(dados);
    } catch (error) {
      console.error("Erro ao buscar:", error);
      const errorMsg = error.response ? `Status: ${error.response.status} - ${error.response.data.error || error.message}` : 'Erro de conexão/rede.';
      setMessage({ type: 'error', text: `Erro ao buscar fornecedores. Detalhe: ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };


  const startEdit = (fornecedor) => {
    setMessage(null);
    setEditingFornecedor(fornecedor);
  };


  const cancelEdit = () => {
    setEditingFornecedor(null);
  };


  const handleUpdateSubmit = async (updatedData) => {
    setLoading(true);
    setMessage(null);
    const id = updatedData._id;


    const { _id, ...dataToSend } = updatedData;

    try {

        await api.put(`/api/fornecedores/id/${id}`, dataToSend);


        setFornecedores(oldList => oldList.map(item =>
            item._id === id ? { ...item, ...dataToSend } : item
        ));

        setEditingFornecedor(null);
        setMessage({ type: 'success', text: "Fornecedor atualizado com sucesso!" });

    } catch (error) {
        console.error("Erro ao atualizar:", error);
        const errorMessage = error.response?.data?.error || "Erro desconhecido.";
        setMessage({ type: 'error', text: `Erro ao atualizar fornecedor: ${errorMessage}` });
    } finally {
        setLoading(false);
    }
  };



  const startAction = (id, action) => {
    setDeleteId(id);
    setCurrentAction(action);
    setShowConfirm(true);
  };

  const cancelAction = () => {
    setDeleteId(null);
    setShowConfirm(false);
    setCurrentAction('deactivate'); // Reset
  };


  const handleConfirmAction = async () => {
    if (!deleteId) return;
    setShowConfirm(false);
    setLoading(true);
    setMessage(null);

    try {

      if (currentAction === 'deactivate') {

        await api.put(`/api/fornecedores/id/${deleteId}`, { status: 'off' });

        setFornecedores(oldList => oldList.map(item =>
          item._id === deleteId ? { ...item, status: 'off' } : item
        ));

        setMessage({ type: 'success', text: "Fornecedor desativado com sucesso!" });

      } else if (currentAction === 'delete') {

        await api.delete(`/api/fornecedores/id/${deleteId}`);


        setFornecedores(oldList => oldList.filter(item => item._id !== deleteId));

        setMessage({ type: 'success', text: "Fornecedor e usuário associado deletados permanentemente!" });

      }

      if (expandedId === deleteId) setExpandedId(null);

    } catch (error) {
      console.error(`Erro ao ${currentAction}:`, error);
      const errorMessage = error.response?.data?.error || "Erro desconhecido.";
      setMessage({ type: 'error', text: `Erro ao ${currentAction}: ${errorMessage}` });
    } finally {
      setLoading(false);
      setDeleteId(null);
      setCurrentAction('deactivate');
    }
  };

  const nextSlide = () => {
    if (currentIndex + itemsPerPage < fornecedores.length) {
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

  const visibleItems = fornecedores.slice(currentIndex, currentIndex + itemsPerPage);
  const totalPages = Math.ceil(fornecedores.length / itemsPerPage);
  const currentPage = Math.floor(currentIndex / itemsPerPage) + 1;


  const ConfirmationModal = () => {
    const isDeleting = currentAction === 'delete';

    return (
      <div className={styles.modalBackdrop}>
        <div className={styles.modalContent}>
          <h3 className={styles.modalTitle}>
            Confirmação de {isDeleting ? 'Exclusão Permanente' : 'Desativação'}
          </h3>
          <p className={styles.modalText}>
            Tem certeza que quer {isDeleting ? 'EXCLUIR PERMANENTEMENTE este fornecedor e seu usuário associado?' : 'DESATIVAR este fornecedor?'}
          </p>

          <div className={styles.modalActions}>
            <button
              className={`${styles.submitButton} ${styles.btnCancel}`}
              onClick={cancelAction}
            >
              Cancelar
            </button>
            <button
              className={`${styles.submitButton} ${styles.btnDanger}`}
              onClick={handleConfirmAction}
              disabled={loading}
            >
              {loading ? 'Processando...' : `Confirmar ${isDeleting ? 'Exclusão' : 'Desativação'}`}
            </button>
          </div>
        </div>
      </div>
    );
  };


  const ExpandedDetailsRow = ({ fornecedor }) => (
    <div className={styles['expanded-details-row']}>
      <div className={styles['detail-full-span']}>
        <p className={styles['detail-text-p']}>
          <strong className={styles.detailLabel}>ID Completo:</strong> {fornecedor._id}
        </p>
      </div>
      <div className={styles['detail-half-span']}>
        <p className={styles['detail-text-p']}>
          <strong className={styles.detailLabel}>Categoria:</strong> {fornecedor.supplier_category || 'N/A'}
        </p>
      </div>
      <div className={styles['detail-half-span']}>
        <p className={styles['detail-text-p']}>
          <strong className={styles.detailLabel}>Telefone:</strong> {fornecedor.phone_number || 'N/A'}
        </p>
      </div>
      <div className={`${styles['detail-half-span']} ${styles['detail-status']}`}>
        <p className={styles['detail-text-p']}>
          <strong className={styles.detailLabel}>Status:</strong>
          <span className={fornecedor.status === 'off' ? styles.statusOff : styles.statusOn}>
            {' '}{fornecedor.status || 'on'}
          </span>
        </p>
      </div>
      <div className={styles['detail-full-span']}>
        <p className={styles['detail-text-p']}>
          <strong className={styles.detailLabel}>Endereço:</strong> {fornecedor.rua || 'N/A'}, {fornecedor.cidade || ''} - {fornecedor.estado || ''}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <div className={styles['search-section']}>
        <h2 className={styles['search-header']}>Consultar / Gerenciar Fornecedor</h2>

        {message && (
          <div className={`${styles.alertMessage} ${styles[message.type]}`}>
            {message.text.split('\n').map((line, index) => (
                <p key={index} className={styles.messageLine}>{line}</p>
            ))}
          </div>
        )}

        <div className={styles['search-inputs']}>
          <div className={styles['search-group']}>
            <label>ID</label>
            <input type="text" placeholder="Ex: 64b..." value={searchId} onChange={e => setSearchId(e.target.value)} />
          </div>
          <div className={styles['search-group']}>
            <label>Nome da Loja</label>
            <input type="text" placeholder="Ex: Eletrônicos..." value={searchName} onChange={e => setSearchName(e.target.value)} />
          </div>
          <div className={styles['search-group']}>
            <label>Email</label>
            <input type="text" placeholder="Ex: contato@..." value={searchEmail} onChange={e => setSearchIdEmail(e.target.value)} />
          </div>
          <button className={styles['btn-search']} onClick={handleSearch} disabled={loading}>
            <FiSearch size={20} />
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {fornecedores.length > 0 && (
          <>
            <div className={styles['provider-list-container']}>
              <div className={`${styles['provider-list-item']} ${styles['provider-list-header']}`}>
                <div className={styles['header-cell']}>Nome da Loja</div>
                <div className={styles['header-cell']}>ID (Início)</div>
                <div className={styles['header-cell']}>Email</div>
                <div className={styles['header-cell']}>Responsável</div>
                <div className={styles['header-cell-actions']}>Ações</div>
              </div>

              {visibleItems.map(fornecedor => {
                const isExpanded = expandedId === fornecedor._id;
                const isDeactivated = fornecedor.status === 'off';

                let itemClasses = styles['provider-list-item'];
                if (isExpanded) itemClasses += ` ${styles['item-expanded']}`;
                if (isDeactivated) itemClasses += ` ${styles['item-status-off']}`;

                return (
                    <React.Fragment key={fornecedor._id}>
                      <div
                          className={itemClasses}
                          onClick={() => handleToggleExpand(fornecedor._id)}
                      >
                        <div className={styles['detail-cell-name']}>
                            <p>{fornecedor.supplier_name}</p>
                        </div>
                        <div className={styles['detail-cell']}>
                            <p>{fornecedor._id.substring(0, 10) + '...'}</p>
                        </div>
                        <div className={styles['detail-cell']}>
                            <p>{fornecedor.contact_email}</p>
                        </div>
                        <div className={styles['detail-cell']}>
                            <p>{fornecedor.responsavel || '-'}</p>
                        </div>

                        <div className={styles['item-actions']}>


                          <button
                              className={`${styles['btn-detail']} ${isExpanded ? styles['btn-rotated'] : ''}`}
                              title={isExpanded ? "Esconder Detalhes" : "Ver Detalhes"}
                              onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleExpand(fornecedor._id);
                              }}
                          >
                              <FiArrowRight size={20} />
                          </button>


                          <button
                            className={styles['btn-edit']}
                            onClick={(e) => {
                                e.stopPropagation();
                                startEdit(fornecedor);
                            }}
                            title="Editar Fornecedor"
                            disabled={loading}
                          >
                            <FiEdit size={18} />
                          </button>


                          <button
                            className={styles['btn-delete']}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isDeactivated) {
                                  startAction(fornecedor._id, 'delete');
                                } else {
                                  startAction(fornecedor._id, 'deactivate');
                                }
                            }}
                            title={isDeactivated ? "Excluir Permanentemente" : "Desativar Fornecedor"}
                            disabled={loading}
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {isExpanded && <ExpandedDetailsRow fornecedor={fornecedor} />}
                    </React.Fragment>
                );
              })}
            </div>

            <div className={styles.paginationControls}>
                <button className={styles['nav-btn']} onClick={prevSlide} disabled={currentIndex === 0 || loading}>
                    <FiChevronLeft size={24} />
                </button>
                <span className={styles.pageInfo}>Página {currentPage} de {totalPages}</span>
                <button className={styles['nav-btn']} onClick={nextSlide} disabled={currentIndex + itemsPerPage >= fornecedores.length || loading}>
                    <FiChevronRight size={24} />
                </button>
            </div>
          </>
        )}

        {!loading && searched && fornecedores.length === 0 && (
          <p className={styles['no-data']}>Nenhum fornecedor encontrado.</p>
        )}
      </div>

      {showConfirm && <ConfirmationModal />}

      {editingFornecedor && (
          <EditFornecedorModal
              fornecedor={editingFornecedor}
              onSave={handleUpdateSubmit}
              onCancel={cancelEdit}
              loading={loading}
          />
      )}
    </>
  );
};



function CadastroFornecedor() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    supplier_name: '', supplier_category: '', responsavel: '', contact_email: '',
    rua: '', cidade: '', estado: '', phone_number: '',
    gerarAutomaticamente: false, senhaManual: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const dadosParaBackend = {
      ...formData,
      pwd: formData.gerarAutomaticamente ? null : formData.senhaManual,
      status: 'on'
    };

    try {

      const response = await api.post('/api/fornecedores', dadosParaBackend);
      const successText = `✅ Sucesso!\n\nFornecedor: ${response.data.fornecedor.supplier_name}\nLogin: ${response.data.usuarioGerado.user}\nSenha: ${response.data.usuarioGerado.pwd}`;
      setMessage({ type: 'success', text: successText });
      setFormData({
        supplier_name: '', supplier_category: '', responsavel: '', contact_email: '',
        rua: '', cidade: '', estado: '', phone_number: '',
        gerarAutomaticamente: false, senhaManual: ''
      });
    } catch (error) {
        const errorText = error.response?.data?.error || "Erro ao conectar com o servidor.";
        setMessage({ type: 'error', text: ` Erro: ${errorText}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['dashboard-container']}>
      <nav className={styles.sidebar}>
        <ul>
          <li><Link href="/admin/Dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20} /><span>Dashboard</span></div></Link></li>
          <li className={styles.active}><Link href="/admin/CadastroFornecedor" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20} /><span>Fornecedores</span></div></Link></li>
          <li><Link href="/admin/CadastroLogista" className={styles.linkReset}><div className={styles.menuItem}><FiBox size={20} /><span>Lojistas</span></div></Link></li>
          <li><Link href="/admin/CadastroProduto" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Produtos</span></div></Link></li>
          <li><Link href="/admin/CadastroPedidos" className={styles.linkReset}><div className={styles.menuItem}><FiShoppingBag size={20} /><span>Pedidos</span></div></Link></li>
          <li><Link href="/admin/CadastroCampanha" className={styles.linkReset}><div className={styles.menuItem}><FiTag size={20} /><span>Campanhas</span></div></Link></li>
      {/* <li><Link href="/admin/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div></Link></li> */}
          <li><Link href="/admin/Login" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
        </ul>
      </nav>

      <main className={styles['main-content']}>
        <header className={styles.header}>
          <h1>Cadastrar Fornecedor</h1>
        </header>

        {message && message.type !== 'info' && (
          <div className={`${styles.alertMessage} ${styles[message.type]}`}>
            {message.text.split('\n').map((line, index) => (
                <p key={index} className={styles.messageLine}>{line}</p>
            ))}
          </div>
        )}

        <form className={styles.formCard} onSubmit={handleSubmit}>
          <h2 className={styles.sectionTitle}>Dados do Fornecedor</h2>

          <div className={styles.fieldGroup}>
            <label>Nome do Fornecedor <span className={styles.requiredAsterisk}>*</span></label>
            <input type="text" name="supplier_name" className={styles.inputLong} value={formData.supplier_name} onChange={handleChange} required />
          </div>

          <div className={styles.fieldGroup}>
            <label>Categoria do fornecedor <span className={styles.requiredAsterisk}>*</span></label>
            <input type="text" name="supplier_category" className={styles.inputLong} placeholder="Ex: Eletrônicos..." value={formData.supplier_category} onChange={handleChange} required />
          </div>

          <div className={styles.fieldGroup}>
            <label>Responsável</label>
            <input type="text" name="responsavel" className={styles.inputLong} value={formData.responsavel} onChange={handleChange} />
          </div>

          <div className={styles.fieldGroup}>
            <label>Email (Login) <span className={styles.requiredAsterisk}>*</span></label>
            <input type="email" name="contact_email" className={styles.inputLong} value={formData.contact_email} onChange={handleChange} required />
          </div>

          <h2 className={styles.sectionTitle}>Endereço</h2>
          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label>Rua/Avenida</label>
              <input type="text" name="rua" className={styles.inputMedium} value={formData.rua} onChange={handleChange} />
            </div>
            <div className={styles.fieldGroup}>
              <label>Cidade</label>
              <input type="text" name="cidade" className={styles.inputMedium} value={formData.cidade} onChange={handleChange} />
            </div>
            <div className={styles.fieldGroup}>
              <label>Estado (UF)</label>
              <input type="text" name="estado" className={styles.inputMedium} placeholder="Ex: SP" value={formData.estado} onChange={handleChange} />
            </div>
          </div>

          <h2 className={styles.sectionTitle}>Contatos</h2>
          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label>Telefone</label>
              <input type="text" name="phone_number" className={styles.inputMedium} value={formData.phone_number} onChange={handleChange} />
            </div>
          </div>

          {!formData.gerarAutomaticamente && (
            <div className={styles.fieldGroup}>
              <label>Senha (opcional)</label>
              <input type="password" name="senhaManual" className={styles.inputMedium} value={formData.senhaManual} onChange={handleChange} placeholder="Deixe vazio para gerar auto" />
            </div>
          )}

          <div className={styles.footer}>
            <label className={styles.checkboxContainer}>
              <input type="checkbox" name="gerarAutomaticamente" checked={formData.gerarAutomaticamente} onChange={handleChange} />
              <span className={styles.checkmark}></span>
              Gerar senha automaticamente
            </label>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Cadastrando...' : 'Criar Fornecedor'}
            </button>
          </div>
        </form>

        <hr className={styles.divider} />
        <BuscaFornecedores />
      </main>
    </div>
  );
}


export default withAuth(CadastroFornecedor);