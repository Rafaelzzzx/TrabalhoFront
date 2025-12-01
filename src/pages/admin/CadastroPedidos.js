import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
// Certifique-se de que este caminho está correto para o seu arquivo de CSS
import styles from '../../styles/Pedido.module.css';
import api from '../../services/api';
import {
  FiGrid,
  FiUsers,
  FiPackage,
  FiUser,
  FiLogOut,
  FiBox,
  FiPlus,
  FiTrash2,
  FiChevronDown,
  FiSearch,
  FiEdit,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';

// ============================================================================
// Helpers
// ============================================================================
const formatCurrency = (value) => {
  const n = Number(value) || 0;
  // Garante a formatação para 2 casas decimais e usa vírgula como separador decimal
  return n.toFixed(2).replace('.', ',');
};

const parseCurrencyInput = (raw) => {
  if (raw === undefined || raw === null) return 0;
  // Remove pontos (milhares) e substitui vírgula por ponto (decimal)
  const s = String(raw).replace(/\./g, '').replace(/,/g, '.');
  const num = parseFloat(s);
  return Number.isFinite(num) ? num : 0;
};

// ============================================================================
// 1. COMPONENTE MODAL DE EDIÇÃO DE PEDIDO (UPDATE)
// ============================================================================
const EditPedidoModal = ({ pedido = {}, onSave, onCancel, loading }) => {
  const safeDate = pedido.order_date ? String(pedido.order_date).substring(0, 10) : new Date().toISOString().substring(0, 10);

  const [formData, setFormData] = useState({
    ...pedido,
    order_date: safeDate,
  });

  useEffect(() => {
    const newSafeDate = pedido.order_date ? String(pedido.order_date).substring(0, 10) : new Date().toISOString().substring(0, 10);
    setFormData({ ...pedido, order_date: newSafeDate });
  }, [pedido]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      order_date: formData.order_date
    };
    onSave(payload);
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h3 className={styles.modalTitle}>Editar Pedido: #{String(formData._id || '').substring(0, 8)}</h3>

        <form onSubmit={handleSubmit}>
          <div className={styles.row}>

            <div className={styles.fieldGroup}>
              <label>Status do Pedido</label>
              <select name="status" value={formData.status || 'Pendente'} onChange={handleChange} required className={styles.inputModal}>
                <option value="Pendente">Pendente</option>
                <option value="Enviado">Enviado</option>
                <option value="Entregue">Entregue</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label>Data do Pedido</label>
              <input type="date" name="order_date" value={formData.order_date || ''} onChange={handleChange} required className={styles.inputModal} />
            </div>

          </div>

          <div className={styles.fieldGroup}>
            <label>Observações</label>
            <textarea name="notes" value={formData.notes || ''} onChange={handleChange} className={styles.textareaLong} rows="3" />
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

            <button className={styles.submitButton} type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================================
// 2. COMPONENTE DROPDOWN CUSTOMIZADO (Produtos)
// ============================================================================
const CustomProductDropdown = ({ options = [], value = '', onChange, placeholder = 'Selecione', className = '', required = false, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find(option => String(option._id).trim() === String(value).trim());
  const displayValue = selectedOption ? (selectedOption.name || selectedOption.nome) : placeholder;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (optionId) => {
    if (onChange) onChange({ target: { name: 'produtoId', value: String(optionId) } });
    setIsOpen(false);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (!disabled) setIsOpen(prev => !prev);
  };

  return (
    <div ref={dropdownRef} className={`${styles.customDropdownContainer} ${className}`}>
      <div
        className={`${styles.dropdownInput} ${isOpen ? styles.active : ''}`}
        onClick={handleClick}
        tabIndex={0}
        role="button"
        style={{ cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.9 : 1 }}
      >
        <span>{displayValue}</span>
        <FiChevronDown size={16} className={`${styles.arrowIcon} ${isOpen ? styles.up : ''}`} />
      </div>

      {isOpen && !disabled && (
        <div className={styles.dropdownMenu} style={{ zIndex: 1000 }}>
          {options.length > 0 ? (
            options.map(option => (
              <div
                key={String(option._id)}
                className={`${styles.dropdownItem} ${String(option._id).trim() === String(value).trim() ? styles.selected : ''}`}
                onClick={() => handleSelect(option._id)}
              >
                {option.name || option.nome}
              </div>
            ))
          ) : (
            <div className={styles.dropdownItem} style={{ fontStyle: 'italic', cursor: 'default', color: '#999' }}>
              Nenhum produto encontrado para este fornecedor.
            </div>
          )}
        </div>
      )}

      <input type="hidden" name="produtoId" value={value} required={required && !disabled} />
    </div>
  );
};
// ============================================================================
// 3. COMPONENTE DE BUSCA E GERENCIAMENTO DE PEDIDOS
// ============================================================================
// 3. COMPONENTE DE BUSCA E GERENCIAMENTO DE PEDIDOS
// ============================================================================
const BuscaPedidos = ({ allFornecedores = [], allProdutos = [] }) => {
  const [searchId, setSearchId] = useState('');
  const [searchSupplierId, setSearchSupplierId] = useState('');

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [expandedPedidoId, setExpandedPedidoId] = useState(null);
  const [editingPedido, setEditingPedido] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 5;

  // ⭐ CORREÇÃO IMPORTANTE: converte ObjectId do Mongo corretamente
  const normalizeId = (id) => {
    if (!id) return '';
    if (typeof id === 'string') return id.trim();
    if (typeof id === 'object' && id.$oid) return String(id.$oid).trim();
    return String(id).trim();
  };

  // ✔ Agora funciona: sempre compara String limpa e equivalente
  const getSupplierName = (supplierId) => {
    const idPedido = normalizeId(supplierId);
    const supplier = allFornecedores.find(
      (f) => normalizeId(f._id) === idPedido
    );
    return supplier ? supplier.supplier_name : 'N/A';
  };

  const getProductStatus = (productId) => {
    const pid = normalizeId(productId);
    const produto = allProdutos.find((p) => normalizeId(p._id) === pid);
    return String(produto?.status).toLowerCase() === 'on' ? 'on' : 'off';
  };

  const toggleDetails = (pedidoId) => {
    setExpandedPedidoId((prev) => (prev === pedidoId ? null : pedidoId));
  };

  // ⭐ CORREÇÃO DEFINITIVA EM TODO O FILTER
  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    setMessage(null);
    setCurrentIndex(0);
    setEditingPedido(null);
    setExpandedPedidoId(null);

    try {
      const response = await api.get('/api/pedidos');
      let dados = Array.isArray(response.data) ? response.data : [];

      // ---------------- Filtro por ID parcial ----------------
      if (searchId.trim() !== '') {
        const searchIdLower = searchId.trim().toLowerCase();
        dados = dados.filter((p) =>
          normalizeId(p._id).toLowerCase().includes(searchIdLower)
        );
      }

      // ---------------- Filtro por fornecedor ----------------
      const fornecedorBusca = normalizeId(searchSupplierId);

      if (fornecedorBusca !== '' && fornecedorBusca.length >= 6) {
        dados = dados.filter(
          (p) => normalizeId(p.supplier_id) === fornecedorBusca
        );
      }

      // ---------------- Normalização dos pedidos ----------------
      dados = dados.map((p) => ({
        ...p,
        supplier_id: normalizeId(p.supplier_id),
        _id: normalizeId(p._id),
        total_amount: Number(p.total_amount) || 0,
        status: p.status || 'Pendente',
      }));

      setPedidos(dados);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      const msg = error.response
        ? `Status ${error.response.status}: ${error.response.data?.error}`
        : 'Erro de conexão';
      setMessage({ type: 'error', text: `Erro ao buscar pedidos: ${msg}` });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (pedido) => {
    setMessage(null);
    setEditingPedido(pedido);
  };

  const cancelEdit = () => setEditingPedido(null);

  const handleUpdateSubmit = async (updatedData) => {
    setLoading(true);
    setMessage(null);
    const id = normalizeId(updatedData._id);

    const { _id, ...dataToSend } = updatedData;

    try {
      await api.put(`/api/pedidos/${id}`, dataToSend);

      setPedidos((oldList) =>
        oldList.map((item) =>
          normalizeId(item._id) === id ? { ...item, ...dataToSend } : item
        )
      );

      setEditingPedido(null);
      setMessage({
        type: 'success',
        text: `Pedido #${String(id).substring(0, 8)} atualizado com sucesso!`,
      });
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      const msg =
        error.response?.data?.error || error.message || 'Erro desconhecido';
      setMessage({ type: 'error', text: `Erro ao atualizar: ${msg}` });
    } finally {
      setLoading(false);
    }
  };

  const startDelete = (id) => {
    setDeleteId(normalizeId(id));
    setShowConfirm(true);
  };

  const cancelAction = () => {
    setDeleteId(null);
    setShowConfirm(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setShowConfirm(false);
    setLoading(true);
    setMessage(null);

    try {
      await api.delete(`/api/pedidos/${deleteId}`);

      setPedidos((oldList) =>
        oldList.filter((item) => normalizeId(item._id) !== deleteId)
      );

      setMessage({
        type: 'success',
        text: 'Pedido deletado permanentemente!',
      });
    } catch (error) {
      console.error('Erro ao deletar:', error);
      const msg = error.response?.data?.error || 'Erro desconhecido.';
      setMessage({ type: 'error', text: `Erro ao deletar: ${msg}` });
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      Math.min(prev + itemsPerPage, Math.max(0, pedidos.length - itemsPerPage))
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - itemsPerPage, 0));
  };

  const visibleItems = pedidos.slice(
    currentIndex,
    currentIndex + itemsPerPage
  );

  const totalPages = Math.max(1, Math.ceil(pedidos.length / itemsPerPage));
  const currentPage = Math.floor(currentIndex / itemsPerPage) + 1;

  const ConfirmationModal = () => (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent} style={{ maxWidth: 400 }}>
        <h3 className={styles.modalTitle}>Confirmação de Exclusão</h3>
        <p className={styles.modalText}>
          Tem certeza que deseja excluir permanentemente este pedido?
        </p>

        <div className={styles.modalActions}>
          <button className={`${styles.submitButton} ${styles.btnCancel}`} onClick={cancelAction}>
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

  return (
    <div className={styles['search-section']}>

      <h2 className={styles['search-header']}>Consultar / Gerenciar Pedidos</h2>

      {message && (
        <div className={`${styles.alertMessage} ${styles[message.type]}`}>
          {String(message.text)
            .split('\n')
            .map((line, idx) => (
              <p key={idx} className={styles.messageLine}>
                {line}
              </p>
            ))}
        </div>
      )}

      {/* BUSCA */}
      <div className={styles['search-inputs']}>
        <div className={styles['search-group']}>
          <label>ID Pedido Parcial</label>
          <input
            placeholder="Ex: 64b..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
        </div>

        <div className={styles['search-group']}>
          <label>Fornecedor</label>
          <select
            value={searchSupplierId}
            onChange={(e) => {
              const raw = e.target.value;

              // evita "[object Object]" ou undefined como valor
              if (!raw || raw === "undefined" || raw === "null" || raw === "[object Object]") {
                setSearchSupplierId("");
                return;
              }

              setSearchSupplierId(normalizeId(raw));
            }}
          >
            <option value="">Todos os Fornecedores</option>

            {allFornecedores.map((f) => (
              <option key={normalizeId(f._id)} value={normalizeId(f._id)}>
                {f.supplier_name}
              </option>
            ))}
          </select>
        </div>

        <button
          className={styles['btn-search']}
          onClick={handleSearch}
          disabled={loading}
        >
          <FiSearch size={16} /> {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {/* LISTA DE PEDIDOS */}
      {pedidos.length > 0 && (
        <>
          <div className={styles['provider-list-container']}>
            <div
              className={`${styles['provider-list-item']} ${styles['provider-list-header']}`}
            >
              <div className={styles['header-cell']}>ID Pedido</div>
              <div className={styles['header-cell']}>Fornecedor</div>
              <div className={styles['header-cell']}>Total (R$)</div>
              <div className={styles['header-cell']}>Status</div>
              <div className={styles['header-cell-actions']}>Ações</div>
            </div>

            {visibleItems.map((pedido) => {
              const isExpanded = expandedPedidoId === pedido._id;
              const isCanceled = pedido.status === 'Cancelado';

              const itemClasses = [
                styles['provider-list-item'],
                isCanceled && styles['item-status-off'],
                isExpanded && styles['item-expanded'],
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <React.Fragment key={pedido._id}>
                  <div
                    className={itemClasses}
                    onClick={() => toggleDetails(pedido._id)}
                  >
                    <div className={styles['detail-cell-name']}>
                      #{pedido._id.substring(0, 8)}
                    </div>

                    <div className={styles['detail-cell']}>
                      {getSupplierName(pedido.supplier_id)}
                    </div>

                    <div className={styles['detail-cell']}>
                      R$ {formatCurrency(pedido.total_amount)}
                    </div>

                    <div className={styles['detail-cell']}>
                      <span className={styles[`status-${pedido.status.toLowerCase()}`]}>
                        {pedido.status}
                      </span>
                    </div>

                    <div className={styles['item-actions']}>
                      <button
                        className={styles['btn-detail']}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDetails(pedido._id);
                        }}
                      >
                        <FiChevronDown
                          size={20}
                          className={isExpanded ? styles['btn-rotated'] : ''}
                        />
                      </button>

                      <button
                        className={styles['btn-edit']}
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(pedido);
                        }}
                      >
                        <FiEdit size={16} />
                      </button>

                      <button
                        className={styles['btn-delete']}
                        onClick={(e) => {
                          e.stopPropagation();
                          startDelete(pedido._id);
                        }}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* DETALHES */}
                  {isExpanded && (
                    <div className={styles['expanded-details-row']}>
                      <p>
                        <strong>ID Completo:</strong> {pedido._id}
                      </p>

                      <p>
                        <strong>Data:</strong>{' '}
                        {pedido.order_date
                          ? new Date(pedido.order_date).toLocaleDateString()
                          : 'N/A'}
                      </p>

                      {pedido.items?.length > 0 && (
                        <p>
                          <strong>Status Produto:</strong>{' '}
                          {getProductStatus(pedido.items[0].product_id) === 'on'
                            ? 'Ativo'
                            : 'Inativo'}
                        </p>
                      )}

                      <p>
                        <strong>Observações:</strong>{' '}
                        {pedido.notes || 'Nenhuma'}
                      </p>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* PAGINAÇÃO */}
          <div className={styles.paginationControls}>
            <button
              className={styles['nav-btn']}
              onClick={prevSlide}
              disabled={currentIndex === 0}
            >
              <FiChevronLeft size={20} />
            </button>

            <span className={styles.pageInfo}>
              Página {currentPage} de {totalPages}
            </span>

            <button
              className={styles['nav-btn']}
              onClick={nextSlide}
              disabled={currentIndex + itemsPerPage >= pedidos.length}
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </>
      )}

      {/* MENSAGENS */}
      {!loading && searched && pedidos.length === 0 && (
        <p className={styles['no-data']}>
          Nenhum pedido encontrado. Verifique os filtros.
        </p>
      )}

      {!loading && !searched && pedidos.length === 0 && (
        <p className={styles['no-data']}>
          Busque algo ou recarregue a página.
        </p>
      )}

      {showConfirm && <ConfirmationModal />}

      {editingPedido && (
        <EditPedidoModal
          pedido={editingPedido}
          onSave={handleUpdateSubmit}
          onCancel={cancelEdit}
          loading={loading}
        />
      )}
    </div>
  );
};

// ============================================================================
// 4. COMPONENTE PRINCIPAL: CadastroPedido
// ============================================================================
const CadastroPedido = () => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState(null);

  const [fornecedores, setFornecedores] = useState([]);
  const [produtos, setProdutos] = useState([]);

  const [filteredProdutos, setFilteredProdutos] = useState([]);

  const [formData, setFormData] = useState({
    fornecedorId: '',
    dataPedido: new Date().toISOString().substring(0, 10),
    status: 'Pendente',
    observacoes: ''
  });

  const [itensPedido, setItensPedido] = useState([{ produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);

  const loadInitialData = async () => {
    setLoadingData(true);
    setMessage(null);

    try {
      const respFornecedores = await api.get('/api/fornecedores');
      // Garante que os IDs sejam string e tratados com trim
      const normalizedFornecedores = Array.isArray(respFornecedores.data) ? respFornecedores.data.map(f => ({ ...f, _id: String(f._id).trim() })) : [];
      setFornecedores(normalizedFornecedores);

      const respProdutos = await api.get('/api/produtos');
      const normalizedProdutos = Array.isArray(respProdutos.data) ? respProdutos.data.map(p => ({
        ...p,
        supplier_id: String(p.supplier_id || '').trim(),
        _id: String(p._id).trim(),
        price: Number(p.price) || 0,
        // Normaliza o status para 'on'/'off' em minúsculas
        status: String(p.status || 'off').toLowerCase()
      })) : [];
      setProdutos(normalizedProdutos);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      const errorMsg = error.response ? error.response.data?.error || error.message : error.message;
      setMessage({ type: 'error', text: `Erro ao carregar dados: ${errorMsg}` });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => { loadInitialData(); }, []);

  useEffect(() => {
    const selectedSupplierId = String(formData.fornecedorId).trim();

    if (selectedSupplierId) {
      // Filtra pelo supplier_id e exige status 'on' (ativo) para compra
      const produtosDoFornecedor = produtos.filter(p =>
        String(p.supplier_id).trim() === selectedSupplierId && String(p.status).toLowerCase() === 'on'
      );
      setFilteredProdutos(produtosDoFornecedor);

      setItensPedido(currentItens => currentItens.map(item => {
        const produtoValido = produtosDoFornecedor.some(p => String(p._id).trim() === String(item.produtoId).trim());
        if (item.produtoId && !produtoValido) {
          return { produtoId: '', quantidade: 1, valorUnitario: 0.00 };
        }
        return item;
      }));
    } else {
      setFilteredProdutos([]);
      setItensPedido([{ produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);
    }
  }, [formData.fornecedorId, produtos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleanedValue = name === 'fornecedorId' ? String(value).trim() : value;
    setFormData(prev => ({ ...prev, [name]: cleanedValue }));
  };

  const handleItemChange = useCallback((index, e, productsList = filteredProdutos) => {
    const { name, value } = e.target;
    setItensPedido(prevItens => {
      const novosItens = [...prevItens];

      if (name === 'valorUnitario') {
        const numericValue = parseCurrencyInput(value);
        novosItens[index][name] = numericValue;
      } else if (name === 'quantidade') {
        novosItens[index][name] = parseInt(value, 10) || 1;
      } else if (name === 'produtoId') {
        const cleanedValue = String(value).trim();
        novosItens[index][name] = cleanedValue;
        const produtoSelecionado = productsList.find(p => String(p._id).trim() === cleanedValue);
        novosItens[index].valorUnitario = Number(produtoSelecionado?.price) || 0.00;
      } else {
        novosItens[index][name] = value;
      }

      return novosItens;
    });
  }, [filteredProdutos]);

  const handleAddItem = () => {
    if (!formData.fornecedorId) {
      setMessage({ type: 'warning', text: 'Selecione um Fornecedor antes de adicionar itens.' });
      return;
    }
    setItensPedido(prev => [...prev, { produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);
  };

  const handleRemoveItem = (index) => {
    const novosItens = itensPedido.filter((_, i) => i !== index);
    setItensPedido(novosItens.length ? novosItens : [{ produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);
  };

  const calcularTotal = () => {
    return itensPedido.reduce((total, item) => total + ((Number(item.quantidade) || 0) * (Number(item.valorUnitario) || 0)), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!formData.fornecedorId) {
      setMessage({ type: 'error', text: 'Selecione um Fornecedor.' });
      setLoading(false);
      return;
    }

    const itensValidos = itensPedido.map(i => ({
        ...i,
        quantidade: Number(i.quantidade) || 0,
        valorUnitario: Number(i.valorUnitario) || 0
      }))
      .filter(item => item.produtoId && item.quantidade > 0 && item.valorUnitario >= 0);

    if (itensValidos.length === 0) {
      setMessage({ type: 'error', text: 'Adicione pelo menos um produto válido ao pedido (com produto selecionado e quantidade > 0).' });
      setLoading(false);
      return;
    }

    const totalCalculado = calcularTotal();

    const pedidoParaBackend = {
      supplier_id: formData.fornecedorId,
      order_date: formData.dataPedido,
      status: formData.status,
      notes: formData.observacoes,
      items: itensValidos.map(item => ({
        product_id: item.produtoId,
        quantity: item.quantidade,
        unit_price: item.valorUnitario
      })),
      total_amount: totalCalculado
    };

    try {
      const response = await api.post('/api/pedidos', pedidoParaBackend);
      setMessage({ type: 'success', text: `✅ Pedido #${String(response.data._id || '').substring(0, 8)} criado com sucesso! Total: R$ ${formatCurrency(totalCalculado)}` });

      setFormData({ fornecedorId: '', dataPedido: new Date().toISOString().substring(0, 10), status: 'Pendente', observacoes: '' });
      setItensPedido([{ produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);

    } catch (error) {
      console.error('Erro ao cadastrar Pedido:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao criar pedido.';
      setMessage({ type: 'error', text: `❌ Erro: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className={styles['dashboard-container']}>
        <nav className={styles.sidebar}>
          {/* Conteúdo do sidebar */}
        </nav>
        <main className={styles['main-content']}>
          <p className={styles.loadingMessage}>Carregando...</p>
        </main>
      </div>
    );
  }

  const isProductSelectionDisabled = !formData.fornecedorId;

  return (
    <div className={styles['dashboard-container']}>
      <nav className={styles.sidebar}>
        <ul>
          <li><Link href="/admin/Dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20} /><span>Dashboard</span></div></Link></li>
          <li className={styles.active}><Link href="/admin/CadastroPedido" className={styles.linkReset}><div className={styles.menuItem}><FiBox size={20} /><span>Cadastrar Pedido</span></div></Link></li>
          <li><Link href="/admin/GerenciarPedidos" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20} /><span>Gerenciar Pedidos</span></div></Link></li>
          <li><Link href="/admin/CadastroProduto" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Cadastrar Produtos</span></div></Link></li>
          <li><Link href="/admin/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div></Link></li>
          <li><Link href="/Login" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
        </ul>
      </nav>

      <main className={styles['main-content']}>
        <header className={styles.header}><h1>Cadastrar Novo Pedido</h1></header>

        {message && (<div className={`${styles.alertMessage} ${styles[message.type]}`}>{message.text}</div>)}

        <form className={styles.formCard} onSubmit={handleSubmit}>
          <h2 className={styles.sectionTitle}>Dados do Pedido</h2>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label>Fornecedor <span className={styles.requiredAsterisk}>*</span></label>
              <select name="fornecedorId" value={formData.fornecedorId} onChange={handleChange} className={styles.inputLong} required>
                <option value="" disabled>Selecione um fornecedor</option>
                {fornecedores.map(f => <option key={String(f._id)} value={String(f._id)}>{f.supplier_name}</option>)}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label>Data do Pedido</label>
              <input type="date" name="dataPedido" value={formData.dataPedido} onChange={handleChange} className={styles.inputLong} required />
            </div>
          </div>

          <div className={styles.fieldGroup} style={{ maxWidth: 300 }}>
            <label>Status Inicial</label>
            <select name="status" value={formData.status} onChange={handleChange} className={styles.inputLong}>
              <option value="Pendente">Pendente</option>
              <option value="Enviado">Enviado</option>
              <option value="Entregue">Entregue</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>

          <hr className={styles.divider} />

          <h2 className={styles.sectionTitle}>Itens do Pedido</h2>

          {isProductSelectionDisabled && (<p className={`${styles.alertMessage} ${styles.info}`} style={{ marginBottom: 15 }}>⚠️ Selecione um <strong>Fornecedor</strong> acima para liberar a lista de produtos.</p>)}

          {/* CABEÇALHO DO GRID */}
          <div className={styles.itemGridHeader}>
            <div className={styles.colProductHeader}>Produto</div>
            <div className={`${styles.colTinyHeader} ${styles.alignRight}`}>Qtd.</div>
            <div className={`${styles.colTinyHeader} ${styles.alignRight}`}>Valor Unit. (R$)</div>
            <div className={styles.colTotalHeader}>Total Item</div>
            <div className={styles.colRemoveButtonPlaceholder}></div>
          </div>

          {/* LINHAS DO GRID */}
          {itensPedido.map((item, index) => (
            <div key={index} className={styles.itemGridRow}>
              {/* COLUNA 1: PRODUTO (Dropdown) */}
              <div className={styles.colProductInput}>
                <CustomProductDropdown options={filteredProdutos} value={item.produtoId} onChange={(e) => handleItemChange(index, e, filteredProdutos)} placeholder={isProductSelectionDisabled ? 'Fornecedor não selecionado' : 'Selecione um produto'} required index={index} disabled={isProductSelectionDisabled} />
              </div>

              {/* COLUNA 2: QUANTIDADE (Input) */}
              <div className={styles.colTinyInput}>
                <input type="number" name="quantidade" value={item.quantidade} onChange={(e) => handleItemChange(index, e, filteredProdutos)} min="1" className={styles.inputItem} required disabled={isProductSelectionDisabled} />
              </div>

              {/* COLUNA 3: VALOR UNITÁRIO (Input) */}
              <div className={styles.colTinyInput}>
                <input type="text" name="valorUnitario" value={formatCurrency(item.valorUnitario)} onChange={(e) => handleItemChange(index, e, filteredProdutos)} className={styles.inputItem} disabled={isProductSelectionDisabled} />
              </div>

              {/* COLUNA 4: TOTAL DO ITEM (Display) */}
              <div className={styles.colTotalDisplay}><p className={styles.totalItem}>R$ {formatCurrency((Number(item.quantidade) || 0) * (Number(item.valorUnitario) || 0))}</p></div>

              {/* COLUNA 5: BOTÃO DE REMOVER */}
              <button type="button" className={styles.removeItemButton} onClick={() => handleRemoveItem(index)} disabled={itensPedido.length === 1 || isProductSelectionDisabled} title={itensPedido.length === 1 ? 'O pedido deve ter pelo menos um item' : 'Remover item'}>
                <FiTrash2 size={16} />
              </button>
            </div>
          ))}

          <div className={styles.addItemSection}>
            <button type="button" className={styles.addItemButton} onClick={handleAddItem} disabled={isProductSelectionDisabled || filteredProdutos.length === 0}><FiPlus size={16} /> Adicionar Novo Item</button>
            {/* Aviso só aparece se o fornecedor for selecionado E a lista de produtos estiver vazia */}
            {filteredProdutos.length === 0 && formData.fornecedorId && (<p className={styles.noProductsMessage}>⚠️ Este fornecedor não possui produtos **ativos** cadastrados.</p>)}
          </div>

          <div className={styles.totalPedidoContainer}>
            <p className={styles.totalLabel}>Total do Pedido:</p>
            <p className={styles.totalValue}>R$ {formatCurrency(calcularTotal())}</p>
          </div>

          <hr className={styles.divider} />

          <h2 className={styles.sectionTitle}>Observações</h2>
          <div className={styles.fieldGroup}>
            <textarea name="observacoes" value={formData.observacoes} onChange={handleChange} className={styles.textareaLong} rows="3" placeholder="Notas internas..." />
          </div>

          <div className={styles.footer}>
            <button type="submit" className={styles.submitButton} disabled={loading || isProductSelectionDisabled}>{loading ? 'Processando...' : 'Salvar Novo Pedido'}</button>
          </div>
        </form>

        <div style={{ marginTop: 28 }}>
          <BuscaPedidos allFornecedores={fornecedores} allProdutos={produtos} />
        </div>
      </main>
    </div>
  );
};

export default CadastroPedido;