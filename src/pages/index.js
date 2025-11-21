import { useState } from "react";
import api from "../services/api";
import { useRouter } from "next/router";
import styles from '../styles/Login.module.css'; // Importa o CSS que criamos acima

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setErro(""); // Limpa erros antigos

    try {
      const r = await api.post('/login', {
        contact_email: email,
        pwd: senha
      });

      // Salva o usuário no navegador
      localStorage.setItem("usuario", JSON.stringify(r.data));

      // Redireciona baseado no tipo que veio da API
      if (r.data.tipo === "ADMIN") router.push("/admin");
      else if (r.data.tipo === "FORNECEDOR") router.push("/fornecedor");
      else if (r.data.tipo === "LOGISTA") router.push("/loja");
      else router.push("/loja"); // Fallback padrão

    } catch (err) {
      setErro("E-mail ou senha inválidos");
      console.error(err);
    }
  }

  return (
    <div className={styles.container}>

      <form onSubmit={handleLogin} className={styles.loginBox}>

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

        {/* Área dos dois botões verdes */}
        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.greenButton}>
            Logar como<br/>Fornecedor
          </button>

          <button type="submit" className={styles.greenButton}>
            Logar como<br/>Logista
          </button>
        </div>

        {erro && <p className={styles.erro}>{erro}</p>}
      </form>
    </div>
  );
}