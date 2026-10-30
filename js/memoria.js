/**
 * memoria.js
 *
 * Sessão JS Memória, em 2 níveis. As luzes acendem nos cards em sequência e o
 * jogador repete a ordem. A ordem correta vem dos dados: ano de criação crescente,
 * com desempate alfabético. Ela nunca é embaralhada.
 *
 * Depende de state.js. Os elementos da tela (#memory-*) estão no index.html.
 */

import { percentualMemoria, salvarSessao } from './state.js';

/** Níveis do jogo. Cada card tem o ano de criação, usado para definir a ordem correta. */
export const niveisMemoria = [
  {
    titulo: 'Nível 1 · Frontend',
    cards: [
      { nome: 'HTML', ano: 1991 },
      { nome: 'CSS', ano: 1994 },
      { nome: 'JavaScript', ano: 1995 }
    ]
  },
  {
    titulo: 'Nível 2 · Back-end histórico',
    cards: [
      { nome: 'C', ano: 1972 },
      { nome: 'Python', ano: 1991 },
      { nome: 'Java', ano: 1995 }
    ]
  }
];

/**
 * Devolve uma cópia dos cards na ordem correta: ano de criação crescente
 * e, em caso de empate, ordem alfabética pelo nome. Não altera o array original.
 */
export function ordenarPorCriacao(cards) {
  return [...cards].sort((a, b) => a.ano - b.ano || a.nome.localeCompare(b.nome, 'pt-BR'));
}

/**
 * Confere se os cliques feitos até agora seguem a ordem correta.
 * Aceita sequência parcial: cada item clicado precisa estar na posição certa.
 * @param {Object[]} ordemClicada - cards clicados, na ordem do clique.
 * @param {Object[]} cards - cards do nível.
 * @returns {boolean}
 */
export function validarOrdemMemoria(ordemClicada, cards) {
  return ordemClicada.every((item, indice) => item === ordenarPorCriacao(cards)[indice]);
}

