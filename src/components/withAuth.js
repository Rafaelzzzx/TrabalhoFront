import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const withAuth = (WrappedComponent) => {
    return (props) => {
        const router = useRouter();
        const [verified, setVerified] = useState(false);

        useEffect(() => {
            // 1. Tenta buscar os dados do usuário no localStorage
            const usuarioString = localStorage.getItem("usuario");

            // 2. Se não houver dados salvos, o usuário não está logado
            if (!usuarioString) {
                router.replace("/admin/Login");
                return;
            }

            try {
                const usuario = JSON.parse(usuarioString);

                // 3. Verifica se o usuário tem o nível de acesso correto (admin)
                if (usuario.level !== "admin") {
                    // Se for logista ou fornecedor tentando acessar área de admin:
                    alert("Acesso negado. Esta área é restrita para administradores.");

                    // Redireciona para a página inicial ou para a área correta dele
                    router.replace("/");
                    return;
                }

                // 4. Se passou por todas as verificações, libera o acesso
                setVerified(true);

            } catch (error) {
                // Se o JSON no localStorage estiver corrompido
                console.error("Erro ao verificar autenticação:", error);
                localStorage.removeItem("usuario");
                router.replace("/admin/Login");
            }
        }, [router]);

        // Enquanto verifica, retorna null para não "piscar" a tela protegida
        if (!verified) {
            return null; // Você pode substituir isso por um <Loading /> se preferir
        }

        // Se verificado com sucesso, renderiza o componente da página original
        return <WrappedComponent {...props} />;
    };
};

export default withAuth;