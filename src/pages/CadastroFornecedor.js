import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Loja.module.css';
import { FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiBox } from 'react-icons/fi';

export default function CadastroFornecedor() {
  const [formData, setFormData] = useState({
    nomeLoja: '', responsavel: '', email: '', rua: '',
    cidade: '', estado: '', telefone: '', emailContato: '',
    gerarAutomaticamente: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    alert('Salvar Fornecedor');
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

          {/* ITEM ATIVO: FORNECEDORES */}
          <li className={styles.active}>
            <Link href="/CadastroFornecedor" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiUsers size={20} /><span>Cadastrar Fornecedores</span>
              </div>
            </Link>
          </li>

          <li>
            <Link href="/CadastroLogista" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiBox size={20} /><span>Cadastrar Logistas</span>
              </div>
            </Link>
          </li>

          <li>
            <Link href="/CadastroProdutos" className={styles.linkReset}>
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
            <Link href="/" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiLogOut size={20} /><span>Sair</span>
              </div>
            </Link>
          </li>
        </ul>
      </nav>

      {/* --- CONTEÚDO --- */}
      <main className={styles['main-content']}>
        <header className={styles.header}>
          <h1>Cadastrar Fornecedor</h1>
        </header>

        <form className={styles.formCard} onSubmit={handleSubmit}>
            <h2 className={styles.sectionTitle}>Dados do Fornecedor</h2>
            <div className={styles.fieldGroup}>
                <label>Nome da loja</label>
                <input type="text" name="nomeLoja" className={styles.inputLong} value={formData.nomeLoja} onChange={handleChange} />
            </div>
            <div className={styles.fieldGroup}>
                <label>Responsavel</label>
                <input type="text" name="responsavel" className={styles.inputLong} value={formData.responsavel} onChange={handleChange} />
            </div>
            <div className={styles.fieldGroup}>
                <label>Email</label>
                <input type="email" name="email" className={styles.inputLong} value={formData.email} onChange={handleChange} />
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
                    <label>Estado(UF)</label>
                    <input type="text" name="estado" className={styles.inputMedium} value={formData.estado} onChange={handleChange} />
                </div>
            </div>

            <h2 className={styles.sectionTitle}>Contatos</h2>
            <div className={styles.row}>
                <div className={styles.fieldGroup}>
                    <label>Telefone</label>
                    <input type="text" name="telefone" className={styles.inputMedium} value={formData.telefone} onChange={handleChange} />
                </div>
                <div className={styles.fieldGroup}>
                    <label>Email</label>
                    <input type="email" name="emailContato" className={styles.inputMedium} value={formData.emailContato} onChange={handleChange} />
                </div>
            </div>

            <div className={styles.footer}>
                <label className={styles.checkboxContainer}>
                    <input type="checkbox" name="gerarAutomaticamente" checked={formData.gerarAutomaticamente} onChange={handleChange} />
                    <span className={styles.checkmark}></span>
                    Gerar senha e usuario Automaticamente
                </label>
                <button type="submit" className={styles.submitButton}>Criar Fornecedor</button>
            </div>
        </form>
      </main>
    </div>
  );
}