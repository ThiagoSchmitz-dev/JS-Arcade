// Estado central da jornada, percentuais e persistência local.
// Exporta dados e operações consumidos pelos módulos das sessões e pelo Dashboard.

export const CHAVE = 'jsarcade:progresso';

const VERSAO = 1;
const nomes = {
  pomodoro: 'Pomodoro',
  kanban: 'Kanban',
  memoria: 'JS Memória',
  reacao: 'Reação'
};

// Estado inicial usado quando não há um progresso compatível salvo.
const base = () => ({
  versao: VERSAO,
  sessoes: {}
});

let estado = carregar();

// Persistência

/** Carrega apenas dados da versão atual para evitar reutilizar formatos antigos. */
function carregar() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE));
    return salvo?.versao === VERSAO && salvo.sessoes ? salvo : base();
  } catch {
    return base();
  }
}

/** Persiste o estado; a aplicação continua em memória se o navegador bloquear o armazenamento. */
function persistir() {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    /* modo em memória */
  }
}

// Consultas e fórmulas

/** Retorna uma cópia do estado para impedir mutação externa. */
export function obterEstado() {
  return structuredClone(estado);
}

/** Retorna os nomes exibidos das sessões. */
export function obterNomes() {
  return nomes;
}

/** Calcula o percentual do Pomodoro. */
export function percentualPomodoro(alvos) {
  return Math.min(100, (alvos / 36) * 100);
}

/** Calcula o percentual do Kanban. */
export function percentualKanban(corretos) {
  return (corretos / 6) * 100;
}

/** Calcula o percentual da JS Memória. */
export function percentualMemoria(rodadasCorretas) {
  return (rodadasCorretas / 2) * 100;
}

/** Calcula o percentual da Reação. */
export function percentualReacao(mediaMs) {
  return Math.max(0, Math.min(100, (700 - mediaMs) / 5));
}

// Atualizações

/**
 * Salva uma sessão e notifica a interface.
 * @param {string} nome
 * @param {object} resultado
 */
export function salvarSessao(nome, resultado) {
  const anterior = estado.sessoes[nome];

  // Kanban e Reação não aceitam uma nova tentativa depois da conclusão salva.
  if ((nome === 'kanban' || nome === 'reacao') && anterior?.concluida) {
    return;
  }

  const novoPercentual = Math.round(resultado.percentual * 10) / 10;

  // Nas demais sessões, um resultado menor não substitui o melhor já salvo.
  if (!anterior || !anterior.concluida || novoPercentual >= anterior.percentual) {
    estado.sessoes[nome] = {
      ...resultado,
      percentual: novoPercentual
    };
  }

  if (nome === 'reacao' && anterior) {
    const atual = estado.sessoes[nome];
    atual.melhorMs = Math.min(anterior.melhorMs ?? Infinity, resultado.melhorMs ?? Infinity);
    atual.piorMs = Math.max(anterior.piorMs ?? 0, resultado.piorMs ?? 0);
  }

  if (nome === 'memoria' && anterior) {
    estado.sessoes[nome].nivelMaximo = Math.max(anterior.nivelMaximo ?? 0, resultado.nivelMaximo ?? 0);
  }

  persistir();

  // O evento mantém Home e Dashboard sincronizados sem acoplá-los às sessões.
  document.dispatchEvent(new CustomEvent('progressoatualizado', {
    detail: {
      acao: 'salvar',
      nome
    }
  }));
}

/** Resume as sessões concluídas e a média parcial ou final. */
export function resumo() {
  const sessoes = estado.sessoes;
  const concluidas = Object.keys(sessoes);
  const nota = concluidas.length ? concluidas.reduce((total, nome) => total + sessoes[nome].percentual, 0) / concluidas.length : null;

  return {
    sessoes,
    concluidas,
    nota
  };
}

/** Remove o progresso salvo e informa a interface sobre o reinício. */
export function zerarProgresso() {
  estado = base();

  try {
    localStorage.removeItem(CHAVE);
  } catch {
    /* modo em memória */
  }

  document.dispatchEvent(new CustomEvent('progressoatualizado', {
    detail: {
      acao: 'zerar'
    }
  }));
}
