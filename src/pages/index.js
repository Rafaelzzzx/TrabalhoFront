import { useState } from "react";
import api from "../services/api";
import { useRouter } from "next/router";
import styles from '../styles/Login.module.css';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    try {
      const r = await api.post('/login', {
        contact_email: email,
        pwd: senha
      });

      localStorage.setItem("usuario", JSON.stringify(r.data));

      if (r.data.tipo === "ADMIN") router.push("/admin");
      else if (r.data.tipo === "FORNECEDOR") router.push("/fornecedor");
      else if (r.data.tipo === "LOGISTA") router.push("/loja");
      else setErro("Usuário sem tipo definido.");

    } catch (err) {
      setErro("E-mail ou senha inválidos");
    }
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleLogin} className={styles.card}>
        <h2>Login</h2>

        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Senha" type="password" value={senha} onChange={e => setSenha(e.target.value)} />

        <button type="submit">Entrar</button>

        {erro && <p className={styles.erro}>{erro}</p>}
      </form>
    </div>
  );
}
