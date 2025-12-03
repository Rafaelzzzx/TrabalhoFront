import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Swal from 'sweetalert2';

const withAuth = (WrappedComponent) => {
    const Wrapper = (props) => {
        const router = useRouter();
        const [verified, setVerified] = useState(false);

        useEffect(() => {
            const usuarioString = localStorage.getItem("usuario");

            // 1. Se ninguém está logado, manda pro login
            if (!usuarioString) {
                router.replace("/admin/Login");
                return;
            }

            try {
                const usuario = JSON.parse(usuarioString);

                // 2. Se está logado, mas NÃO é admin
                if (usuario.level !== "admin") {

                    Swal.fire({
                        icon: 'warning', // Mudei para warning (amarelo) para indicar atenção
                        title: 'Acesso Exclusivo',
                        // Explica que ele precisa trocar de conta
                        text: `Você está logado como ${usuario.name || 'usuário comum'}, mas esta página requer acesso de Administrador.`,
                        showCancelButton: true,
                        confirmButtonText: 'Ir para Login Admin',
                        confirmButtonColor: '#3085d6',
                        cancelButtonText: 'Voltar para Home',
                        cancelButtonColor: '#d33',
                        allowOutsideClick: false,
                        allowEscapeKey: false
                    }).then((result) => {
                        if (result.isConfirmed) {
                            // --- O PULO DO GATO ---
                            // Remove o usuário comum da memória para ele poder logar como admin
                            localStorage.removeItem("usuario");
                            // Leva para a tela de login
                            router.replace("/admin/Login");
                        } else {
                            // Se ele clicar em cancelar, volta pra Home
                            router.replace("/");
                        }
                    });

                    return;
                }

                // 3. É admin, libera o acesso
                setVerified(true);

            } catch (error) {
                console.error("Erro auth:", error);
                localStorage.removeItem("usuario");
                router.replace("/admin/Login");
            }
        }, [router]);

        if (!verified) return null;

        return <WrappedComponent {...props} />;
    };

    Wrapper.displayName = `WithAuth(${getDisplayName(WrappedComponent)})`;
    return Wrapper;
};

function getDisplayName(WrappedComponent) {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default withAuth;