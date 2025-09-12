import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaLock } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1-email, 2-pin, 3-nova senha
  const [resetToken, setResetToken] = useState(''); // token backend após verificar PIN
  const [pin, setPin] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [resetOk, setResetOk] = useState(false);

  // Garantir que apenas nesta página o body fique sem scroll (layout estático)
  useEffect(() => {
    document.body.classList.add('login-page');
    return () => { document.body.classList.remove('login-page'); };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const ok = await login(email, senha);
    if (!ok) setError('E-mail ou senha inválidos');
  };

  const solicitarReset = async (e) => {
    e.preventDefault();
    setResetError('');
    if (!resetEmail) return;
    setResetLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await res.json();
      if (data.success) {
        setResetSent(true);
        setResetStep(2);
      } else {
        setResetError(data.error || 'Erro ao solicitar reset');
      }
    } catch {
      setResetError('Falha de rede');
    } finally {
      setResetLoading(false);
    }
  };

  const verificarPin = async (e) => {
    e.preventDefault();
    setResetError('');
    if (!resetEmail) return setResetError('Informe o e-mail');
    if (!pin || pin.length !== 8) return setResetError('Informe o PIN de 8 dígitos');
    setResetLoading(true);
    try {
      const res = await fetch('/api/auth/verify-reset-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, pin })
      });
      const data = await res.json();
      if (data.success && data.data?.token) {
        setResetToken(data.data.token);
        setResetStep(3);
      } else {
        setResetError(data.error || 'PIN inválido ou expirado');
      }
    } catch {
      setResetError('Falha de rede');
    } finally {
      setResetLoading(false);
    }
  };

  const redefinirSenha = async (e) => {
    e.preventDefault();
    setResetError('');
    if (!resetToken) return setResetError('Token inválido, recomece o processo');
    if (!newPass) return setResetError('Informe a nova senha');
    if (newPass.length < 6) return setResetError('A nova senha deve ter ao menos 6 caracteres');
    if (newPass !== confirmPass) return setResetError('As senhas não coincidem');
    setResetLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, nova_senha: newPass })
      });
      const data = await res.json();
      if (data.success) {
        setResetOk(true);
      } else {
        setResetError(data.error || 'Erro ao redefinir senha');
      }
    } catch {
      setResetError('Falha de rede');
    } finally {
      setResetLoading(false);
    }
  };

  const openReset = () => {
    setShowReset(true);
    setResetSent(false);
    setResetError('');
    setResetLoading(false);
    setResetStep(1);
    setResetToken('');
    setNewPass('');
    setConfirmPass('');
  setResetOk(false);
  setPin('');
  };

  const closeReset = () => {
    setShowReset(false);
    setResetSent(false);
    setResetError('');
    setResetLoading(false);
    setResetStep(1);
    setResetToken('');
    setNewPass('');
    setConfirmPass('');
    setResetOk(false);
  };

  return (
    <div className="login-root-static">
      <div className="ring-wrap">
        <i style={{ '--clr': '#00ffb3' }}></i>
        <i style={{ '--clr': '#007bff' }}></i>
        <i style={{ '--clr': '#00ffa0' }}></i>
        <div className="login">
          <div className="login-branding-minimal">
            <img src="/nexar-logo.png" alt="Logo Nexar.ia" className="login-logo" />
            <span className="login-title">Nexar.ia</span>
          </div>
          <h2>Login</h2>
          <form onSubmit={handleSubmit} className="login-form-flat" autoComplete="off">
            <div className="inputBx">
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                spellCheck="false"
              />
            </div>
            <div className="inputBx">
              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                spellCheck="false"
              />
            </div>
            {error && <div className="error-message minimal">{error}</div>}
            <div className="inputBx">
              <input type="submit" value={loading ? 'Entrando...' : 'Entrar'} disabled={loading} />
            </div>
            <div className="links">
              <button type="button" onClick={openReset} className="link-btn">Esqueci a senha</button>
              <span className="mute-info">&nbsp;</span>
            </div>
          </form>
        </div>
      </div>

      {showReset && (
        <div className="reset-modal-overlay" onClick={closeReset}>
          <div className="reset-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Recuperar Senha</h3>
            {!resetOk ? (
              <>
                {resetStep === 1 && (
                  <form onSubmit={solicitarReset} className="reset-form">
                    <input
                      type="email"
                      placeholder="Seu e-mail"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      spellCheck="false"
                    />
                    {resetError && <div className="error-inline">{resetError}</div>}
                    <div className="reset-actions">
                      <button type="button" className="btn-cancel" onClick={closeReset}>Cancelar</button>
                      <button type="submit" className="btn-send" disabled={resetLoading}>{resetLoading ? 'Enviando...' : 'Enviar'}</button>
                    </div>
                    <p className="reset-hint">Se o e-mail existir, enviaremos um PIN de 8 dígitos para sua caixa de e-mail.</p>
                  </form>
                )}
                {resetStep === 2 && (
                  <form onSubmit={verificarPin} className="reset-form">
                    <input
                      type="text"
                      placeholder="PIN de 8 dígitos"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      required
                      spellCheck="false"
                    />
                    {resetError && <div className="error-inline">{resetError}</div>}
                    <div className="reset-actions">
                      <button type="button" className="btn-cancel" onClick={() => { setResetStep(1); setResetError(''); }}>Voltar</button>
                      <button type="submit" className="btn-send" disabled={resetLoading}>{resetLoading ? 'Verificando...' : 'Verificar PIN'}</button>
                    </div>
                  </form>
                )}
                {resetStep === 3 && (
                  <form onSubmit={redefinirSenha} className="reset-form">
                    <input
                      type="password"
                      placeholder="Nova senha"
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      required
                      spellCheck="false"
                    />
                    <input
                      type="password"
                      placeholder="Confirmar nova senha"
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      required
                      spellCheck="false"
                    />
                    {resetError && <div className="error-inline">{resetError}</div>}
                    <div className="reset-actions">
                      <button type="button" className="btn-cancel" onClick={() => { setResetStep(2); setResetError(''); }}>Voltar</button>
                      <button type="submit" className="btn-send" disabled={resetLoading}>{resetLoading ? 'Redefinindo...' : 'Redefinir senha'}</button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <div className="reset-success">
                <p>Senha redefinida com sucesso! Você já pode fazer login com a nova senha.</p>
                <button className="btn-send" onClick={closeReset}>Fazer login</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
