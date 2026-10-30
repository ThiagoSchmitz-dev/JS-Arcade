/**
 * reacao.js
 *
 * Sessão Reação: 10 alvos aparecem em posição e momento aleatórios e o jogador
 * clica em cada um o mais rápido possível. A média dos tempos vira o percentual
 * da sessão (ver percentualReacao em state.js).
 *
 * Depende de state.js. Os elementos da tela (#reaction-*) estão no index.html.
 */

import { obterEstado, percentualReacao, salvarSessao } from './state.js';

/** Liga a sessão Reação: busca os elementos da tela, controla a rodada e salva o resultado. */
export function iniciarReacao() {
  // Elementos da tela.
  const ui = {
    board: document.querySelector('#reaction-board'),
    count: document.querySelector('#reaction-count'),
    last: document.querySelector('#reaction-last'),
    best: document.querySelector('#reaction-best'),
    average: document.querySelector('#reaction-average'),
    message: document.querySelector('#reaction-message'),
    start: document.querySelector('#reaction-start'),
    next: document.querySelector('#reaction-next')
  };

  // tempos: reações da rodada, em ms | ativo: alvo na tela esperando o clique
  // inicio: instante em que o alvo apareceu | atraso: id do timeout que mostra o próximo alvo
  // concluida: sessão já concluída (lida do estado salvo)
  let tempos = [];
  let ativo = false;
  let inicio = 0;
  let atraso;
  let concluida = Boolean(obterEstado().sessoes.reacao?.concluida);

  /** Formata um tempo em ms arredondado; sem valor, mostra '—'. */
  const ms = valor => valor == null ? '—' : `${Math.round(valor)}ms`;

  /** Atualiza os contadores da tela: quantidade, último, melhor e média. */
  function atualizar() {
    const media = tempos.length ? tempos.reduce((a, b) => a + b, 0) / tempos.length : null;

    ui.count.textContent = `${tempos.length} de 10`;
    ui.last.textContent = ms(tempos.at(-1));
    ui.best.textContent = ms(tempos.length ? Math.min(...tempos) : null);
    ui.average.textContent = ms(media);
  }

  /**
   * Avança a rodada. Com 10 tempos registrados, conclui e salva a sessão.
   * Senão, mostra "Prepare-se…" e, depois de um atraso aleatório (450 a 1350 ms),
   * exibe o próximo alvo em posição aleatória.
   */
  function proximoAlvo() {
    ui.board.replaceChildren();
    ativo = false;

    if (tempos.length === 10) {
      const mediaMs = tempos.reduce((a, b) => a + b, 0) / 10;

      concluida = true;
      ui.message.textContent = `Rodada concluída. Média final: ${Math.round(mediaMs)}ms.`;
      ui.next.classList.remove('is-hidden');
      ui.start.classList.add('is-hidden');
      salvarSessao('reacao', {
        percentual: percentualReacao(mediaMs),
        mediaMs: Math.round(mediaMs),
        melhorMs: Math.min(...tempos),
        piorMs: Math.max(...tempos),
        totalCliques: tempos.length,
        concluida: true
      });
      return;
    }

    ui.message.textContent = 'Prepare-se…';
    atraso = setTimeout(() => {
      const alvo = document.createElement('button');

      alvo.className = 'reaction-target';
      alvo.type = 'button';
      alvo.setAttribute('aria-label', 'Alvo de reação');
      alvo.style.left = `${7 + Math.random() * 82}%`;
      alvo.style.top = `${10 + Math.random() * 68}%`;

      // O tempo é medido do momento em que o alvo aparece até o clique.
      alvo.addEventListener('click', () => {
        if (!ativo) return;

        tempos.push(performance.now() - inicio);
        atualizar();
        proximoAlvo();
      });
      ui.board.append(alvo);
      inicio = performance.now();
      ativo = true;
      ui.message.textContent = 'Clique no alvo!';
    }, 450 + Math.random() * 900);
  }

  /** Começa uma nova rodada. Não faz nada se a sessão já foi concluída. */
  function iniciar() {
    if (concluida) return;

    clearTimeout(atraso);
    tempos = [];
    ativo = false;
    ui.start.disabled = true;
    ui.next.classList.add('is-hidden');
    atualizar();
    proximoAlvo();
  }

  /**
   * Alinha a tela ao estado salvo: se a sessão está concluída, esconde "Iniciar",
   * limpa o alvo e mostra o botão para seguir.
   */
  function sincronizarConclusao() {
    concluida = Boolean(obterEstado().sessoes.reacao?.concluida);
    ui.start.classList.toggle('is-hidden', concluida);

    if (concluida) {
      clearTimeout(atraso);
      ativo = false;
      ui.board.replaceChildren();
      ui.next.classList.remove('is-hidden');
    }
  }

  /** Reinício da jornada: zera a rodada e devolve o botão "Iniciar". */
  function liberarJornada() {
    clearTimeout(atraso);
    tempos = [];
    ativo = false;
    concluida = false;
    ui.board.replaceChildren();
    ui.start.disabled = false;
    ui.start.classList.remove('is-hidden');
    ui.next.classList.add('is-hidden');
    atualizar();
  }

  // "Iniciar" começa a rodada. O evento 'progressoatualizado' (disparado por state.js)
  // libera a jornada quando o progresso é zerado e, nos demais casos, sincroniza com o estado salvo.
  ui.start.addEventListener('click', iniciar);
  document.addEventListener('progressoatualizado', evento => evento.detail?.acao === 'zerar' ? liberarJornada() : sincronizarConclusao());

  // Estado inicial da tela.
  sincronizarConclusao();
  atualizar();
}