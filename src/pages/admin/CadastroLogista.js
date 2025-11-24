import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../../styles/Loja.module.css';
import api from '../../services/api';
import {
  FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiBox
} from 'react-icons/fi';

export default function CadastroLogista() {
  const [loading, setLoading] = useState(false); // 🔥 Estado de loading

  const [formData, setFormData] = useState({
    nomeLoja: '',
    cnpj: '', // 🔥 NOVO CAMPO OBRIGATÓRIO NO SCHEMA
    responsavel: '',
    email: '', // Email Principal (Login)
    rua: '',
    cidade: '',
    estado: '',
    telefone: '',
    emailContato: '', // Email Secundário
    gerarAutomaticamente: false,
    senhaManual: '' // 🔥 NOVO CAMPO DE SENHA
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

    // 🔥 Mapeamento dos campos do Front-end (pt-br) para o Backend (Schema)
    const dadosParaBackend = {
      store_name: formData.nomeLoja,
      cnpj: formData.cnpj, // Mapeado
      contact_email: formData.email, // Mapeado para o login/email principal
      address: `${formData.rua}, ${formData.cidade}, ${formData.estado}`, // Combinação simples para o address
      phone_number: formData.telefone,
      // O emailContato não é usado pelo seu Schema de Loja, mas vamos enviá-lo caso você adicione um campo secundário.
      emailContatoSecundario: formData.emailContato,

      pwd: formData.gerarAutomaticamente ? null : formData.senhaManual
    };

    // Seu backend espera que a rua, cidade e estado venham separadamente.
    // O seu Schema pede um campo 'address' único. Vou enviar a rua como 'address'
    // Se o seu Schema de Loja tiver campos separados para rua, cidade, estado, ajuste o mapeamento.
    // ***Assumindo que o campo 'address' no backend deve ser a Rua***
    const dadosFinaisParaBackend = {
      store_name: formData.nomeLoja,
      cnpj: formData.cnpj,
      contact_email: formData.email,
      address: formData.rua, // Enviando a Rua para o campo 'address'
      phone_number: formData.telefone,
      // O backend não usa responsavel, cidade, estado. Mantenha por enquanto no state.
      pwd: formData.gerarAutomaticamente ? null : formData.senhaManual
    };

    try {
      const response = await api.post('/api/lojas/cadastroLoja', dadosFinaisParaBackend);

      alert(
        `✅ Sucesso! Loja cadastrada.\n\nLogin: ${response.data.usuarioGerado.user}\nSenha: ${response.data.senhaUsada}`
      );

      // Limpa o formulário
      setFormData({
        nomeLoja: '', cnpj: '', responsavel: '', email: '', rua: '', cidade: '', estado: '',
        telefone: '', emailContato: '', gerarAutomaticamente: false, senhaManual: ''
      });

    } catch (error) {
      console.error("Erro ao cadastrar Logista:", error);

      // Tratamento de Erro para mensagens específicas do backend
      const errorMessage = error.response && error.response.data && (error.response.data.erro || (error.response.data.erros && error.response.data.erros.join('\n')));

      if (errorMessage) {
        alert(`❌ Erro de Cadastro: ${errorMessage}`);
      } else {
        alert("❌ Ocorreu um erro interno ao cadastrar o logista.");
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['dashboard-container']}>

      {/* --- SIDEBAR --- (Sem mudanças) */}
      <nav className={styles.sidebar}>
        <ul>
          <li>
            <Link href="/loja" style={{ textDecoration: 'none' }}>
              <div className={styles.menuItem}>
                <FiGrid size={20} /><span>Dashboard</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/admin/CadastroFornecedor" style={{ textDecoration: 'none' }}>
              <div className={styles.menuItem}>
                <FiUsers size={20} /><span>Cadastrar Fornecedores</span>
              </div>
            </Link>
          </li>
          <li className={styles.active}>
            {/* Corrigindo a rota ativa para ser /admin/CadastroLogista */}
            <Link href="/admin/CadastroLogista" style={{ textDecoration: 'none' }}>
              <div className={styles.menuItem}>
                <FiBox size={20} /><span>Cadastrar Lojistas</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/admin/CadastroProdutos" style={{ textDecoration: 'none' }}>
              <div className={styles.menuItem}>
                <FiPackage size={20} /><span>Cadastrar Produtos</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/admin/perfil" style={{ textDecoration: 'none' }}>
              <div className={styles.menuItem}>
                <FiUser size={20} /><span>Perfil</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/Login" style={{ textDecoration: 'none' }}>
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

          {/* Seção 1: Dados do Lojista */}
          <h2 className={styles.sectionTitle}>Dados do Lojista</h2>

          <div className={styles.fieldGroup}>
            <label>Nome da Loja <span style={{color:'red'}}>*</span></label>
            <input
              type="text"
              name="nomeLoja"
              className={styles.inputLong}
              value={formData.nomeLoja} onChange={handleChange}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>CNPJ <span style={{color:'red'}}>*</span></label>
            <input
              type="text"
              name="cnpj"
              className={styles.inputLong}
              value={formData.cnpj} onChange={handleChange}
              placeholder="Ex: 99.999.999/0001-88"
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Responsável</label>
            <input
              type="text"
              name="responsavel"
              className={styles.inputLong}
              value={formData.responsavel} onChange={handleChange}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Email Principal (Login) <span style={{color:'red'}}>*</span></label>
            <input
              type="email"
              name="email"
              className={styles.inputLong}
              value={formData.email} onChange={handleChange}
              required
            />
          </div>

          {/* Seção 2: Endereço */}
          <h2 className={styles.sectionTitle}>Endereço</h2>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label>Rua/Avenida</label>
              <input
                type="text"
                name="rua"
                className={styles.inputMedium}
                value={formData.rua} onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>Cidade</label>
              <input
                type="text"
                name="cidade"
                className={styles.inputMedium}
                value={formData.cidade} onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>Estado (UF)</label>
              <input
                type="text"
                name="estado"
                className={styles.inputMedium}
                value={formData.estado} onChange={handleChange}
              />
            </div>
          </div>

          {/* Seção 3: Contatos */}
          <h2 className={styles.sectionTitle}>Contatos</h2>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label>Telefone</label>
              <input
                type="text"
                name="telefone"
                className={styles.inputMedium}
                value={formData.telefone} onChange={handleChange}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label>Email Contato</label>
              <input
                type="email"
                name="emailContato"
                className={styles.inputMedium}
                value={formData.emailContato} onChange={handleChange}
              />
            </div>
          </div>

          {/* 🔥 NOVO CAMPO DE SENHA */}
          {!formData.gerarAutomaticamente && (
            <div className={styles.fieldGroup}>
              <label>Senha (opcional)</label>
              <input
                type="password"
                name="senhaManual"
                className={styles.inputMedium}
                value={formData.senhaManual} onChange={handleChange}
                placeholder="Deixe vazio para gerar auto"
              />
            </div>
          )}

          {/* Rodapé do formulário */}
          <div className={styles.footer}>
            <label className={styles.checkboxContainer}>
              <input
                type="checkbox"
                name="gerarAutomaticamente"
                checked={formData.gerarAutomaticamente} onChange={handleChange}
              />
              <span className={styles.checkmark}></span>
              Gerar senha e usuário automaticamente
            </label>

            {/* Botão com Loading */}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Cadastrando...' : 'Criar Lojista'}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}