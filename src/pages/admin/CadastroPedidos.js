import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import styles from '../../styles/Loja.module.css';
import api from '../../services/api';
import {
  FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiBox, FiPlus, FiTrash2, FiRefreshCw, FiChevronDown
} from 'react-icons/fi';

// ============================================================================
// COMPONENTE DROPDOWN CUSTOMIZADO (CORRIGIDO)
// ============================================================================
const CustomProductDropdown = ({ options, value, onChange, placeholder, className, required, index, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Encontra o objeto selecionado para mostrar o nome
  const selectedOption = options.find(option => option._id === value);
  const displayValue = selectedOption ? (selectedOption.name || selectedOption.nome) : placeholder;

  // Fechar o dropdown se clicar fora
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isOpen && event.target.closest(`.${styles.customDropdownContainer}`)?.id !== `dropdown-container-${index}`) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isOpen, index]);

  const handleSelect = (optionId) => {
    onChange({ target: { name: 'produtoId', value: optionId } });
    setIsOpen(false);
  };

  const handleClick = () => {
    // CORREÇÃO: Só impede de abrir se estiver explicitamente "disabled" (sem fornecedor selecionado)
    // Antes estava verificando options.length, o que impedia de ver a mensagem "Nenhum produto"
    if (!disabled) {
        setIsOpen(!isOpen);
    }
  };

  return (
    <div
      className={`${styles.customDropdownContainer} ${className}`}
      id={`dropdown-container-${index}`}
    >
      <div
        className={`${styles.dropdownInput} ${isOpen ? styles.active : ''} ${styles.inputLong}`}
        onClick={handleClick}
        tabIndex="0"
        // Adiciona feedback visual se estiver desabilitado
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
        <div className={styles.dropdownMenu}>
            {/* Caso 1: Existem produtos */}
            {options.length > 0 ? (
                options.map(option => (
                    <div
                    key={option._id}
                    className={`${styles.dropdownItem} ${option._id === value ? styles.selected : ''}`}
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
  const [produtos, setProdutos] = useState([]);         // Todos os produtos
  const [filteredProdutos, setFilteredProdutos] = useState([]); // Apenas do fornecedor selecionado

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

  // --- 1. Carregar Dados Iniciais ---
  const loadInitialData = async () => {
    setLoadingData(true);
    setMessage(null);
    try {
      const respFornecedores = await api.get('/api/fornecedores');
      setFornecedores(respFornecedores.data);

      const respProdutos = await api.get('/api/produtos');
      setProdutos(respProdutos.data);
      console.log('✅ Dados Iniciais Carregados. Total Produtos:', respProdutos.data.length);

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
      // Filtra comparando Strings para evitar erros de tipo
      const produtosDoFornecedor = produtos.filter(p => {
          return String(p.supplier_id) === String(selectedSupplierId);
      });

      console.log(`Filtro aplicado. Fornecedor: ${selectedSupplierId}. Produtos encontrados: ${produtosDoFornecedor.length}`);
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
    setFormData({ ...formData, [name]: value });
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
            novosItens[index][name] = value;

            // Ao selecionar produto, puxa o preço automaticamente
            if (name === 'produtoId' && value) {
                const produtoSelecionado = productsList.find(p => p._id === value);
                // Tenta pegar 'price' (conforme seu Schema) ou 'valor' como fallback
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

    // Filtra itens vazios
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
      // filteredProdutos será limpo pelo useEffect quando o fornecedorId ficar vazio

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

  // Define se o dropdown de produtos deve estar travado
  const isProductSelectionDisabled = !formData.fornecedorId;

  return (
    <div className={styles['dashboard-container']}>
      {/* SIDEBAR */}
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

          {itensPedido.map((item, index) => (
            <div key={index} className={styles.itemRow}>
                <div className={styles.fieldGroupItem}>
                    <label>Produto <span className={styles.requiredAsterisk}>*</span></label>
                    <CustomProductDropdown
                        options={filteredProdutos}
                        value={item.produtoId}
                        onChange={(e) => handleItemChange(index, e, filteredProdutos)}
                        placeholder={isProductSelectionDisabled ? "Selecione o Fornecedor" : "Selecione um produto"}
                        className={styles.inputLong}
                        required={true}
                        index={index}
                        disabled={isProductSelectionDisabled}
                    />
                </div>

                <div className={styles.fieldGroupItem}>
                    <label>Qtd.</label>
                    <input
                        type="number"
                        name="quantidade"
                        value={item.quantidade}
                        onChange={(e) => handleItemChange(index, e, filteredProdutos)}
                        min="1"
                        className={styles.inputTiny}
                        required
                        disabled={isProductSelectionDisabled}
                    />
                </div>

                <div className={styles.fieldGroupItem}>
                    <label>Valor Unit. (R$)</label>
                    <input
                        type="number"
                        name="valorUnitario"
                        value={item.valorUnitario}
                        onChange={(e) => handleItemChange(index, e, filteredProdutos)}
                        step="0.01"
                        min="0"
                        className={styles.inputTiny}
                        disabled={isProductSelectionDisabled}
                    />
                </div>

                <div className={styles.fieldGroupItemTotal}>
                    <label>Total</label>
                    <p className={styles.totalItem}>R$ {(item.quantidade * item.valorUnitario).toFixed(2).replace('.', ',')}</p>
                </div>

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