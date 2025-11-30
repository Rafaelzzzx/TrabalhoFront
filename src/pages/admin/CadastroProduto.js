import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../../styles/Loja.module.css';
import api from '../../services/api';
import {
  FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiBox
} from 'react-icons/fi';

export default function CadastroProdutos() {

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Campos apenas os que o backend usa
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    preco: '',
    estoque: '',
    fornecedor: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Dados ALINHADOS com o backend
    const dadosParaAPI = {
      nome: formData.nome,
      descricao: formData.descricao,
      preco: Number(formData.preco),
      estoque: Number(formData.estoque),
      fornecedor: formData.fornecedor
    };

    try {
      const response = await api.post('/api/produtos', dadosParaAPI);


      const successText = `✅ Sucesso! Produto "${response.data.name}" cadastrado (ID: ${response.data._id.substring(0, 10)}...).`;
      setMessage({ type: 'success', text: successText });

      // Limpa form
      setFormData({
        nome: '',
        descricao: '',
        preco: '',
        estoque: '',
        fornecedor: ''
      });

    } catch (error) {
      console.error("Erro ao cadastrar Produto:", error);

      let errorMessage = "❌ Erro inesperado ao cadastrar o produto.";

      if (error.response && error.response.data) {
        const apiError = error.response.data;

        if (apiError.erro) {
          errorMessage = `❌ ${apiError.erro}`;

          if (apiError.detalhes) {
            errorMessage += '\n\n**Detalhes:**\n' + apiError.detalhes.join('\n');
          }
        }
      }

      setMessage({ type: 'error', text: errorMessage });
    }

    setLoading(false);
  };

  return (
    <div className={styles['dashboard-container']}>

      {/* Sidebar */}
      <nav className={styles.sidebar}>
        <ul>
          <li><Link href="/admin/Dashboard" className={styles.linkReset}><div className={styles.menuItem}><FiGrid size={20} /><span>Dashboard</span></div></Link></li>
          <li><Link href="/admin/CadastroFornecedor" className={styles.linkReset}><div className={styles.menuItem}><FiUsers size={20} /><span>Cadastrar Fornecedores</span></div></Link></li>
          <li><Link href="/admin/CadastroLogista" className={styles.linkReset}><div className={styles.menuItem}><FiBox size={20} /><span>Cadastrar Lojistas</span></div></Link></li>
          <li className={styles.active}><Link href="/admin/CadastroProdutos" className={styles.linkReset}><div className={styles.menuItem}><FiPackage size={20} /><span>Cadastrar Produtos</span></div></Link></li>
          <li><Link href="/admin/perfil" className={styles.linkReset}><div className={styles.menuItem}><FiUser size={20} /><span>Perfil</span></div></Link></li>
          <li><Link href="/Login" className={styles.linkReset}><div className={styles.menuItem}><FiLogOut size={20} /><span>Sair</span></div></Link></li>
        </ul>
      </nav>

      {/* Conteúdo */}
      <main className={styles['main-content']}>
        <header className={styles.header}>
          <h1>Cadastrar Produto</h1>
        </header>

        {/* Mensagem */}
        {message && (
          <div className={`${styles.alertMessage} ${styles[message.type]}`}>
            {message.text.split('\n').map((line, index) => (
              <p key={index}
                 className={styles.messageLine}
                 dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            ))}
          </div>
        )}

        {/* Form */}
        <form className={styles.formCard} onSubmit={handleSubmit}>
          <h2 className={styles.sectionTitle}>Dados do Produto</h2>

          <div className={styles.fieldGroup}>
            <label>Nome</label>
            <input
              type="text"
              name="nome"
              className={styles.inputLong}
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Descrição</label>
            <textarea
              name="descricao"
              className={styles.textareaLong}
              value={formData.descricao}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label>Preço</label>
              <input
                type="number"
                name="preco"
                className={styles.inputMedium}
                value={formData.preco}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label>Estoque</label>
              <input
                type="number"
                name="estoque"
                className={styles.inputMedium}
                value={formData.estoque}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label>Fornecedor (ID)</label>
            <input
              type="text"
              name="fornecedor"
              className={styles.inputMedium}
              value={formData.fornecedor}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.footer}>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
