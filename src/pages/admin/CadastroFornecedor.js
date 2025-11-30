import React, { useState } from 'react';
import Link from 'next/link';
import api from '../../services/api';
import styles from '../../styles/Loja.module.css';
import {
  FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiBox,
  FiSearch, FiTrash2, FiChevronLeft, FiChevronRight,
  FiChevronRight as FiArrowRight,
} from 'react-icons/fi';

// --- COMPONENTE INTERNO: BUSCA E DELETE ---

const BuscaFornecedores = () => {
  const [searchId, setSearchId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');

  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [message, setMessage] = useState(null);

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

    try {
      const response = await api.get('/api/fornecedores/cadastroFornecedor');
      let dados = response.data;

      if (searchId) dados = dados.filter(f => f._id.includes(searchId));
      if (searchName) dados = dados.filter(f => f.supplier_name.toLowerCase().includes(searchName.toLowerCase()));
      if (searchEmail) dados = dados.filter(f => f.contact_email.toLowerCase().includes(searchEmail.toLowerCase()));

      setFornecedores(dados);
    } catch (error) {
      console.error("Erro ao buscar:", error);
      setMessage({ type: 'error', text: "Erro ao buscar fornecedores." });
    } finally {
      setLoading(false);
    }
  };

  const startDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setShowConfirm(false);
    setLoading(true);
    setMessage(null);

    try {
      await api.put(`/api/fornecedores/cadastroFornecedor/${deleteId}`, { status: 'off' });

      setFornecedores(oldList => oldList.map(item =>
        item._id === deleteId ? { ...item, status: 'off' } : item
      ));

      if (expandedId === deleteId) setExpandedId(null);

      setMessage({ type: 'success', text: "Fornecedor desativado com sucesso!" });
    } catch (error) {
      console.error("Erro ao desativar:", error);
      const errorMessage = error.response?.data?.error || "Erro desconhecido.";
      setMessage({ type: 'error', text: `Erro ao desativar: ${errorMessage}` });
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
    setShowConfirm(false);
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

  // --- Modal de Confirmação (Limpo) ---
  const ConfirmationModal = () => (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h3 className={styles.modalTitle}>Confirmação de Desativação</h3>
        <p className={styles.modalText}>
          Tem certeza que quer desativar esse fornecedor?
        </p>

        <div className={styles.modalActions}>
          <button
            className={`${styles.submitButton} ${styles.btnCancel}`}
            onClick={cancelDelete}
          >
            Cancelar
          </button>
          <button
            className={`${styles.submitButton} ${styles.btnDanger}`}
            onClick={confirmDelete}
            disabled={loading}
          >
            {loading ? 'Desativando...' : 'Confirmar Desativação'}
          </button>
        </div>
      </div>
    </div>
  );

  // --- Linha Expandida (Limpo) ---
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
        <h2 className={styles['search-header']}>Consultar / Desativar Fornecedor</h2>

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
            <input type="text" placeholder="Ex: contato@..." value={searchEmail} onChange={e => setSearchEmail(e.target.value)} />
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

                // Construção dinâmica de classes (sem estilo inline)
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
                            className={styles['btn-delete']}
                            onClick={(e) => { e.stopPropagation(); startDelete(fornecedor._id); }}
                            title={isDeactivated ? "Já desativado" : "Desativar"}
                            disabled={loading || isDeactivated}
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
    </>
  );
};

export default function CadastroFornecedor() {
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
      const response = await api.post('/api/fornecedores/cadastroFornecedor', dadosParaBackend);
      const successText = `✅ Sucesso!\n\nFornecedor: ${response.data.fornecedor.supplier_name}\nLogin: ${response.data.usuarioGerado.user}\nSenha: ${response.data.usuarioGerado.pwd}`;
      setMessage({ type: 'success', text: successText });
      setFormData({
        supplier_name: '', supplier_category: '', responsavel: '', contact_email: '',
        rua: '', cidade: '', estado: '', phone_number: '',
        gerarAutomaticamente: false, senhaManual: ''
      });
    } catch (error) {
        const errorText = error.response?.data?.error || "Erro ao conectar com o servidor.";
        setMessage({ type: 'error', text: `❌ Erro: ${errorText}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['dashboard-container']}>
      <nav className={styles.sidebar}>
        <ul>
          <li><Link href="/admin/Dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20} /><span>Dashboard</span></div></Link></li>
          <li className={styles.active}><Link href="/admin/CadastroFornecedor" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20} /><span>Cadastrar Fornecedores</span></div></Link></li>
          <li><Link href="/admin/CadastroLogista" className={styles.linkReset}><div className={styles.menuItem}><FiBox size={20} /><span>Cadastrar Lojistas</span></div></Link></li>
          <li><Link href="/admin/CadastroProduto" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Cadastrar Produtos</span></div></Link></li>
          <li><Link href="/admin/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div></Link></li>
          <li><Link href="/Login" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
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
            <label>Nome da loja <span className={styles.requiredAsterisk}>*</span></label>
            <input type="text" name="supplier_name" className={styles.inputLong} value={formData.supplier_name} onChange={handleChange} required />
          </div>

          <div className={styles.fieldGroup}>
            <label>Categoria da Loja <span className={styles.requiredAsterisk}>*</span></label>
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