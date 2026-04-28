/**
 * ARQUIVO: login-firebase.js
 * DESCRIÇÃO: Lógica de autenticação usando Firebase Auth
 * VERSÃO: 1.0.0
 */

window.addEventListener('DOMContentLoaded', () => {
    const errorDiv = document.getElementById("loginError");
    const form = document.getElementById("loginForm");
    const button = document.getElementById("loginSubmitBtn");

    form.addEventListener("submit", async function(e) {
        e.preventDefault();
        const email = document.getElementById("username").value.trim();
        const pass = document.getElementById("password").value;

        if (!email || !pass) {
            errorDiv.textContent = "Preencha email e senha.";
            errorDiv.style.color = "var(--error-color)";
            return;
        }

        // Garante que o Firebase está carregado
        if (!window.firebaseAuth) {
            errorDiv.textContent = "Erro: Firebase não carregado.";
            return;
        }

        button.disabled = true;
        button.textContent = "Entrando...";
        errorDiv.textContent = "Validando credenciais...";
        errorDiv.style.color = "var(--text-secondary)";

        try {
            // Autenticação com Firebase
            const userCredential = await firebaseAuth.signInWithEmailAndPassword(email, pass);
            const user = userCredential.user;

            errorDiv.textContent = "Login realizado! Sincronizando dados...";
            errorDiv.style.color = "#4caf50";
            // ATENÇÃO: O armazenamento de dados de autenticação sensíveis no localStorage é inseguro.
            // Em um ambiente de produção, utilize HttpOnly cookies para tokens de sessão
            // ou um gerenciamento de sessão seguro no lado do servidor.
            // Para fins de demonstração, manteremos o redirecionamento, mas sem armazenar dados sensíveis diretamente aqui.
            // localStorage.setItem(\'auth_user\', JSON.stringify({ id: user.uid, name: user.displayName || user.email.split(\'@\')[0], email: user.email, timestamp: Date.now() }));
            // localStorage.setItem(\'auth_timestamp\', Date.now().toString());
          // Redirecionamento para o calendário de orações
            const urlParams = new URLSearchParams(window.location.search);
            const redirectUrl = urlParams.get('redirect');
            setTimeout(() => {
                // Padrão: redireciona para o calendário (sem .html)
                window.location.href = redirectUrl ? decodeURIComponent(redirectUrl) : "/pages/calendar";
            }, 1000);

        } catch (error) {
            console.error('[Firebase Login] Erro:', error);
            button.disabled = false;
            button.textContent = "Entrar";
            errorDiv.style.color = "var(--error-color)";
            
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorDiv.textContent = "Email ou senha incorretos.";
                    break;
                case 'auth/too-many-requests':
                    errorDiv.textContent = "Muitas tentativas. Tente mais tarde.";
                    break;
                default:
                    errorDiv.textContent = "Erro ao fazer login. Verifique sua conexão.";
            }
        }
    });
});
