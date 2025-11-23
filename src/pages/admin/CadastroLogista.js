import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../../styles/Loja.module.css';
import api from '../../services/api';
import {
  FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiBox
} from 'react-icons/fi';

export default function CadastroLogista() {
  // Estado do formulário para Lojista
  const [formData, setFormData] = useState({
    nomeLoja: '',
    responsavel: '',
    email: '',
    rua: '',
    cidade: '',
    estado: '',
    telefone: '',
    emailContato: '',
    gerarAutomaticamente: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dados do Logista:', formData);
    alert('Lojista salvo com sucesso (Simulação)');
  };

  return (
    <div className={styles['dashboard-container']}>

      {/* --- SIDEBAR (IGUAL AO DO FORNECEDOR, MAS COM ITEM DIFERENTE ATIVO) --- */}
      <nav className={styles.sidebar}>
        <ul>

          {/* 1. Dashboard */}
          <li>
            <Link href="/loja" style={{ textDecoration: 'none' }}>
              <div className={styles.menuItem}>
                <FiGrid size={20} /><span>Dashboard</span>
              </div>
            </Link>
          </li>

          {/* 2. Cadastrar Fornecedores */}
          <li>
            <Link href="/admin/CadastroFornecedor" style={{ textDecoration: 'none' }}>
              <div className={styles.menuItem}>
                <FiUsers size={20} /><span>Cadastrar Fornecedores</span>
              </div>
            </Link>
          </li>

          {/* 3. Cadastrar Lojistas (ESTE É O ATIVO AQUI) */}
          <li className={styles.active}>
            <Link href="/CadastroLogista" style={{ textDecoration: 'none' }}>
              <div className={styles.menuItem}>
                <FiBox size={20} /><span>Cadastrar Lojistas</span>
              </div>
            </Link>
          </li>

          {/* 4. Cadastrar Produtos */}
          <li>
            <Link href="/CadastroProdutos" style={{ textDecoration: 'none' }}>
              <div className={styles.menuItem}>
                <FiPackage size={20} /><span>Cadastrar Produtos</span>
              </div>
            </Link>
          </li>

          {/* 5. Perfil */}
          <li>
            <Link href="/admin/perfil" style={{ textDecoration: 'none' }}>
              <div className={styles.menuItem}>
                <FiUser size={20} /><span>Perfil</span>
              </div>
            </Link>
          </li>

          {/* 6. Sair */}
          <li>
            <Link href="/" style={{ textDecoration: 'none' }}>
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
            <label>Nome da Loja</label>
            <input
              type="text"
              name="nomeLoja"
              className={styles.inputLong}
              value={formData.nomeLoja} onChange={handleChange}
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
            <label>Email Principal</label>
            <input
              type="email"
              name="email"
              className={styles.inputLong}
              value={formData.email} onChange={handleChange}
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

            <button type="submit" className={styles.submitButton}>
              Criar Lojista
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}