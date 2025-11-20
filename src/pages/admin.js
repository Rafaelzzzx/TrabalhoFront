import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import styles from '../styles/Admin.module.css';
import api from "../services/api";                 /

export default function AdminDashboard() {

  const router = useRouter();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem('usuario'));

    if (!u || u.tipo !== "ADMIN") {
      router.push('/login');
      return;
    }

    setUsuario(u);
  }, []);

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2>ADMIN</h2>
        <ul>
          <li onClick={() => router.push('/admin/lojas')}>Gerenciar Lojas</li>
          <li onClick={() => router.push('/admin/fornecedores')}>Gerenciar Fornecedores</li>
          <li onClick={() => router.push('/admin/produtos')}>Gerenciar Produtos</li>
          <li onClick={() => router.push('/admin/campanhas')}>Campanhas</li>
        </ul>
      </aside>

      <main className={styles.main}>
        <h1>Bem-vindo, {usuario?.nome}</h1>
        <p>Selecione uma opção no menu ao lado.</p>
      </main>
    </div>
  );
}