/** Liga a sessão JS Memória: busca os elementos da tela e controla níveis, sequência e resultado. */
export function iniciarMemoria() {
  // Elementos da tela.
  const ui = {
    cards: document.querySelector('#memory-cards'),
    level: document.querySelector('#memory-level'),
    correct: document.querySelector('#memory-correct'),
    errors: document.querySelector('#memory-errors'),
    message: document.querySelector('#memory-message'),
    start: document.querySelector('#memory-start'),
    next: document.querySelector('#memory-next')
  };

  // nivel: índice do nível atual (0 ou 1) | escolhas: cards clicados na tentativa atual
  // rodadasCorretas e erros: contadores da sessão | esperando: true quando é a vez do jogador
  // timers: timeouts pendentes da sequência
  let nivel = 0;
  let escolhas = [];
  let rodadasCorretas = 0;
  let erros = 0;
  let esperando = false;
  let timers = [];

  /** Cancela os timeouts pendentes da sequência. */
  const limparTimers = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };

  /** Atualiza nível, rodadas corretas e erros na tela. */
  const atualizar = () => {
    ui.level.textContent = nivel < 2 ? `${nivel + 1} de 2` : '2 de 2';
    ui.correct.textContent = rodadasCorretas;
    ui.errors.textContent = erros;
  };

  /**
   * Desenha os cards na área do jogo. Com `oculto`, mostra "?" no lugar do nome.
   * Os botões só ficam habilitados quando é a vez do jogador (esperando).
   */
  function renderizar(oculto = false) {
    const cards = ordenarPorCriacao(niveisMemoria[nivel].cards);

    ui.cards.replaceChildren();
    cards.forEach((item, posicao) => {
      const card = document.createElement('button');

      card.className = `memory-card${oculto ? ' is-concealed' : ''}`;
      card.type = 'button';
      card.dataset.nome = item.nome;
      card.textContent = oculto ? '?' : item.nome;
      card.disabled = !esperando;
      card.setAttribute('aria-label', oculto ? `Opção ${posicao + 1}` : item.nome);
      card.addEventListener('click', () => escolha(item));
      ui.cards.append(card);
    });
  }

  /**
   * Mostra a sequência do nível: acende um card por segundo, na ordem correta
   * (cada luz dura 700 ms). Depois (cards × 1 s + 250 ms), libera os cliques
   * e esconde os nomes.
   */
  function mostrarSequencia() {
    limparTimers();
    esperando = false;
    renderizar();
    ui.message.textContent = `${niveisMemoria[nivel].titulo}. Observe a sequência.`;
    ordenarPorCriacao(niveisMemoria[nivel].cards).forEach((item, i) => {
      timers.push(setTimeout(() => {
        [...ui.cards.children].find(card => card.dataset.nome === item.nome)?.classList.add('is-lit');
        setTimeout(() => [...ui.cards.children].find(card => card.dataset.nome === item.nome)?.classList.remove('is-lit'), 700);
      }, i * 1000));
    });
    timers.push(setTimeout(() => {
      esperando = true;
      escolhas = [];
      renderizar(true);
      ui.message.textContent = 'Agora é sua vez. Repita a ordem.';
    }, niveisMemoria[nivel].cards.length * 1000 + 250));
  }

  /**
   * Fecha a rodada. Se acertou, conta a rodada e libera o botão "Prosseguir".
   * Se errou, registra o erro e mostra a sequência de novo depois de 900 ms.
   */
  function finalizarRodada(acertou) {
    esperando = false;
    limparTimers();

    if (acertou) {
      rodadasCorretas++;
      ui.message.textContent = nivel === 1 ? 'Correto. Você concluiu as duas rodadas.' : 'Correto, próxima rodada.';
      atualizar();
      renderizar();
      ui.next.classList.remove('is-hidden');
      ui.next.textContent = 'Prosseguir';
      return;
    }

    erros++;
    ui.message.textContent = 'Sequência incorreta. O erro foi registrado; observe e tente novamente.';
    atualizar();
    renderizar();
    timers.push(setTimeout(mostrarSequencia, 900));
  }

  /** Trata o clique em um card: só vale na vez do jogador e só se a ordem até aqui estiver correta. */
  function escolha(item) {
    if (!esperando) return;

    const tentativa = [...escolhas, item];

    if (!validarOrdemMemoria(tentativa, niveisMemoria[nivel].cards)) {
      finalizarRodada(false);
      return;
    }

    escolhas = tentativa;
    [...ui.cards.children].find(card => card.dataset.nome === item.nome)?.classList.add('is-chosen');
    if (escolhas.length === niveisMemoria[nivel].cards.length) finalizarRodada(true);
  }

  /**
   * Botão "Prosseguir": no nível 1, passa para o nível 2.
   * No nível 2, salva a sessão e segue para a Reação.
   */
  function proximo() {
    if (nivel === 0) {
      nivel = 1;
      ui.next.classList.add('is-hidden');
      atualizar();
      mostrarSequencia();
    } else {
      salvarSessao('memoria', {
        percentual: percentualMemoria(rodadasCorretas),
        rodadasCorretas,
        nivelMaximo: 2,
        acertos: rodadasCorretas,
        erros
      });
      location.hash = '#reacao';
    }
  }

  /** Botão de início: zera os contadores e mostra a sequência do nível 1. */
  function comecar() {
    limparTimers();
    nivel = 0;
    escolhas = [];
    rodadasCorretas = 0;
    erros = 0;
    ui.start.disabled = true;
    ui.next.classList.add('is-hidden');
    atualizar();
    mostrarSequencia();
  }

  // Botões de início e de prosseguir.
  ui.start.addEventListener('click', comecar);
  ui.next.addEventListener('click', proximo);

  // Estado inicial da tela.
  atualizar();
}