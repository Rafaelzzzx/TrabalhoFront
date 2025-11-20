import { useEffect, useState } from "react";
import api from "../../services/api";
import { useRouter } from "next/router";
import styles from '../../styles/Admin.module.css';

export default function AdminLojas() {

  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [lista, setLista] = useState([]);

  async function carregar() {
    const r = await api.get('/lojas');
    setLista(r.data);
  }

  async function criarLoja() {
    await api.post('/lojas', { nome, email });
    carregar();
  }

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div className={styles.main}>
      <h1>Gerenciar Lojas</h1>

      <div>
        <input placeholder="Nome da loja" value={nome} onChange={(e)=>setNome(e.target.value)} />
        <input placeholder="Email da loja" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <button onClick={criarLoja}>Criar</button>
      </div>

      <h2>Lojas cadastradas:</h2>

      <ul>
        {lista.map(loja => (
          <li key={loja.id}>
            {loja.nome} — {loja.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
