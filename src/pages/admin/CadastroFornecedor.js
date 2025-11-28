import React, { useState } from 'react';
import Link from 'next/link';
// Importação do 'api' (manter caminho original)
import api from '../../services/api';
// Importação dos estilos (manter caminho original)
import styles from '../../styles/Loja.module.css';
import {
  FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiBox,
  FiSearch, FiTrash2, FiChevronLeft, FiChevronRight,
  FiChevronRight as FiArrowRight, // Alias usado para a seta de expandir
} from 'react-icons/fi';

// --- COMPONENTE INTERNO: BUSCA E DELETE ---

const BuscaFornecedores = () => {
  // --- Estados ---
  const [searchId, setSearchId] = useState('');
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');

  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Estados para UI/Feedback
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [message, setMessage] = useState(null);

  // Paginação
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 5;

  // Corres dinâmicas (mantidas como variáveis simples)
  const DETAIL_LABEL_COLOR = '#007bff';

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

    try {
      const response = await api.get('/api/fornecedores/cadastroFornecedor');
      let dados = response.data;

      // FILTRAR APENAS FORNECEDORES COM STATUS 'ON' (ATIVOS)
      dados = dados.filter(f => f.status !== 'off');

      // Filtros existentes
      if (searchId) {
        dados = dados.filter(f => f._id.includes(searchId));
      }
      if (searchName) {
        dados = dados.filter(f =>
          f.supplier_name.toLowerCase().includes(searchName.toLowerCase())
        );
      }
      if (searchEmail) {
        dados = dados.filter(f =>
          f.contact_email.toLowerCase().includes(searchEmail.toLowerCase())
        );
      }

      setFornecedores(dados);
    } catch (error) {
      console.error("Erro ao buscar:", error);
      setMessage({ type: 'error', text: "Erro ao buscar fornecedores. Verifique o console para detalhes." });
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
      await api.put(`/api/fornecedores/cadastroFornecedor/${deleteId}`, {
          status: 'off'
      });

      setFornecedores(oldList => oldList.filter(item => item._id !== deleteId));

      if (expandedId === deleteId) {
          setExpandedId(null);
      }

      const remainingItems = fornecedores.length - 1;
      if (remainingItems % itemsPerPage === 0 && currentIndex >= remainingItems && remainingItems > 0) {
          setCurrentIndex(curr => Math.max(0, curr - itemsPerPage));
      }

      setMessage({ type: 'success', text: "Fornecedor desativado (status 'off') com sucesso!" });

    } catch (error) {
      console.error("Erro ao desativar:", error);
      const status = error.response?.status || 'N/A';
      const errorMessage = error.response?.data?.error || "Erro de rede/servidor. Verifique se a rota PUT está ativa e correta.";
      setMessage({ type: 'error', text: `❌ Erro ao desativar o fornecedor (Status ${status}): ${errorMessage}` });
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


  // Renderização do Modal de Confirmação (Corrigido e com cores Verde/Vermelho)
  const ConfirmationModal = () => (
    <div className={styles.modalBackdrop} style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000,
        display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div className={styles.modalContent} style={{
          backgroundColor: 'white', padding: '30px', borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', maxWidth: '450px', width: '90%'
      }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Confirmação de Desativação</h3>
        <p style={{ marginBottom: '25px', color: '#555' }}>
          Tem certeza que quer desativar esse fornecedor?
        </p>

        <div className={styles.modalActions}>
          {/* Botão Cancelar (VERDE) */}
          <button
            className={`${styles.submitButton} ${styles.btnCancel}`}
            onClick={cancelDelete}
          >
            Cancelar
          </button>

          {/* Botão Confirmar Desativação (VERMELHO) */}
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
  ); // <--- ONDE ESTAVA O ERRO: FALTAVA FECHAR A FUNÇÃO COM O parênteses e ponto e vírgula!

  // Componente/Função para renderizar os detalhes expandidos (USANDO CLASSES CSS)
  const ExpandedDetailsRow = ({ fornecedor }) => (
    <div className={styles['expanded-details-row']}>

      {/* 1. ID Completo (Ocupa 4 colunas) */}
      <div className={styles['detail-full-span']}>
        <p className={styles['detail-text-p']}>
          <strong style={{ color: DETAIL_LABEL_COLOR }}>ID Completo:</strong> {fornecedor._id}
        </p>
      </div>

      {/* 2. Categoria */}
      <div className={styles['detail-half-span']}>
        <p className={styles['detail-text-p']}>
          <strong style={{ color: DETAIL_LABEL_COLOR }}>Categoria:</strong> {fornecedor.supplier_category || 'N/A'}
        </p>
      </div>

      {/* 3. Telefone */}
      <div className={styles['detail-half-span']}>
        <p className={styles['detail-text-p']}>
          <strong style={{ color: DETAIL_LABEL_COLOR }}>Telefone:</strong> {fornecedor.phone_number || 'N/A'}
        </p>
      </div>

      {/* 4. Status (1fr - Destaque de cor) */}
      <div className={`${styles['detail-half-span']} ${styles['detail-status']}`}>
        <p className={styles['detail-text-p']}>
          <strong style={{ color: DETAIL_LABEL_COLOR }}>Status:</strong>
          <span style={{ color: fornecedor.status === 'off' ? '#dc3545' : '#28a745' }}>
            {' '}{fornecedor.status || 'on'}
          </span>
        </p>
      </div>

      {/* 5. Endereço (Ocupa 4 colunas) */}
      <div className={styles['detail-full-span']}>
        <p className={styles['detail-text-p']}>
          <strong style={{ color: DETAIL_LABEL_COLOR }}>Endereço:</strong> {fornecedor.rua || 'N/A'}, {fornecedor.cidade || ''} - {fornecedor.estado || ''}
        </p>
      </div>
    </div>
  );

  return (
    <>
      <div className={styles['search-section']}>
        <h2 className={styles['search-header']}>Consultar / Desativar Fornecedor</h2>

        {/* Mensagens de Feedback */}
        {message && (
          <div className={`${styles.alertMessage} ${styles[message.type]}`}>
            {message.text.split('\n').map((line, index) => (
                <p key={index} style={{margin: '5px 0', whiteSpace: 'pre-wrap'}}>{line}</p>
            ))}
          </div>
        )}

        {/* Inputs de Busca */}
        <div className={styles['search-inputs']}>
          <div className={styles['search-group']}>
            <label>ID</label>
            <input
              type="text"
              placeholder="Ex: 64b..."
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
            />
          </div>

          <div className={styles['search-group']}>
            <label>Nome da Loja</label>
            <input
              type="text"
              placeholder="Ex: Eletrônicos..."
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
            />
          </div>

          <div className={styles['search-group']}>
            <label>Email</label>
            <input
              type="text"
              placeholder="Ex: contato@..."
              value={searchEmail}
              onChange={e => setSearchEmail(e.target.value)}
            />
          </div>

          <button className={styles['btn-search']} onClick={handleSearch} disabled={loading}>
            <FiSearch size={20} />
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>


        {/* Lista de Resultados */}
        {fornecedores.length > 0 && (
          <>
            <div className={styles['provider-list-container']}>

              {/* Cabeçalho Fixo da Lista para o Grid */}
              <div className={`${styles['provider-list-item']} ${styles['provider-list-header']}`}>
                <div className={styles['header-cell']}>Nome da Loja</div>
                <div className={styles['header-cell']}>ID (Início)</div>
                <div className={styles['header-cell']}>Email</div>
                <div className={styles['header-cell']}>Responsável</div>
                <div className={styles['header-cell-actions']}>Ações</div>
              </div>

              {/* Itens Visíveis */}
              {visibleItems.map(fornecedor => (
                <React.Fragment key={fornecedor._id}>
                  <div
                      className={styles['provider-list-item']}
                      // Mantendo estilos de cor no inline pois são condicionais e dinâmicos
                      style={{
                          backgroundColor: expandedId === fornecedor._id ? '#eaf5ff' : '#fff',
                          marginBottom: expandedId === fornecedor._id ? '0' : '8px',
                          borderRadius: expandedId === fornecedor._id ? '8px 8px 0 0' : '8px',
                          borderBottom: expandedId === fornecedor._id ? 'none' : '1px solid #eee',
                          cursor: 'pointer',
                      }}
                      onClick={() => handleToggleExpand(fornecedor._id)}
                  >

                    {/* 1. Nome da Loja (Destaque) */}
                    <div className={styles['detail-cell-name']}>
                        <p>{fornecedor.supplier_name}</p>
                    </div>

                    {/* 2. ID (Truncado) */}
                    <div className={styles['detail-cell']}>
                        <p>{fornecedor._id.substring(0, 10) + '...'}</p>
                    </div>

                    {/* 3. Email */}
                    <div className={styles['detail-cell']}>
                        <p>{fornecedor.contact_email}</p>
                    </div>

                    {/* 4. Responsável */}
                    <div className={styles['detail-cell']}>
                        <p>{fornecedor.responsavel || '-'}</p>
                    </div>

                    {/* 5. Ações */}
                    <div className={styles['item-actions']}>
                      {/* Botão de Detalhes/Avançar (Seta) */}
                      <button
                          className={styles['btn-detail']}
                          title={expandedId === fornecedor._id ? "Esconder Detalhes" : "Ver Detalhes"}
                          onClick={(e) => {
                              e.stopPropagation();
                              handleToggleExpand(fornecedor._id);
                          }}
                          // Mantendo estilo de rotação no inline, pois é condicional e dinâmico
                          style={{
                              transform: expandedId === fornecedor._id ? 'rotate(90deg)' : 'rotate(0deg)',
                          }}
                      >
                          <FiArrowRight size={20} />
                      </button>

                      {/* Botão de Desativar (Lixeira) */}
                      <button
                        className={styles['btn-delete']}
                        onClick={(e) => { e.stopPropagation(); startDelete(fornecedor._id); }}
                        title="Desativar Fornecedor (Status 'off')"
                        disabled={loading}
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>

                  </div>

                  {/* --- Linha de Detalhes Expandida (Renderização Condicional) --- */}
                  {expandedId === fornecedor._id && <ExpandedDetailsRow fornecedor={fornecedor} />}

                </React.Fragment>
              ))}
            </div>

            {/* Controles de Paginação Abaixo da Lista */}
            <div className={styles.paginationControls}>
                <button
                    className={styles['nav-btn']}
                    onClick={prevSlide}
                    disabled={currentIndex === 0 || loading}
                >
                    <FiChevronLeft size={24} />
                </button>

                <span className={styles.pageInfo}>
                    Página {currentPage} de {totalPages}
                </span>

                <button
                    className={styles['nav-btn']}
                    onClick={nextSlide}
                    disabled={currentIndex + itemsPerPage >= fornecedores.length || loading}
                >
                    <FiChevronRight size={24} />
                </button>
            </div>
          </>
        )}

        {!loading && searched && fornecedores.length === 0 && (
          <p className={styles['no-data']}>Nenhum fornecedor ativo encontrado.</p>
        )}
      </div>

      {/* RENDERIZAÇÃO DO MODAL NO FINAL DO CONTEÚDO */}
      {showConfirm && <ConfirmationModal />}
    </>
  );
};


// --- COMPONENTE PRINCIPAL (EXPORT DEFAULT) ---
export default function CadastroFornecedor() {
// ... (O restante do componente CadastroFornecedor é mantido inalterado)
// ...
// CÓDIGO DO CadastroFornecedor (CADASTRAR) MANTIDO INALTERADO
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    supplier_name: '',
    supplier_category: '',
    responsavel: '',
    contact_email: '',
    rua: '',
    cidade: '',
    estado: '',
    phone_number: '',
    gerarAutomaticamente: false,
    senhaManual: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const dadosParaBackend = {
      supplier_name: formData.supplier_name,
      supplier_category: formData.supplier_category,
      responsavel: formData.responsavel,
      contact_email: formData.contact_email,
      phone_number: formData.phone_number,
      rua: formData.rua,
      cidade: formData.cidade,
      estado: formData.estado,
      pwd: formData.gerarAutomaticamente ? null : formData.senhaManual,
      status: 'on'
    };

    try {
      const response = await api.post('/api/fornecedores/cadastroFornecedor', dadosParaBackend);

      const successText = `✅ Sucesso!\n\nFornecedor: ${response.data.fornecedor.supplier_name}\nLogin: ${response.data.usuarioGerado.user}\nSenha: ${response.data.usuarioGerado.pwd}`;
      setMessage({ type: 'success', text: successText });

      setFormData({
        supplier_name: '',
        supplier_category: '',
        responsavel: '',
        contact_email: '',
        rua: '',
        cidade: '',
        estado: '',
        phone_number: '',
        gerarAutomaticamente: false,
        senhaManual: ''
      });

    } catch (error) {
      if (error.response?.data?.error) {
        setMessage({ type: 'error', text: `❌ Erro: ${error.response.data.error}` });
      } else {
        console.error("Erro ao conectar com o servidor:", error);
        setMessage({ type: 'error', text: "❌ Erro ao conectar com o servidor. Verifique o console." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['dashboard-container']}>

      <nav className={styles.sidebar}>
        <ul>
          <li>
            <Link href="/loja" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiGrid size={20} /><span>Dashboard</span>
              </div>
            </Link>
          </li>

          <li className={styles.active}>
            <Link href="/admin/CadastroFornecedor" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiUsers size={20} /><span>Cadastrar Fornecedores</span>
              </div>
            </Link>
          </li>

          <li>
            <Link href="/admin/CadastroLogista" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiBox size={20} /><span>Cadastrar Lojistas</span>
              </div>
            </Link>
          </li>

          <li>
            <Link href="/admin/CadastroProdutos" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiPackage size={20} /><span>Cadastrar Produtos</span>
              </div>
            </Link>
          </li>

          <li>
            <Link href="/admin/perfil" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiUser size={20} /><span>Perfil</span>
              </div>
            </Link>
          </li>

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
          <h1>Cadastrar Fornecedor</h1>
        </header>

        {/* Mensagens de Feedback do Cadastro */}
        {message && message.type !== 'info' && (
          <div className={`${styles.alertMessage} ${styles[message.type]}`}>
            {message.text.split('\n').map((line, index) => (
                <p key={index} style={{margin: '5px 0', whiteSpace: 'pre-wrap'}}>{line}</p>
            ))}
          </div>
        )}

        <form className={styles.formCard} onSubmit={handleSubmit}>

          <h2 className={styles.sectionTitle}>Dados do Fornecedor</h2>

          <div className={styles.fieldGroup}>
            <label>Nome da loja <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              name="supplier_name"
              className={styles.inputLong}
              value={formData.supplier_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Categoria da Loja <span style={{ color: 'red' }}>*</span></label>
            <input
              type="text"
              name="supplier_category"
              className={styles.inputLong}
              placeholder="Ex: Eletrônicos, Roupas, Alimentos..."
              value={formData.supplier_category}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Responsável</label>
            <input
              type="text"
              name="responsavel"
              className={styles.inputLong}
              value={formData.responsavel}
              onChange={handleChange}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Email (Login) <span style={{ color: 'red' }}>*</span></label>
            <input
              type="email"
              name="contact_email"
              className={styles.inputLong}
              value={formData.contact_email}
              onChange={handleChange}
              required
            />
          </div>

          <h2 className={styles.sectionTitle}>Endereço</h2>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label>Rua/Avenida</label>
              <input
                type="text"
                name="rua"
                className={styles.inputMedium}
                value={formData.rua}
                onChange={handleChange}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Cidade</label>
              <input
                type="text"
                name="cidade"
                className={styles.inputMedium}
                value={formData.cidade}
                onChange={handleChange}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Estado (UF)</label>
              <input
                type="text"
                name="estado"
                className={styles.inputMedium}
                placeholder="Ex: SP, RJ, MG..."
                value={formData.estado}
                onChange={handleChange}
              />
            </div>
          </div>

          <h2 className={styles.sectionTitle}>Contatos</h2>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label>Telefone</label>
              <input
                type="text"
                name="phone_number"
                className={styles.inputMedium}
                value={formData.phone_number}
                onChange={handleChange}
              />
            </div>
          </div>

          {!formData.gerarAutomaticamente && (
            <div className={styles.fieldGroup}>
              <label>Senha (opcional)</label>
              <input
                type="password"
                name="senhaManual"
                className={styles.inputMedium}
                value={formData.senhaManual}
                onChange={handleChange}
                placeholder="Deixe vazio para gerar automaticamente"
              />
            </div>
          )}

          <div className={styles.footer}>

            <label className={styles.checkboxContainer}>
              <input
                type="checkbox"
                name="gerarAutomaticamente"
                checked={formData.gerarAutomaticamente}
                onChange={handleChange}
              />
              <span className={styles.checkmark}></span>
              Gerar senha automaticamente
            </label>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Cadastrando...' : 'Criar Fornecedor'}
            </button>

          </div>

        </form>

        {/* --- COMPONENTE DE BUSCA E DESATIVAÇÃO --- */}
        <hr className={styles.divider} />
        <BuscaFornecedores />

      </main>
    </div>
  );
}