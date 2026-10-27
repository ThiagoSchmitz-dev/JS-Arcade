export const CHAVE = 'jsarcade:progresso';
const VERSAO = 1;
const nomes = { pomodoro: 'Pomodoro', kanban: 'Kanban', memoria: 'JS Memória', reacao: 'Reação' };

const base = () => ({ versao: VERSAO, sessoes: {} });
let estado = carregar();

function carregar() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE));
    return salvo?.versao === VERSAO && salvo.sessoes ? salvo : base();
  } catch { return base(); }
}

function persistir() {
  try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch { /* modo em memória */ }
}

export function obterEstado() { return structuredClone(estado); }
export function obterNomes() { return nomes; }
export function percentualPomodoro(alvos) { return Math.min(100, (alvos / 36) * 100); }
export function percentualKanban(corretos) { return (corretos / 6) * 100; }
export function percentualMemoria(rodadasCorretas) { return (rodadasCorretas / 2) * 100; }
export function percentualReacao(mediaMs) { return Math.max(0, Math.min(100, (700 - mediaMs) / 5)); }

export function salvarSessao(nome, resultado) {
  const anterior = estado.sessoes[nome];
  if ((nome === 'kanban' || nome === 'reacao') && anterior?.concluida) return;
  const novoPercentual = Math.round(resultado.percentual * 10) / 10;
  if (!anterior || !anterior.concluida || novoPercentual >= anterior.percentual) {
    estado.sessoes[nome] = { ...resultado, percentual: novoPercentual };
  }
  if (nome === 'reacao' && anterior) {
    const atual = estado.sessoes[nome];
    atual.melhorMs = Math.min(anterior.melhorMs ?? Infinity, resultado.melhorMs ?? Infinity);
    atual.piorMs = Math.max(anterior.piorMs ?? 0, resultado.piorMs ?? 0);
  }
  if (nome === 'memoria' && anterior) estado.sessoes[nome].nivelMaximo = Math.max(anterior.nivelMaximo ?? 0, resultado.nivelMaximo ?? 0);
  persistir();
  document.dispatchEvent(new CustomEvent('progressoatualizado', { detail: { acao: 'salvar', nome } }));
}

export function resumo() {
  const sessoes = estado.sessoes;
  const concluidas = Object.keys(sessoes);
  const nota = concluidas.length ? concluidas.reduce((total, nome) => total + sessoes[nome].percentual, 0) / concluidas.length : null;
  return { sessoes, concluidas, nota };
}

export function zerarProgresso() {
  estado = base();
  try { localStorage.removeItem(CHAVE); } catch { /* modo em memória */ }
  document.dispatchEvent(new CustomEvent('progressoatualizado', { detail: { acao: 'zerar' } }));
}
