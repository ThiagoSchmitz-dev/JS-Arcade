/**
 * dashboard.js
 *
 * Painel de resultados da JS Arcade: nota (parcial ou final), mensagem de
 * desempenho, uma linha por sessão e indicadores (KPIs). Também preenche a
 * lista de progresso da Home e liga o botão "Reiniciar jornada".
 *
 * Depende de state.js e é ligado por main.js. Os elementos da tela
 * (#dashboard-*, #home-progress*, #restart-journey) estão no index.html.
 */

import { CHAVE, obterNomes, resumo } from './state.js';

// Âncora de cada sessão na página (destino dos links das linhas do dashboard).
const destinos = {
  pomodoro: '#pomodoro',
  kanban: '#kanban',
  memoria: '#memoria',
  reacao: '#reacao'
};

/** Formata um número no padrão pt-BR, com no máximo 1 casa decimal. */
const formatar = valor => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(valor);

/** Mensagem de desempenho conforme a nota: 100, 90 ou mais, 70 ou mais, 50 ou mais, ou abaixo disso. */
function mensagem(nota) {
  if (nota === 100) return 'Perfeito. Você foi imbatível.';
  if (nota >= 90) return 'Espetacular, você foi acima da média.';
  if (nota >= 70) return 'Parabéns, você foi excelente.';
  if (nota >= 50) return 'Você foi bem, mas ainda dá para evoluir.';
  return 'Seu desempenho ainda pode melhorar.';
}

/**
 * Redesenha o dashboard e a lista de progresso da Home a partir do estado salvo:
 * nota, mensagem, linhas por sessão e indicadores.
 */
export function atualizarDashboard() {
  const { sessoes, concluidas, nota } = resumo();
  const nomes = obterNomes();

  // Elementos do painel de nota.
  const score = document.querySelector('#dashboard-score');
  const status = document.querySelector('#dashboard-status');
  const unit = document.querySelector('#dashboard-unit');
  const texto = document.querySelector('#dashboard-message');

  // Nota: sem sessões registradas, mostra "—". Com as 4 sessões é a nota final; senão, parcial.
  if (nota == null) {
    score.textContent = '—';
    unit.textContent = '';
    status.textContent = 'JOGUE PARA LIBERAR';
    texto.textContent = 'Jogue uma sessão para liberar o seu desempenho.';
  } else {
    score.textContent = formatar(nota);
    unit.textContent = '%';
    status.textContent = concluidas.length === 4 ? 'NOTA FINAL' : `PARCIAL — ${concluidas.length} DE 4 SESSÕES`;
    texto.textContent = mensagem(nota);
  }

  // Uma linha por sessão, com barra de progresso. Sessão sem registro aparece como pendente.
  const linhas = Object.keys(nomes).map(nome => {
    const sessao = sessoes[nome];
    const valor = sessao?.percentual ?? 0;

    return `<a class="dashboard-row${sessao ? '' : ' is-pending'}" href="${destinos[nome]}"><span>${nomes[nome]}</span><div class="progress-track"><i style="width:${valor}%"></i></div><b>${sessao ? `${formatar(valor)}%` : 'Não jogada'}</b></a>`;
  }).join('');

  document.querySelector('#dashboard-progress').innerHTML = linhas;

  // Indicadores: acertos (por sessão, o primeiro campo disponível entre alvos, corretos, acertos
  // e totalCliques), erros, melhor tempo de reação e a sessão com maior percentual.
  const acertos = Object.values(sessoes).reduce((total, s) => total + (s.alvos ?? s.corretos ?? s.acertos ?? s.totalCliques ?? 0), 0);
  const erros = Object.values(sessoes).reduce((total, s) => total + (s.erros ?? 0), 0);
  const melhorReacao = sessoes.reacao?.melhorMs;
  const melhorSessao = concluidas.length ? Object.entries(sessoes).sort((a, b) => b[1].percentual - a[1].percentual)[0][0] : null;

  document.querySelector('#dashboard-kpis').innerHTML = `<article><span>ACERTOS TOTAIS</span><strong>${acertos}</strong></article><article><span>ERROS TOTAIS</span><strong>${erros}</strong></article><article><span>MELHOR TEMPO</span><strong>${melhorReacao ? `${Math.round(melhorReacao)}ms` : '—'}</strong></article><article><span>MELHOR SESSÃO</span><strong>${melhorSessao ? nomes[melhorSessao] : '—'}</strong></article>`;

  // Lista de progresso da Home: as mesmas sessões, em formato compacto.
  const homeList = document.querySelector('#home-progress');

  homeList.innerHTML = Object.keys(nomes).map(nome => {
    const valor = sessoes[nome]?.percentual ?? 0;

    return `<div class="home-progress-row"><span>${nomes[nome]}</span><div class="progress-track"><i style="width:${valor}%"></i></div><b>${sessoes[nome] ? `${formatar(valor)}%` : '—'}</b></div>`;
  }).join('');
  document.querySelector('#home-progress-label').textContent = `${concluidas.length} de 4`;
}

/**
 * Liga o botão "Reiniciar jornada": depois de confirmar, apaga só a chave do app
 * no localStorage e recarrega a página.
 */
export function iniciarReinicioJornada() {
  document.querySelector('#restart-journey').addEventListener('click', () => {
    if (confirm('Reiniciar toda a jornada? O progresso será apagado.')) {
      localStorage.removeItem(CHAVE);
      location.reload();
    }
  });
}
