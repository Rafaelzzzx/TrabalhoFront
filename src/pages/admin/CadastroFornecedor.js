import React, { useState } from 'react';
import Link from 'next/link';
import api from '../../services/api'; // axios configurado

import styles from '../../styles/Loja.module.css';
import { FiGrid, FiUsers, FiPackage, FiUser, FiLogOut, FiBox } from 'react-icons/fi';

export default function CadastroFornecedor() {
  const [loading, setLoading] = useState(false); // 🔥 Novo estado para Loading

  const [formData, setFormData] = useState({
    supplier_name: '',
    responsavel: '',
    contact_email: '',
    rua: '',
    cidade: '',
    estado: '',
    phone_number: '',
    emailContato: '',
    gerarAutomaticamente: false,
    senhaManual: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // ⏳ Ativa o loading

    const dadosParaBackend = {
      supplier_name: formData.supplier_name,
      responsavel: formData.responsavel,
      contact_email: formData.contact_email,
      phone_number: formData.phone_number,
      rua: formData.rua,
      cidade: formData.cidade,
      estado: formData.estado,
      emailContato: formData.emailContato,
      pwd: formData.gerarAutomaticamente ? null : formData.senhaManual
    };

    try {
      const response = await api.post('/api/fornecedores/cadastroFornecedor', dadosParaBackend);

      // ✅ Sucesso: Mostra os dados gerados
      alert(
        `✅ Sucesso!\n\nFornecedor: ${response.data.fornecedor.supplier_name}\nLogin: ${response.data.usuarioGerado.user}\nSenha: ${response.data.usuarioGerado.pwd}`
      );

      // Limpa o formulário
      setFormData({
        supplier_name: '', responsavel: '', contact_email: '', rua: '',
        cidade: '', estado: '', phone_number: '', emailContato: '',
        gerarAutomaticamente: false, senhaManual: ''
      });

    } catch (error) {
      console.error("Erro no cadastro:", error);

      // ❌ Tratamento de Erro Inteligente
      if (error.response && error.response.data && error.response.data.error) {
        // Mostra a mensagem exata que veio do Backend (ex: Nome duplicado)
        alert(`❌ Erro: ${error.response.data.error}`);
      } else {
        alert("❌ Erro ao conectar com o servidor. Tente novamente.");
      }
    } finally {
      setLoading(false); // ⏹ Desativa o loading independente do resultado
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

        <form className={styles.formCard} onSubmit={handleSubmit}>
          <h2 className={styles.sectionTitle}>Dados do Fornecedor</h2>

          <div className={styles.fieldGroup}>
            <label>Nome da loja <span style={{color:'red'}}>*</span></label>
            <input
              type="text"
              name="supplier_name"
              className={styles.inputLong}
              value={formData.supplier_name}
              onChange={handleChange}
              required // 🔥 Validação HTML5
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Responsável</label>
            <input type="text" name="responsavel" className={styles.inputLong} value={formData.responsavel} onChange={handleChange} />
          </div>

          <div className={styles.fieldGroup}>
            <label>Email (Login) <span style={{color:'red'}}>*</span></label>
            <input
              type="email"
              name="contact_email"
              className={styles.inputLong}
              value={formData.contact_email}
              onChange={handleChange}
              required // 🔥 Validação HTML5
            />
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
              <input type="text" name="estado" className={styles.inputMedium} value={formData.estado} onChange={handleChange} />
            </div>
          </div>

          <h2 className={styles.sectionTitle}>Contatos</h2>

          <div className={styles.row}>
            <div className={styles.fieldGroup}>
              <label>Telefone</label>
              <input type="text" name="phone_number" className={styles.inputMedium} value={formData.phone_number} onChange={handleChange} />
            </div>

            <div className={styles.fieldGroup}>
              <label>Email Secundário</label>
              <input type="email" name="emailContato" className={styles.inputMedium} value={formData.emailContato} onChange={handleChange} />
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
                placeholder="Deixe vazio para gerar auto"
              />
            </div>
          )}

          <div className={styles.footer}>
            <label className={styles.checkboxContainer}>
              <input type="checkbox" name="gerarAutomaticamente" checked={formData.gerarAutomaticamente} onChange={handleChange} />
              <span className={styles.checkmark}></span>
              Gerar senha e usuário automaticamente
            </label>

            {/* 🔥 Botão inteligente com Loading */}
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
      </main>
    </div>
  );
}