import { useState } from "react";
import api from "../services/api";
import { useRouter } from "next/router";
import styles from '../styles/Login.module.css';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function handleLogin(levelEscolhido) {
    setErro("");

    try {
      const r = await api.post('/login', {
        contact_email: email,
        pwd: senha,
        level: levelEscolhido   // ✔ CORRETO
      });

      localStorage.setItem("usuario", JSON.stringify(r.data));

      if (r.data.level === "admin") router.push("/admin");
      if (r.data.level === "logista") router.push("/loja");
      if (r.data.level === "fornecedor") router.push("/fornecedor");

    } catch (err) {
      setErro("E-mail ou senha inválidos");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>   {/* ✔ REMOVIDO <form> */}

        <h1 className={styles.title}>LOGIN</h1>

        <div className={styles.inputGroup}>
          <label>Email:</label>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Senha:</label>
          <input
            className={styles.input}
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
          />
        </div>

        <div className={styles.buttonContainer}>
          <button
            type="button"
            className={styles.greenButton}
            onClick={() => handleLogin("logista")}
          >
            Logar como<br />Logista
          </button>

          <button
            type="button"
            className={styles.greenButton}
            onClick={() => handleLogin("fornecedor")}
          >
            Logar como<br />Fornecedor
          </button>
        </div>

        {erro && <p className={styles.erro}>{erro}</p>}
      </div>
    </div>
  );
}
