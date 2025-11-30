import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import styles from '../../styles/Loja.module.css';
import api from '../../services/api';
import {
  FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiBox, FiPlus, FiTrash2, FiChevronDown
} from 'react-icons/fi';

// ============================================================================
// COMPONENTE DROPDOWN CUSTOMIZADO (COM useRef)
// ============================================================================
const CustomProductDropdown = ({ options, value, onChange, placeholder, className, required, index, disabled = false }) => {
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (optionId) => {
    onChange({ target: { name: 'produtoId', value: optionId } });
    setIsOpen(false);
  };

  const handleClick = (e) => {
    e.stopPropagation();

    if (!disabled) {
        setIsOpen(prev => !prev);
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={`${styles.customDropdownContainer} ${className}`}
    >
      <div
        className={`${styles.dropdownInput} ${isOpen ? styles.active : ''}`}
        onClick={handleClick}
        tabIndex="0"
        style={{
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            backgroundColor: disabled ? '#f0f0f0' : '#fff'
        }}
      >
        <span>{displayValue}</span>
        <FiChevronDown size={16} className={`${styles.arrowIcon} ${isOpen ? styles.up : ''}`} />
      </div>

      {/* Menu com as opções */}
      {isOpen && !disabled && (
        <div className={styles.dropdownMenu} style={{ zIndex: 1000 }}>
            {/* Caso 1: Existem produtos */}
            {options.length > 0 ? (
                options.map(option => (
                    <div
                    key={option._id}
                    className={`${styles.dropdownItem} ${String(option._id).trim() === String(value).trim() ? styles.selected : ''}`}
                    onClick={() => handleSelect(option._id)}
                    >
                    {option.name || option.nome}
                    </div>
                ))
            ) : (
                // Caso 2: Lista vazia (mensagem de feedback)
                <div className={styles.dropdownItem} style={{ fontStyle: 'italic', cursor: 'default', color: '#999' }}>
                    Nenhum produto encontrado para este fornecedor.
                </div>
            )}
        </div>
      )}

      {/* Input oculto para validação HTML "required" */}
      <input
        type="hidden"
        name="produtoId"
        value={value}
        required={required && !disabled}
      />
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL: CadastroPedido
// ============================================================================
const CadastroPedido = () => {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState(null);

  // Estados para dados da API
  const [fornecedores, setFornecedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [filteredProdutos, setFilteredProdutos] = useState([]);

  // Estados do Formulário
  const [formData, setFormData] = useState({
    fornecedorId: '',
    dataPedido: new Date().toISOString().substring(0, 10),
    status: 'Pendente',
    observacoes: ''
  });

  const [itensPedido, setItensPedido] = useState([
    { produtoId: '', quantidade: 1, valorUnitario: 0.00 }
  ]);

  // --- 1. Carregar Dados Iniciais - CORRIGIDO O TRIM! ---
  const loadInitialData = async () => {
    setLoadingData(true);
    setMessage(null);
    try {
      const respFornecedores = await api.get('/api/fornecedores');

      const normalizedFornecedores = respFornecedores.data.map(f => ({
          ...f,
          _id: String(f._id).trim()
      }));
      setFornecedores(normalizedFornecedores);

      const respProdutos = await api.get('/api/produtos');

      const normalizedProdutos = respProdutos.data.map(p => ({
          ...p,
          supplier_id: String(p.supplier_id).trim(),
          _id: String(p._id).trim()
      }));

      setProdutos(normalizedProdutos);

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      const errorMsg = error.response ? error.response.data.error : error.message;
      setMessage({ type: 'error', text: `Erro ao carregar dados: ${errorMsg}` });
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // --- 2. Filtro de Produtos (Monitora Fornecedor) ---
  useEffect(() => {
    const selectedSupplierId = formData.fornecedorId;

    if (selectedSupplierId) {
      const produtosDoFornecedor = produtos.filter(p => {
          return p.supplier_id === selectedSupplierId;
      });

      setFilteredProdutos(produtosDoFornecedor);

      // Limpa itens que não pertencem mais ao novo fornecedor
      setItensPedido(currentItens => {
          return currentItens.map(item => {
              const produtoValido = produtosDoFornecedor.some(p => p._id === item.produtoId);
              if (item.produtoId && !produtoValido) {
                  return { produtoId: '', quantidade: 1, valorUnitario: 0.00 };
              }
              return item;
          });
      });

    } else {
      setFilteredProdutos([]);
      setItensPedido([{ produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);
    }
  }, [formData.fornecedorId, produtos]);


  // --- 3. Handlers de Formulário ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleanedValue = name === 'fornecedorId' ? String(value).trim() : value;
    setFormData({ ...formData, [name]: cleanedValue });
  };

  const handleItemChange = useCallback((index, e, productsList) => {
    const { name, value } = e.target;
    setItensPedido(prevItens => {
        const novosItens = [...prevItens];

        if (name === 'valorUnitario') {
            novosItens[index][name] = parseFloat(value) || 0;
        } else if (name === 'quantidade') {
            novosItens[index][name] = parseInt(value) || 1;
        } else {
            const cleanedValue = name === 'produtoId' ? String(value).trim() : value;
            novosItens[index][name] = cleanedValue;

            if (name === 'produtoId' && cleanedValue) {
                const produtoSelecionado = productsList.find(p => p._id === cleanedValue);
                novosItens[index].valorUnitario = produtoSelecionado?.price || produtoSelecionado?.valor || 0.00;
            }
        }
        return novosItens;
    });
  }, []);

  const handleAddItem = () => {
    if (formData.fornecedorId) {
        setItensPedido([...itensPedido, { produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);
    } else {
        setMessage({ type: 'warning', text: 'Selecione um Fornecedor antes de adicionar itens.' });
    }
  };

  const handleRemoveItem = (index) => {
    const novosItens = itensPedido.filter((_, i) => i !== index);
    if (novosItens.length === 0) {
        setItensPedido([{ produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);
    } else {
        setItensPedido(novosItens);
    }
  };

  const calcularTotal = () => {
    return itensPedido.reduce((total, item) => {
      return total + (item.quantidade * item.valorUnitario);
    }, 0);
  };

  // --- 4. Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!formData.fornecedorId) {
        setMessage({ type: 'error', text: 'Selecione um Fornecedor.' });
        setLoading(false);
        return;
    }

    const itensValidos = itensPedido.filter(item => item.produtoId && item.quantidade > 0);

    if (itensValidos.length === 0) {
        setMessage({ type: 'error', text: 'Adicione pelo menos um produto válido ao pedido.' });
        setLoading(false);
        return;
    }

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
        total_amount: calcularTotal()
    };

    try {
      const response = await api.post('/api/pedidos', pedidoParaBackend);
      setMessage({ type: 'success', text: `✅ Pedido criado com sucesso! Total: R$ ${calcularTotal().toFixed(2)}` });

      // Resetar form
      setFormData({
        fornecedorId: '',
        dataPedido: new Date().toISOString().substring(0, 10),
        status: 'Pendente',
        observacoes: ''
      });
      setItensPedido([{ produtoId: '', quantidade: 1, valorUnitario: 0.00 }]);

    } catch (error) {
      console.error("Erro ao cadastrar Pedido:", error);
      const errorMessage = error.response?.data?.error || "Erro ao criar pedido.";
      setMessage({ type: 'error', text: `❌ Erro: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  // --- 5. Render ---
  if (loadingData) {
    return (
      <div className={styles['dashboard-container']}>
        <main className={styles['main-content']}>
          <p className={styles.loadingMessage}>Carregando...</p>
        </main>
      </div>
    );
  }

  const isProductSelectionDisabled = !formData.fornecedorId;

  return (
    <div className={styles['dashboard-container']}>
      {/* SIDEBAR (Sem alterações) */}
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
        <header className={styles.header}>
          <h1>Cadastrar Novo Pedido</h1>
        </header>

        {message && (
          <div className={`${styles.alertMessage} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <form className={styles.formCard} onSubmit={handleSubmit}>
          <h2 className={styles.sectionTitle}>Dados do Pedido</h2>
          <div className={styles.row}>
             <div className={styles.fieldGroup}>
                <label>Fornecedor <span className={styles.requiredAsterisk}>*</span></label>
                <select
                    name="fornecedorId"
                    value={formData.fornecedorId}
                    onChange={handleChange}
                    className={styles.inputMedium}
                    required
                >
                    <option value="" disabled>Selecione um fornecedor</option>
                    {fornecedores.map(f => (
                        <option key={f._id} value={f._id}>{f.supplier_name}</option>
                    ))}
                </select>
            </div>

            <div className={styles.fieldGroup}>
                <label>Data do Pedido</label>
                <input
                    type="date"
                    name="dataPedido"
                    value={formData.dataPedido}
                    onChange={handleChange}
                    className={styles.inputMedium}
                    required
                />
            </div>
          </div>

          <div className={styles.fieldGroup}>
              <label>Status Inicial</label>
              <select name="status" value={formData.status} onChange={handleChange} className={styles.inputSmall}>
                  <option value="Pendente">Pendente</option>
                  <option value="Enviado">Enviado</option>
                  <option value="Entregue">Entregue</option>
                  <option value="Cancelado">Cancelado</option>
              </select>
          </div>

          <hr className={styles.divider} />

          <h2 className={styles.sectionTitle}>Itens do Pedido</h2>

          {/* Aviso se nenhum fornecedor foi selecionado */}
          {isProductSelectionDisabled && (
              <p className={styles.warningMessage} style={{ color: '#d97706', marginBottom: '10px' }}>
                  ⚠️ Selecione um <strong>Fornecedor</strong> acima para liberar a lista de produtos.
              </p>
          )}

          {/* === CABEÇALHO DA TABELA DE ITENS CORRIGIDO === */}
          <div className={styles.itemHeader}>
              <div className={`${styles.headerColumn} ${styles.colProduct}`}>Produto</div>
              <div className={`${styles.headerColumn} ${styles.colTiny} ${styles.alignRight}`}>Qtd.</div>
              <div className={`${styles.headerColumn} ${styles.colTiny} ${styles.alignRight}`}>Valor Unit. (R$)</div>
              <div className={`${styles.headerColumn} ${styles.itemTotalDisplay}`}>Total Item</div>
              {/* Placeholder para o botão de lixeira, para alinhamento horizontal */}
              <div className={styles.removeItemButton} style={{ visibility: 'hidden' }}></div>
          </div>
          {/* ======================================= */}


          {itensPedido.map((item, index) => (
            <div key={index} className={styles.itemRow}>
                {/* 1. CAMPO PRODUTO (Custom Dropdown) */}
                <div className={`${styles.fieldGroupItem} ${styles.colProduct}`}>
                    <CustomProductDropdown
                        options={filteredProdutos}
                        value={item.produtoId}
                        onChange={(e) => handleItemChange(index, e, filteredProdutos)}
                        placeholder={isProductSelectionDisabled ? "Selecione o Fornecedor" : "Selecione um produto"}
                        required={true}
                        index={index}
                        disabled={isProductSelectionDisabled}
                    />
                </div>

                {/* 2. CAMPO QTD */}
                <div className={`${styles.fieldGroupItem} ${styles.colTiny}`}>
                    <input
                        type="number"
                        name="quantidade"
                        value={item.quantidade}
                        onChange={(e) => handleItemChange(index, e, filteredProdutos)}
                        min="1"
                        className={styles.inputTiny} /* A classe inputTiny define a largura 100% do container */
                        required
                        disabled={isProductSelectionDisabled}
                    />
                </div>

                {/* 3. CAMPO VALOR UNIT. */}
                <div className={`${styles.fieldGroupItem} ${styles.colTiny}`}>
                    <input
                        type="number"
                        name="valorUnitario"
                        value={item.valorUnitario.toFixed(2)}
                        onChange={(e) => handleItemChange(index, e, filteredProdutos)}
                        step="0.01"
                        min="0"
                        className={styles.inputTiny} /* A classe inputTiny define a largura 100% do container */
                        disabled={isProductSelectionDisabled}
                    />
                </div>

                {/* 4. CAMPO TOTAL ITEM */}
                <div className={styles.fieldGroupItemTotal}>
                    <p className={styles.totalItem}>R$ {(item.quantidade * item.valorUnitario).toFixed(2).replace('.', ',')}</p>
                </div>

                {/* 5. BOTÃO REMOVER */}
                <button
                    type="button"
                    className={styles.removeItemButton}
                    onClick={() => handleRemoveItem(index)}
                    disabled={itensPedido.length === 1 || isProductSelectionDisabled}
                >
                    <FiTrash2 size={18} />
                </button>
            </div>
          ))}

          <div className={styles.addItemSection}>
            <button type="button" className={styles.addItemButton} onClick={handleAddItem} disabled={isProductSelectionDisabled}>
              <FiPlus size={18} /> Adicionar Novo Item
            </button>
          </div>

          <div className={styles.totalPedidoContainer}>
              <p className={styles.totalLabel}>Total do Pedido:</p>
              <p className={styles.totalValue}>R$ {calcularTotal().toFixed(2).replace('.', ',')}</p>
          </div>

          <hr className={styles.divider} />

          <h2 className={styles.sectionTitle}>Observações</h2>
          <div className={styles.fieldGroup}>
              <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  className={styles.textareaLong}
                  rows="3"
                  placeholder="Notas internas..."
              />
          </div>

          <div className={styles.footer}>
            <button type="submit" className={styles.submitButton} disabled={loading || isProductSelectionDisabled}>
              {loading ? 'Processando...' : 'Salvar Novo Pedido'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CadastroPedido;