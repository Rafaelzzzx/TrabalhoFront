import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/perfil.module.css';
import api from '@/services/api';

// Ícones
import {
  FiGrid, FiUsers, FiPackage, FiUser, FiLogOut
} from 'react-icons/fi';

const PerfilLoja = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Estado inicial com TODOS os campos da entidade Loja.java
  const [formData, setFormData] = useState({
    id: '',
    nomeFantasia: '',
    cnpj: '',
    responsavelNome: '',
    emailContato: '',
    telefone: '',
    cep: '',
    logradouro: '',
    cidade: '',
    estado: ''
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const usuarioStored = localStorage.getItem("usuario");
        if (usuarioStored) {
          const usuario = JSON.parse(usuarioStored);

          // LÓGICA DE ID:
          // O ideal é que o login retorne o ID da loja.
          // Se não tiver, você pode ter que buscar o usuário por ID para achar a loja vinculada.
          // Aqui assumimos que usuario.lojaId existe ou simulamos isso.
          const lojaId = usuario.lojaId || usuario.id; // Ajuste conforme seu backend retornar

          if (lojaId) {
            // Chamada para buscar dados atuais (GET)
            // Se der erro 404, significa que precisa ajustar como pegamos o ID correto
            const response = await api.get(`/api/v1/lojas/${lojaId}`);
            const loja = response.data;

            setFormData({
              id: loja.id,
              nomeFantasia: loja.nomeFantasia || '',
              cnpj: loja.cnpj || '',
              responsavelNome: loja.responsavelNome || '',
              emailContato: loja.emailContato || '',
              telefone: loja.telefone || '',
              cep: loja.cep || '',
              logradouro: loja.logradouro || '',
              cidade: loja.cidade || '',
              estado: loja.estado || ''
            });
          }
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        // Não mostramos erro na tela logo de cara para não assustar se for só falta de dados
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!formData.id) {
         throw new Error("ID da loja não identificado. Faça login novamente.");
      }

      // Envia PUT para atualizar
      await api.put(`/api/v1/lojas/${formData.id}`, formData);

      setMessage({ type: 'success', text: 'Dados da loja atualizados com sucesso!' });
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      const msg = error.response?.data?.error || error.message || "Erro ao salvar alterações.";
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>

      {/* SIDEBAR */}
      <nav className={styles.sidebar}>
        <div style={{ padding: '0 30px 20px', fontSize: '20px', fontWeight: 'bold' }}>
           Minha Loja
        </div>
        <ul>
          <li>
            <Link href="/loja/dashboard" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiGrid size={20} /><span>Dashboard</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/loja/fornecedoresdisponiveis" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiUsers size={20} /><span>Fornecedores</span>
              </div>
            </Link>
          </li>
          <li>
            <Link href="/loja/pedidos" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiPackage size={20} /><span>Pedidos</span>
              </div>
            </Link>
          </li>
          <li className={styles.active}>
            <Link href="/loja/perfil" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiUser size={20} /><span>Perfil</span>
              </div>
            </Link>
          </li>
          <li style={{ marginTop: '20px' }}>
            <Link href="/" className={styles.linkReset}>
              <div className={styles.menuItem}>
                <FiLogOut size={20} /><span>Sair</span>
              </div>
            </Link>
          </li>
        </ul>
      </nav>

      {/* CONTEÚDO PRINCIPAL */}
      <main className={styles.content}>

        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Perfil da Loja</h1>
          <p className={styles.pageSubtitle}>Gerencie as informações da sua conta e dados de contato</p>
        </div>

        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <div className={styles.formCard}>
          <h2 className={styles.cardTitle}>Dados da Loja</h2>

          <form onSubmit={handleSubmit}>
            {/* GRUPO 1: Identificação */}
            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label>Nome da Loja</label>
                <input
                  type="text"
                  name="nomeFantasia"
                  value={formData.nomeFantasia}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Ex: Tech Store"
                  required
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>CNPJ</label>
                <input
                  type="text"
                  name="cnpj"
                  value={formData.cnpj}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
              </div>
            </div>

            {/* GRUPO 2: Contato Pessoal */}
            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label>Responsável</label>
                <input
                  type="text"
                  name="responsavelNome"
                  value={formData.responsavelNome}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Nome do Gerente"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>E-mail</label>
                <input
                  type="email"
                  name="emailContato"
                  value={formData.emailContato}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="contato@loja.com"
                />
              </div>
            </div>

            {/* GRUPO 3: Contato Telefônico e CEP */}
            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label>Telefone</label>
                <input
                  type="text"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className={styles.fieldGroup}>
                <label>CEP</label>
                <input
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>
            </div>

            {/* GRUPO 4: Endereço */}
            <div className={styles.row}>
              <div className={styles.fieldGroup} style={{ flex: 2 }}>
                <label>Logradouro (Rua, Número, Bairro)</label>
                <input
                  type="text"
                  name="logradouro"
                  value={formData.logradouro}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Av. Principal, 1000"
                />
              </div>
            </div>

            {/* GRUPO 5: Localização */}
            <div className={styles.row}>
              <div className={styles.fieldGroup} style={{ flex: 3 }}>
                <label>Cidade</label>
                <input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.fieldGroup} style={{ flex: 1 }}>
                <label>Estado (UF)</label>
                <input
                  type="text"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="SP"
                  maxLength={2}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>

            <button type="submit" className={styles.saveButton} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PerfilLoja;