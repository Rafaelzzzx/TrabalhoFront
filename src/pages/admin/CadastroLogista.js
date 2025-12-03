import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../../styles/Loja.module.css'; // Usando o mesmo arquivo CSS
import api from '../../services/api';
import {
  FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiBox,
  FiSearch, FiArrowRight, FiTrash2, FiChevronLeft, FiChevronRight, FiEdit, FiShoppingBag, FiTag
} from 'react-icons/fi';

// --- NOVO COMPONENTE: MODAL DE EDIÇÃO PARA LOGISTAS ---

const EditLogistaModal = ({ logista, onSave, onCancel, loading }) => {
    // Mapeia os nomes das propriedades do backend (ex: contact_email) para o formulário
    const initialFormData = {
        store_name: logista.store_name || '',
        cnpj: logista.cnpj || '',
        responsavel: logista.responsavel || '',
        contact_email: logista.contact_email || '', // Email de login
        address: logista.address || '', // Rua/Avenida
        cidade: logista.cidade || '',
        estado: logista.estado || '',
        phone_number: logista.phone_number || '',
        status: logista.status || 'on'
    };

    const [formData, setFormData] = useState(initialFormData);

    // Garante que o estado interno do formulário é resetado se o 'logista' mudar
    useEffect(() => {
        setFormData(initialFormData);
    }, [logista]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // A função onSave será responsável por chamar a API PUT
        onSave({ ...formData, _id: logista._id }); // Inclui o ID para a função de salvamento
    };

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
                <h3 className={styles.modalTitle}>Editar Loja: {logista.store_name}</h3>

                <form onSubmit={handleSubmit}>

                    {/* Linha 1: Nome e CNPJ */}
                    <div className={styles.row}>
                        <div className={styles.fieldGroup}>
                            <label>Nome da Loja</label>
                            <input type="text" name="store_name" value={formData.store_name} onChange={handleChange} required className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>CNPJ</label>
                            <input type="text" name="cnpj" value={formData.cnpj || ''} onChange={handleChange} className={styles.inputModal} />
                        </div>
                    </div>

                    {/* Linha 2: Responsável e Email (Email não deve ser alterado) */}
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

                    {/* Linha 3: Telefone */}
                    <div className={styles.row}>
                         <div className={styles.fieldGroup}>
                            <label>Telefone</label>
                            <input type="text" name="phone_number" value={formData.phone_number || ''} onChange={handleChange} className={styles.inputModal} />
                        </div>
                    </div>

                    {/* Linha 4: Endereço (3 colunas) */}
                    <h4 className={styles.sectionTitle} style={{ marginTop: '15px' }}>Endereço</h4>
                    <div className={styles.row}>
                        {/* Se o seu CSS usa fieldGroup, ele deve ter flex: 1 para dividir o espaço */}
                        <div className={styles.fieldGroup}>
                            <label>Rua/Avenida</label>
                            <input type="text" name="address" value={formData.address || ''} onChange={handleChange} className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Cidade</label>
                            <input type="text" name="cidade" value={formData.cidade || ''} onChange={handleChange} className={styles.inputModal} />
                        </div>
                        <div className={styles.fieldGroup}>
                            <label>Estado (UF)</label>
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


// ============================================================================
// COMPONENTE: BuscaLogistas (Com lógica de Edição e Ações Refatorada)
// ============================================================================
const BuscaLogistas = () => {
  const [searchId, setSearchId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');

  const [logistas, setLogistas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Estados para UI/Feedback
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [message, setMessage] = useState(null);
  const [currentAction, setCurrentAction] = useState('deactivate');

  // ⭐️ NOVO ESTADO PARA EDIÇÃO
  const [editingLogista, setEditingLogista] = useState(null);

  // Paginação
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 5;

  // --- Funções ---

  const handleToggleExpand = (id) => {
    setExpandedId(currentId => (currentId === id ? null : id));
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    setMessage(null);
    setCurrentIndex(0);
    setExpandedId(null);
    setEditingLogista(null); // Fecha o modal de edição ao buscar

    try {
      // ✅ Corrigido: Adicionar o parâmetro de busca para forçar o backend a incluir todos os status
      const response = await api.get('/api/lojas?status=all');
      let dados = response.data;

      if (searchId) dados = dados.filter(l => l._id.includes(searchId));
      if (searchName) dados = dados.filter(l => l.store_name?.toLowerCase().includes(searchName.toLowerCase()));
      if (searchEmail) dados = dados.filter(l => l.contact_email?.toLowerCase().includes(searchEmail.toLowerCase()));

      setLogistas(dados);
    } catch (error) {
      console.error("Erro ao buscar:", error);
      setMessage({ type: 'error', text: "Erro ao buscar logistas." });
    } finally {
      setLoading(false);
    }
  };

  // ⭐️ Iniciar a Edição
  const startEdit = (logista) => {
    setMessage(null);
    setEditingLogista(logista);
  };

  // ⭐️ Cancelar a Edição
  const cancelEdit = () => {
    setEditingLogista(null);
  };

  // ⭐️ Submissão da Atualização (PUT)
  const handleUpdateSubmit = async (updatedData) => {
    setLoading(true);
    setMessage(null);
    const id = updatedData._id;

    // Remove o ID do corpo da requisição e prepara o PUT
    const { _id, ...dataToSend } = updatedData;

    try {
        // Rota de atualização (PUT)
        await api.put(`/api/lojas/${id}`, dataToSend);

        // Atualiza o estado da lista no frontend com os novos dados
        setLogistas(oldList => oldList.map(item =>
            item._id === id ? { ...item, ...dataToSend } : item
        ));

        setEditingLogista(null); // Fecha o modal
        setMessage({ type: 'success', text: "Logista atualizado com sucesso!" });

    } catch (error) {
        console.error("Erro ao atualizar:", error);
        const errorMessage = error.response?.data?.error || "Erro desconhecido.";
        setMessage({ type: 'error', text: `Erro ao atualizar logista: ${errorMessage}` });
    } finally {
        setLoading(false);
    }
  };


  // ✅ NOVO: Substitui startDelete e lida com os dois tipos de ação
  const startAction = (id, type) => {
    setDeleteId(id);
    setCurrentAction(type); // Define a ação que será executada
    setShowConfirm(true);
  };

  // ✅ NOVO: Função refatorada para lidar com desativação (PUT) ou exclusão definitiva (DELETE)
  const handleConfirmAction = async () => {
    if (!deleteId) return;
    setShowConfirm(false);
    setLoading(true);
    setMessage(null);

    try {
      if (currentAction === 'delete') {
        // Lógica para EXCLUSÃO PERMANENTE (DELETE)
        await api.delete(`/api/lojas/${deleteId}`);
        setLogistas(oldList => oldList.filter(item => item._id !== deleteId));
        setMessage({ type: 'success', text: "Logista excluído permanentemente com sucesso!" });

      } else {
        // Lógica para DESATIVAÇÃO (PUT para status: 'off')
        await api.put(`/api/lojas/${deleteId}`, { status: 'off' });

        setLogistas(oldList => oldList.map(item =>
          item._id === deleteId ? { ...item, status: 'off' } : item
        ));
        setMessage({ type: 'success', text: "Logista desativado com sucesso!" });
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

  const nextSlide = () => {
    if (currentIndex + itemsPerPage < logistas.length) {
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

  const visibleItems = logistas.slice(currentIndex, currentIndex + itemsPerPage);
  const totalPages = Math.ceil(logistas.length / itemsPerPage);
  const currentPage = Math.floor(currentIndex / itemsPerPage) + 1;

  // --- Modal de Confirmação (Limpo e usando classes) ---
  const ConfirmationModal = () => {
    const isDelete = currentAction === 'delete';
    const title = isDelete ? 'Confirmação de Exclusão' : 'Confirmação de Desativação';
    const text = isDelete
      ? 'Tem certeza que quer EXCLUIR PERMANENTEMENTE essa loja? Esta ação não pode ser desfeita.'
      : 'Tem certeza que quer DESATIVAR essa loja? O acesso será revogado, mas a loja poderá ser reativada posteriormente.';

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
              onClick={handleConfirmAction} // Chamando a função refatorada
              disabled={loading}
            >
              {loading ? 'Processando...' : `Confirmar ${isDelete ? 'Exclusão' : 'Desativação'}`}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- Detalhes Expandidos (Limpo) ---
  const ExpandedDetailsRow = ({ item }) => (
    <div className={styles['expanded-details-row']}>
      <div className={styles['detail-full-span']}>
        <p className={styles['detail-text-p']}>
          <strong className={styles.detailLabel}>ID Completo:</strong> {item._id}
        </p>
      </div>
      <div className={styles['detail-half-span']}>
        <p className={styles['detail-text-p']}>
          <strong className={styles.detailLabel}>CNPJ:</strong> {item.cnpj || 'N/A'}
        </p>
      </div>
      <div className={styles['detail-half-span']}>
        <p className={styles['detail-text-p']}>
          <strong className={styles.detailLabel}>Telefone:</strong> {item.phone_number || 'N/A'}
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
      <div className={styles['detail-full-span']}>
        <p className={styles['detail-text-p']}>
          <strong className={styles.detailLabel}>Endereço:</strong> {item.address || 'N/A'}, {item.cidade || ''} - {item.estado || ''}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <div className={styles['search-section']}>
        <h2 className={styles['search-header']}>Consultar / Gerenciar Lojistas</h2>

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
            <input type="text" placeholder="Ex: Tech Store..." value={searchName} onChange={e => setSearchName(e.target.value)} />
          </div>
          <div className={styles['search-group']}>
            <label>Email</label>
            <input type="text" placeholder="Ex: loja@..." value={searchEmail} onChange={e => setSearchEmail(e.target.value)} />
          </div>
          <button className={styles['btn-search']} onClick={handleSearch} disabled={loading}>
            <FiSearch size={20} />
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {logistas.length > 0 && (
          <>
            <div className={styles['provider-list-container']}>
              <div className={`${styles['provider-list-item']} ${styles['provider-list-header']}`}>
                <div className={styles['header-cell']}>Nome da Loja</div>
                <div className={styles['header-cell']}>ID (Início)</div>
                <div className={styles['header-cell']}>Email</div>
                <div className={styles['header-cell']}>Responsável</div>
                <div className={styles['header-cell-actions']}>Ações</div>
              </div>

              {visibleItems.map(item => {
                const isExpanded = expandedId === item._id;
                const isDeactivated = item.status === 'off';

                // Classes dinâmicas baseadas no CSS Module
                let itemClasses = styles['provider-list-item'];
                if (isExpanded) itemClasses += ` ${styles['item-expanded']}`;
                if (isDeactivated) itemClasses += ` ${styles['item-status-off']}`;

                return (
                  <React.Fragment key={item._id}>
                    <div
                      className={itemClasses}
                      onClick={() => handleToggleExpand(item._id)}
                    >
                      <div className={styles['detail-cell-name']}>
                        <p>{item.store_name}</p>
                      </div>
                      <div className={styles['detail-cell']}>
                        <p>{item._id.substring(0, 10) + '...'}</p>
                      </div>
                      <div className={styles['detail-cell']}>
                        <p>{item.contact_email}</p>
                      </div>
                      <div className={styles['detail-cell']}>
                        <p>{item.responsavel || '-'}</p>
                      </div>
                      <div className={styles['item-actions']}>

                        {/* 1. Botão de Expandir/Detalhes */}
                        <button
                          className={`${styles['btn-detail']} ${isExpanded ? styles['btn-rotated'] : ''}`}
                          title={isExpanded ? "Esconder Detalhes" : "Ver Detalhes"}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleExpand(item._id);
                          }}
                        >
                          <FiArrowRight size={20} />
                        </button>

                        {/* 2. ⭐️ NOVO: Botão de Editar */}
                        <button
                            className={styles['btn-edit']}
                            onClick={(e) => {
                                e.stopPropagation();
                                startEdit(item);
                            }}
                            title="Editar Lojista"
                            disabled={loading}
                          >
                            <FiEdit size={18} />
                        </button>

                        {/* 3. Botão de Excluir/Desativar */}
                        <button
                          className={styles['btn-delete']}
                          onClick={(e) => {
                            e.stopPropagation();
                            // ✅ CORRIGIDO: Agora chama a função startAction
                            if (isDeactivated) {
                              startAction(item._id, 'delete'); // Exclusão definitiva
                            } else {
                              startAction(item._id, 'deactivate'); // Desativação
                            }
                          }}
                          title={isDeactivated ? "Excluir Permanentemente" : "Desativar Lojista"}
                          disabled={loading}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {isExpanded && <ExpandedDetailsRow item={item} />}
                  </React.Fragment>
                );
              })}
            </div>

            <div className={styles.paginationControls}>
              <button className={styles['nav-btn']} onClick={prevSlide} disabled={currentIndex === 0 || loading}>
                <FiChevronLeft size={24} />
              </button>
              <span className={styles.pageInfo}>Página {currentPage} de {totalPages}</span>
              <button className={styles['nav-btn']} onClick={nextSlide} disabled={currentIndex + itemsPerPage >= logistas.length || loading}>
                <FiChevronRight size={24} />
              </button>
            </div>
          </>
        )}

        {!loading && searched && logistas.length === 0 && (
          <p className={styles['no-data']}>Nenhuma loja encontrada com os filtros especificados.</p>
        )}
      </div>

      {showConfirm && <ConfirmationModal />}

      {/* ⭐️ Renderiza o Modal de Edição se houver um lojista selecionado */}
      {editingLogista && (
          <EditLogistaModal
              logista={editingLogista}
              onSave={handleUpdateSubmit}
              onCancel={cancelEdit}
              loading={loading}
          />
      )}
    </>
  );
};


// ============================================================================
// COMPONENTE PRINCIPAL: CadastroLogista (inalterado)
// ============================================================================
export default function CadastroLogista() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // Adicionado estado de mensagem unificado

  const [formData, setFormData] = useState({
    nomeLoja: '', cnpj: '', responsavel: '', email: '',
    rua: '', cidade: '', estado: '', telefone: '',
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

    const dadosFinaisParaBackend = {
      store_name: formData.nomeLoja,
      cnpj: formData.cnpj,
      contact_email: formData.email,
      address: formData.rua,
      phone_number: formData.telefone,
      cidade: formData.cidade, // Garantindo que cidade vá se existir no backend
      estado: formData.estado, // Garantindo que estado vá se existir no backend
      pwd: formData.gerarAutomaticamente ? null : formData.senhaManual,
      responsavel: formData.responsavel
    };

    try {
      const response = await api.post('/api/lojas/cadastroLoja', dadosFinaisParaBackend);

      const successText = `✅ Sucesso! Loja cadastrada.\n\nLogin: ${response.data.usuarioGerado.user}\nSenha: ${response.data.senhaUsada}`;
      setMessage({ type: 'success', text: successText });

      setFormData({
        nomeLoja: '', cnpj: '', responsavel: '', email: '',
        rua: '', cidade: '', estado: '', telefone: '',
        gerarAutomaticamente: false, senhaManual: ''
      });
    } catch (error) {
      console.error("Erro ao cadastrar Logista:", error);
      const errorMessage = error.response?.data?.erro || (error.response?.data?.erros && error.response.data.erros.join('\n')) || "Erro interno.";
      setMessage({ type: 'error', text: `❌ Erro: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['dashboard-container']}>

      {/* --- SIDEBAR --- */}
      <nav className={styles.sidebar}>
        <ul>
          <li><Link href="/admin/Dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20} /><span>Dashboard</span></div></Link></li>
          <li><Link href="/admin/CadastroFornecedor" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20} /><span>Fornecedores</span></div></Link></li>
          <li className={styles.active}><Link href="/admin/CadastroLogista" className={styles.linkReset}><div className={styles.menuItem}><FiBox size={20} /><span>Lojistas</span></div></Link></li>
          <li><Link href="/admin/CadastroProduto" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Produtos</span></div></Link></li>
          <li><Link href="/admin/CadastroPedidos" className={styles.linkReset}><div className={styles.menuItem}><FiShoppingBag size={20} /><span>Pedidos</span></div></Link></li>
          <li><Link href="/admin/CadastroCampanha" className={styles.linkReset}><div className={styles.menuItem}><FiTag size={20} /><span>Campanhas</span></div></Link></li>
      {/*    <li><Link href="/admin/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div></Link></li> */}
          <li><Link href="/admin/Login" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
        </ul>
      </nav>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className={styles['main-content']}>
        <header className={styles.header}>
          <h1>Cadastrar Lojista</h1>
        </header>

        {/* Mensagens de Feedback no Topo */}
        {message && message.type !== 'info' && (
          <div className={`${styles.alertMessage} ${styles[message.type]}`}>
            {message.text.split('\n').map((line, index) => (
              <p key={index} className={styles.messageLine}>{line}</p>
            ))}
          </div>
        )}

        <form className={styles.formCard} onSubmit={handleSubmit}>
          <h2 className={styles.sectionTitle}>Dados do Lojista</h2>

          <div className={styles.fieldGroup}>
            <label>Nome da Loja <span className={styles.requiredAsterisk}>*</span></label>
            <input type="text" name="nomeLoja" className={styles.inputLong} value={formData.nomeLoja} onChange={handleChange} required />
          </div>

          <div className={styles.fieldGroup}>
            <label>CNPJ <span className={styles.requiredAsterisk}>*</span></label>
            <input type="text" name="cnpj" className={styles.inputLong} value={formData.cnpj} onChange={handleChange} placeholder="99.999.999/0001-88" required />
          </div>

          <div className={styles.fieldGroup}>
            <label>Responsável</label>
            <input type="text" name="responsavel" className={styles.inputLong} value={formData.responsavel} onChange={handleChange} />
          </div>

          <div className={styles.fieldGroup}>
            <label>Email Principal (Login) <span className={styles.requiredAsterisk}>*</span></label>
            <input type="email" name="email" className={styles.inputLong} value={formData.email} onChange={handleChange} required />
          </div>

          <h2 className={styles.sectionTitle}>Endereço</h2>
          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label>Rua</label>
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
              <input type="text" name="telefone" className={styles.inputMedium} value={formData.telefone} onChange={handleChange} />
            </div>
          </div>

          {!formData.gerarAutomaticamente && (
            <div className={styles.fieldGroup}>
              <label>Senha (opcional)</label>
              <input type="password" name="senhaManual" className={styles.inputMedium} value={formData.senhaManual} onChange={handleChange} placeholder="Deixe vazio para gerar automaticamente" />
            </div>
          )}

          <div className={styles.footer}>
            <label className={styles.checkboxContainer}>
              <input type="checkbox" name="gerarAutomaticamente" checked={formData.gerarAutomaticamente} onChange={handleChange} />
              <span className={styles.checkmark}></span>
              Gerar senha automaticamente
            </label>

            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Cadastrando...' : 'Criar Lojista'}
            </button>
          </div>
        </form>

        {/* Divisória e Componente de Busca */}
        <hr className={styles.divider} />
        <BuscaLogistas />

      </main>
    </div>
  );
}