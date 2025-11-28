import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../../styles/Loja.module.css';
import api from '../../services/api';
import {
  FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiBox
} from 'react-icons/fi';

export default function CadastroLogista() {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nomeLoja: '',
    cnpj: '',
    responsavel: '',
    email: '',
    rua: '',
    cidade: '',
    estado: '',
    telefone: '',
    // emailContato removido daqui
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

    const dadosFinaisParaBackend = {
      store_name: formData.nomeLoja,
      cnpj: formData.cnpj,
      contact_email: formData.email,
      address: formData.rua,
      phone_number: formData.telefone,
      pwd: formData.gerarAutomaticamente ? null : formData.senhaManual
    };

    try {
      const response = await api.post('/api/lojas/cadastroLoja', dadosFinaisParaBackend);

      alert(
        `✅ Sucesso! Loja cadastrada.\n\nLogin: ${response.data.usuarioGerado.user}\nSenha: ${response.data.senhaUsada}`
      );

      // Limpa tudo (removido o emailContato daqui também)
      setFormData({
        nomeLoja: '',
        cnpj: '',
        responsavel: '',
        email: '',
        rua: '',
        cidade: '',
        estado: '',
        telefone: '',
        gerarAutomaticamente: false,
        senhaManual: ''
      });

    } catch (error) {
      console.error("Erro ao cadastrar Logista:", error);

      const errorMessage =
        error.response &&
        error.response.data &&
        (error.response.data.erro ||
        (error.response.data.erros && error.response.data.erros.join('\n')));

      if (errorMessage) {
        alert(`❌ Erro: ${errorMessage}`);
      } else {
        alert("❌ Erro interno ao cadastrar o logista.");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['dashboard-container']}>

      {/* --- SIDEBAR --- */}
      <nav className={styles.sidebar}>
        <ul>
          <li>
            <Link href="/loja" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiGrid size={20} /><span>Dashboard</span>
              </div>
            </Link>
          </li>

          <li>
            <Link href="/admin/CadastroFornecedor" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiUsers size={20} /><span>Cadastrar Fornecedores</span>
              </div>
            </Link>
          </li>

          <li className={styles.active}>
            <Link href="/admin/CadastroLogista" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiBox size={20} /><span>Cadastrar Logistas</span>
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

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className={styles['main-content']}>

        <header className={styles.header}>
          <h1>Cadastrar Logista</h1>
        </header>

        <form className={styles.formCard} onSubmit={handleSubmit}>

          <h2 className={styles.sectionTitle}>Dados do Logista</h2>

          <div className={styles.fieldGroup}>
            <label>Nome da Loja *</label>
            <input
              type="text"
              name="nomeLoja"
              className={styles.inputLong}
              value={formData.nomeLoja}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>CNPJ *</label>
            <input
              type="text"
              name="cnpj"
              className={styles.inputLong}
              value={formData.cnpj}
              onChange={handleChange}
              placeholder="99.999.999/0001-88"
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
            <label>Email Principal (Login) *</label>
            <input
              type="email"
              name="email"
              className={styles.inputLong}
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <h2 className={styles.sectionTitle}>Endereço</h2>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label>Rua</label>
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
              <label>Estado  (UF)</label>
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
                name="telefone"
                className={styles.inputMedium}
                value={formData.telefone}
                onChange={handleChange}
              />
            </div>
             {/* O campo Email Contato foi removido daqui */}
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
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Cadastrando...' : 'Criar Lojista'}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}