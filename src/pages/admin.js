import React, { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../services/api';
import styles from '../styles/AdminLogin.module.css';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post('/login', {
        contact_email: email,
        pwd: senha,
        level: "admin"
      });

      const dados = response.data;

      localStorage.setItem("usuario", JSON.stringify(dados));

      router.push('/admin/dashboard');

    } catch (err) {
      console.error(err);
      alert("Credenciais inválidas!");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>

        <div className={styles.title}>
          LOGIN<br />ADMINISTRADOR
        </div>

        <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
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
