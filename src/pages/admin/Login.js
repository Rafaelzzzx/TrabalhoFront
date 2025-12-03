import React, { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../services/api';
import styles from '../../styles/AdminLogin.module.css';

export default function LoginAdmin() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erroLogin, setErroLogin] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErroLogin("");

    try {
      const response = await api.post('/login', {
        contact_email: email,
        pwd: senha,
        level: "admin"
      });


      localStorage.setItem("usuario", JSON.stringify(response.data));


      router.push('/admin/Dashboard');

    } catch (err) {
      console.error("Erro de Login:", err.response?.data || err);

      if (err.response) {
        if (err.response.status === 401) {
          setErroLogin("Email ou senha incorretos.");
          return;
        }

        setErroLogin(err.response.data?.erro || "Erro ao fazer login.");
        return;
      }

      setErroLogin("Erro inesperado. Tente novamente.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>

        <div className={styles.title}>
          LOGIN<br />ADMINISTRADOR
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div className={styles.inputGroup}>
            <label>Email:</label>
            <input
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Senha:</label>
            <input
              type="password"
              className={styles.input}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          {erroLogin && <p className={styles.errorMessage}>{erroLogin}</p>}

          <button type="submit" className={styles.button}>
            Entrar como<br />Administrador
          </button>
        </form>

        <p className={styles.footerText}>
          Apenas administradores autorizados<br />têm acesso.
        </p>
      </div>
    </div>
  );
}
