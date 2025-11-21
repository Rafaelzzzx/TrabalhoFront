import React, { useState } from 'react';
import { useRouter } from 'next/router';

import styles from '../styles/AdminLogin.module.css';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === "admin@admin.com" && senha === "123456") {
      const dadosAdmin = {
        nome: "Administrador Chefe",
        email: email,
        tipo: "ADMIN"
      };
      localStorage.setItem('usuario', JSON.stringify(dadosAdmin));

      // Redireciona para o dashboard (assumindo que ele está em /admin/dashboard)
      router.push('/admin/dashboard');
    } else {
      alert("Credenciais de administrador inválidas!");
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