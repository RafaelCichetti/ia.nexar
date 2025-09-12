import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useInView, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Sparkles, CheckCircle2, TrendingUp, Clock, Wallet2, X, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: <Zap className="w-6 h-6 text-brand" />,
    title: 'Velocidade e Eficiência',
    desc: 'Arquitetura otimizada, respostas instantâneas e menos atrito em cada clique.'
  },
  {
    icon: <ShieldCheck className="w-6 h-6 text-brand" />,
    title: 'Segurança de Nível Empresarial',
    desc: 'Criptografia, boas práticas e controles para proteger seus dados.'
  },
  {
    icon: <Sparkles className="w-6 h-6 text-brand" />,
    title: 'IA que Impressiona',
    desc: 'Experiências inteligentes que aumentam conversão e encantam seus clientes.'
  }
];

export default function Landing() {
  // Modais de Termos e Privacidade
  const [showTermos, setShowTermos] = useState(false);
  const [showPrivacidade, setShowPrivacidade] = useState(false);
  const [showContato, setShowContato] = useState(false);

  // Animated counter (R$ 25.000)
  const refCounter = useRef(null);
  const isInView = useInView(refCounter, { once: true, amount: 0.5 });
  const raw = useMotionValue(0);
  const smooth = useSpring(raw, { stiffness: 80, damping: 20 });
  const [display, setDisplay] = useState('0');
  useEffect(() => {
    if (isInView) raw.set(25000);
    const unsub = smooth.on('change', (v) => {
      setDisplay(new Intl.NumberFormat('pt-BR').format(Math.round(v)));
    });
    return () => unsub();
  }, [isInView, raw, smooth]);

  // Formulário
  const [form, setForm] = useState({ nome: '', empresa: '', ramo: '', problema: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  async function submit(e) {
    e.preventDefault();
    if (!form.nome || !form.empresa || !form.ramo || !form.problema) return;
    try {
      setSending(true);
  const API_BASE = process.env.REACT_APP_API_BASE || '';
  const res = await fetch(`${API_BASE}/api/public/landing/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data?.success) {
        setSent(true);
        setError('');
        setForm({ nome: '', empresa: '', ramo: '', problema: '' });
      } else {
        setError(data?.error || 'Não foi possível enviar. Tente novamente.');
      }
    } catch (e) {
      setError('Falha de conexão. Tente novamente.');
    } finally {
      setSending(false);
    }
  }
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08090B] text-white">
      {/* Modal genérico */}
      <AnimatePresence>
        {showTermos && (
          <Modal title="Termos de Uso" onClose={() => setShowTermos(false)}>
            <div className="space-y-3 text-sm text-zinc-300">
              <p>Ao utilizar a plataforma Nexar.ia, você concorda com estes Termos de Uso. Utilize o sistema de maneira lícita e responsável. Podemos atualizar estes termos periodicamente.</p>
              <p>É proibido tentar burlar mecanismos de segurança, acessar dados de terceiros sem permissão ou explorar vulnerabilidades. Violações podem resultar em suspensão de acesso.</p>
              <p>Disponibilizamos a plataforma “como está”, com esforços contínuos de melhoria. Suporte e SLA podem ser acordados contratualmente.</p>
              <p>Para dúvidas, entre em contato com nossa equipe de suporte.</p>
            </div>
          </Modal>
        )}
        {showPrivacidade && (
          <Modal title="Política de Privacidade" onClose={() => setShowPrivacidade(false)}>
            <div className="space-y-3 text-sm text-zinc-300">
              <p>Coletamos dados estritamente necessários para operação e melhoria do serviço, sempre em conformidade com a LGPD.</p>
              <p>Dados podem incluir informações de contato, uso do sistema e registros de suporte. Utilizamos medidas técnicas e organizacionais para proteger sua privacidade.</p>
              <p>Você pode solicitar acesso, correção ou exclusão de dados conforme a legislação aplicável. O uso integra consentimento para processamento nos termos aqui descritos.</p>
              <p>Atualizaremos esta política quando necessário e comunicaremos mudanças relevantes.</p>
            </div>
          </Modal>
        )}
        {showContato && (
          <Modal title="Contato" onClose={() => setShowContato(false)}>
            <div className="space-y-4 text-sm text-zinc-300">
              <p>Fale diretamente com nossa equipe pelos contatos abaixo:</p>
              <div className="space-y-3">
                <a href="mailto:rafael@nexarhub.com.br" className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10">
                  <Mail className="h-5 w-5 text-brand" />
                  <span className="truncate">rafael@nexarhub.com.br</span>
                </a>
                <a href="mailto:pablo@nexarhub.com.br" className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10">
                  <Mail className="h-5 w-5 text-brand" />
                  <span className="truncate">pablo@nexarhub.com.br</span>
                </a>
                <a href="tel:+5511986087405" className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 hover:bg-white/10">
                  <Phone className="h-5 w-5 text-brand" />
                  <span className="truncate">+55 11 98608-7405</span>
                </a>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
      {/* BG decorativo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-80 w-[42rem] rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-brand/10 blur-2xl" />
        <div className="absolute inset-0 bg-grid bg-[length:22px_22px] opacity-[0.12]" />
      </div>

      {/* Header minimalista */}
      <header className="relative z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <img
              src="/nexar-logo.png"
              alt="Logo Nexar.ia"
              className="h-8 w-8 rounded-lg object-contain"
              loading="eager"
              decoding="async"
            />
            <span className="text-lg font-semibold tracking-tight">Nexar.ia</span>
          </div>
          <div className="hidden gap-6 text-sm/6 text-zinc-300 md:flex">
            <a href="#beneficios" className="hover:text-white transition-colors">Benefícios</a>
            <a href="#cta" className="hover:text-white transition-colors">Começar</a>
          </div>
          <Link to="/login" className="btn btn-primary rounded-xl bg-gradient-to-tr from-brand to-brand-light px-5 py-2 text-sm font-semibold shadow-glow hover:from-brand-dark hover:to-brand">Entrar</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10">
  <div className="mx-auto max-w-7xl px-6 pt-16 pb-10 md:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-300 backdrop-blur">
              <Sparkles className="h-4 w-4 text-brand" />
              Plataforma SaaS de IA — moderna, confiável e elegante
            </div>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              Eleve seu atendimento com uma plataforma
              <span className="mx-2 bg-gradient-to-tr from-brand to-brand-light bg-clip-text text-transparent">inteligente</span>
              e de alto nível
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-zinc-300 md:mt-6 md:text-lg">
              Centralize conversas, configure automações e transforme contatos em resultados. Design clean, performance real e IA que faz diferença.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <a href="#formulario" className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-tr from-brand to-brand-light px-5 py-3 font-semibold text-white shadow-glow transition-transform hover:-translate-y-0.5">
                Começar agora
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a href="#beneficios" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-semibold text-white/90 backdrop-blur hover:bg-white/10">
                Ver benefícios
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefícios */}
      <section id="beneficios" className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-10 md:py-16">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="card card-glass rounded-2xl border-white/10 bg-white/5 p-6 backdrop-blur-md"
              >
                <div className="mb-3 inline-flex items-center justify-center rounded-xl bg-white/5 p-2">
                  {f.icon}
                </div>
                <h3 className="mb-1 text-lg font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-zinc-300">{f.desc}</p>
              </motion.div>
            ))}
            {[{
              icon: <TrendingUp className="w-6 h-6 text-brand" />, title: 'Resultados Visíveis', desc: 'Métricas claras e acompanhamento em tempo real para decisões melhores.'
            }, {
              icon: <Clock className="w-6 h-6 text-brand" />, title: 'Agilidade Operacional', desc: 'Menos retrabalho, mais automação e foco no que importa.'
            }, {
              icon: <Wallet2 className="w-6 h-6 text-brand" />, title: 'ROI Acelerado', desc: 'Processos enxutos que convertem mais e custam menos.'
            }].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: 0.24 + i * 0.08 }}
                className="card card-glass rounded-2xl border-white/10 bg-white/5 p-6 backdrop-blur-md"
              >
                <div className="mb-3 inline-flex items-center justify-center rounded-xl bg-white/5 p-2">
                  {f.icon}
                </div>
                <h3 className="mb-1 text-lg font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-zinc-300">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Economia com número animado */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <motion.div
            ref={refCounter}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] p-8 text-center backdrop-blur"
          >
            <p className="text-sm uppercase tracking-widest text-zinc-300">Economia média anual</p>
            <div className="text-4xl font-extrabold md:text-6xl">R$ {display}</div>
            <p className="max-w-2xl text-zinc-300">Automação de atendimento, redução de ociosidade e processos modernos que economizam até <b>R$ 25.000</b> por ano.</p>
          </motion.div>
        </div>
      </section>

      {/* Formulário de contato */}
  <section id="formulario" className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-10 md:py-16">
          <div className="grid gap-8 items-start md:[grid-template-columns:1.2fr_1fr]">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold">Conte para nós sobre a sua operação</h3>
              <p className="text-zinc-300">Preencha o formulário e nossa equipe entrará em contato. Queremos entender seu cenário e sugerir o melhor caminho.</p>

              {/* Checklist persuasivo para ocupar espaço e aumentar confiança */}
              <ul className="mt-4 space-y-3 text-zinc-300">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-brand" />
                  <span>Integração rápida com WhatsApp e automações inteligentes.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-brand" />
                  <span>Configuração assistida passo a passo para acelerar o go‑live.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-brand" />
                  <span>Acompanhamento por especialista e boas práticas de conversão.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-brand" />
                  <span>Redução de custos operacionais com automação eficiente.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-brand" />
                  <span>Painel com métricas e insights em tempo real.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-brand" />
                  <span>Suporte humano prioritário quando você precisar.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-brand" />
                  <span>Implantação segura e compatível com a LGPD.</span>
                </li>
              </ul>

              {/* Selos de confiança */}
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur">
                  <ShieldCheck className="mx-auto h-5 w-5 text-brand" />
                  <div className="mt-2 text-sm font-semibold">Segurança</div>
                  <div className="text-xs text-zinc-400">Privacidade e LGPD</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur">
                  <Clock className="mx-auto h-5 w-5 text-brand" />
                  <div className="mt-2 text-sm font-semibold">Agilidade</div>
                  <div className="text-xs text-zinc-400">Resposta em 1d útil</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur">
                  <Sparkles className="mx-auto h-5 w-5 text-brand" />
                  <div className="mt-2 text-sm font-semibold">Experiência</div>
                  <div className="text-xs text-zinc-400">Onboarding guiado</div>
                </div>
              </div>
            </div>
            <form onSubmit={submit} className="card card-glass rounded-2xl border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <div className="grid gap-4">
                <input className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-zinc-400 focus:border-brand" placeholder="Nome" value={form.nome} onChange={e=>setForm({...form, nome:e.target.value})} required />
                <input className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-zinc-400 focus:border-brand" placeholder="Empresa" value={form.empresa} onChange={e=>setForm({...form, empresa:e.target.value})} required />
                <input className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-zinc-400 focus:border-brand" placeholder="Ramo" value={form.ramo} onChange={e=>setForm({...form, ramo:e.target.value})} required />
                <textarea className="min-h-[120px] rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none placeholder:text-zinc-400 focus:border-brand" placeholder="Qual problema você procura resolver na sua empresa?" value={form.problema} onChange={e=>setForm({...form, problema:e.target.value})} required />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button disabled={sending || sent} className="btn btn-primary rounded-xl bg-gradient-to-tr from-brand to-brand-light px-6 py-3 text-base font-semibold shadow-glow hover:from-brand-dark hover:to-brand disabled:opacity-60">
                  {sent ? 'Enviado!' : (sending ? 'Enviando...' : 'Enviar')}
                </button>
                {sent && <span className="text-sm text-brand">Formulário enviado com sucesso.</span>}
                {!sent && error && <span className="text-sm text-red-400">{error}</span>}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 py-10 md:py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-tr from-white/10 to-white/[0.06] p-8 backdrop-blur"
          >
            <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-brand/20 blur-3xl" />
            <div className="relative">
              <div className="mb-3 inline-flex items-center gap-2 text-sm text-brand">
                <CheckCircle2 className="h-5 w-5" /> Comece em minutos
              </div>
              <h2 className="text-2xl font-semibold md:text-3xl">Pronto para levar a sua operação ao próximo nível?</h2>
              <p className="mt-2 max-w-2xl text-zinc-300">Entrar no sistema é o primeiro passo para criar experiências de atendimento mais rápidas, humanas e eficientes.</p>
              <div className="mt-6">
                <Link to="/login" className="btn btn-primary rounded-xl bg-gradient-to-tr from-brand to-brand-light px-6 py-3 text-base font-semibold shadow-glow hover:from-brand-dark hover:to-brand">
                  Ir para o login
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="relative z-10 border-t border-white/10/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-zinc-400 md:flex-row">
          <p>© {new Date().getFullYear()} Nexar.ia — Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowTermos(true)} className="hover:text-white transition-colors">Termos</button>
            <button onClick={() => setShowPrivacidade(true)} className="hover:text-white transition-colors">Privacidade</button>
            <button onClick={() => setShowContato(true)} className="hover:text-white transition-colors">Contato</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Componente de Modal com animação
function Modal({ title, children, onClose }) {
  // Fechar com ESC
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose?.(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Bloquear scroll do body enquanto o modal estiver aberto
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
        <motion.div
          role="dialog"
          aria-modal="true"
          className="pointer-events-auto w-[92vw] max-w-lg"
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 8 }}
          transition={{ duration: 0.18 }}
        >
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0C0D10] shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <h4 className="text-base font-semibold">{title}</h4>
              <button onClick={onClose} aria-label="Fechar" className="rounded-md p-1 text-zinc-300 hover:bg-white/5 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[85vh] overflow-y-auto px-5 py-4">
              {children}
            </div>
            <div className="flex justify-end gap-2 border-t border-white/10 px-5 py-3">
              <button onClick={onClose} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10">Fechar</button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>,
    document.body
  );
}
