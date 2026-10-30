/**
 * kanban.js
 *
 * Sessão Kanban: o jogador classifica 6 tecnologias em duas colunas (frontend e
 * backend), arrastando os cards ou selecionando o card e depois a coluna.
 * O percentual é o de acertos (ver percentualKanban em state.js). Os erros são
 * registrados, sem penalidade extra, e a sessão mede o tempo gasto.
 *
 * Depende de state.js. Os elementos da tela (#kanban-*) estão no index.html.
 */

import { obterEstado, percentualKanban, salvarSessao } from './state.js';

/** Liga a sessão Kanban: busca os elementos da tela e controla cards, colunas, tempo e resultado. */
export function iniciarKanban() {
  // Os 6 cards do jogo e a camada (coluna) correta de cada um.
  const itens = [
    { nome: 'HTML', camada: 'frontend' },
    { nome: 'CSS', camada: 'frontend' },
    { nome: 'JavaScript', camada: 'frontend' },
    { nome: 'C#', camada: 'backend' },
    { nome: 'Python', camada: 'backend' },
    { nome: 'Java', camada: 'backend' }
  ];

  // Elementos da tela: origem dos cards, colunas, placar e botões.
  const ui = {
    source: document.querySelector('#kanban-source'),
    front: document.querySelector('#kanban-front'),
    back: document.querySelector('#kanban-back'),
    correct: document.querySelector('#kanban-correct'),
    errors: document.querySelector('#kanban-errors'),
    time: document.querySelector('#kanban-time'),
    message: document.querySelector('#kanban-message'),
    start: document.querySelector('#kanban-start'),
    next: document.querySelector('#kanban-next')
  };

  // selecionado: card escolhido por clique ou arrasto | corretos e erros: placar
  // inicio: instante em que a rodada começou (Date.now) | intervalo: id do timer que atualiza o tempo
  // concluida: sessão já concluída (lida do estado salvo)
  let selecionado = null;
  let corretos = 0;
  let erros = 0;
  let inicio = 0;
  let intervalo;
  let concluida = Boolean(obterEstado().sessoes.kanban?.concluida);

  /** Converte milissegundos em "mm:ss". */
  const formatoTempo = ms => `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, '0')}`;

  /** Atualiza o placar e, se a rodada já começou, o tempo decorrido. */
  const atualizar = () => {
    ui.correct.textContent = `${corretos} / 6`;
    ui.errors.textContent = erros;
    if (inicio) ui.time.textContent = formatoTempo(Date.now() - inicio);
  };

  /**
   * Solta um card em uma coluna. O card vem da seleção ou do arrasto (dataTransfer);
   * é ignorado se não houver card ou se ele já foi colocado. Acerta quando a camada
   * do card é a da coluna. Ao classificar os 6 cards, encerra a rodada e salva a sessão.
   */
  function soltar(evento, coluna) {
    evento?.preventDefault();

    const card = selecionado || (evento?.dataTransfer && document.getElementById(evento.dataTransfer.getData('text/plain')));

    if (!card || card.dataset.placed) return;

    const correto = card.dataset.layer === coluna.dataset.layer;

    card.dataset.placed = 'true';
    card.draggable = false;
    card.classList.remove('is-selected');
    card.classList.add(correto ? 'is-correct' : 'is-wrong');
    correto ? corretos++ : erros++;
    coluna.append(card);
    selecionado = null;
    atualizar();

    if (corretos + erros === 6) {
      clearInterval(intervalo);
      concluida = true;
      ui.message.textContent = corretos === 6 ? 'Classificação perfeita.' : 'Classificação concluída. Seus erros foram registrados sem penalidade extra.';
      ui.next.classList.remove('is-hidden');
      ui.start.classList.add('is-hidden');
      salvarSessao('kanban', {
        percentual: percentualKanban(corretos),
        corretos,
        erros,
        tempoMs: Date.now() - inicio,
        concluida: true
      });
    }
  }

  /** Cria o botão de um card. Ele pode ser arrastado ou selecionado por clique (se ainda não foi colocado). */
  function criarCard(item, i) {
    const card = document.createElement('button');

    card.className = 'tech-card';
    card.type = 'button';
    card.id = `tech-${i}`;
    card.textContent = item.nome;
    card.dataset.layer = item.camada;
    card.draggable = true;
    card.addEventListener('dragstart', event => {
      selecionado = card;
      event.dataTransfer.setData('text/plain', card.id);
    });
    card.addEventListener('click', () => {
      if (card.dataset.placed) return;

      selecionado?.classList.remove('is-selected');
      selecionado = card;
      card.classList.add('is-selected');
      ui.message.textContent = `${item.nome} selecionado. Escolha uma coluna.`;
    });
    return card;
  }

  /** Começa uma rodada: zera o placar, limpa as colunas, embaralha os cards e liga o cronômetro. */
  function iniciar() {
    if (concluida) return;

    clearInterval(intervalo);
    selecionado = null;
    corretos = 0;
    erros = 0;
    inicio = Date.now();
    ui.source.replaceChildren();
    ui.front.querySelectorAll('.tech-card').forEach(card => card.remove());
    ui.back.querySelectorAll('.tech-card').forEach(card => card.remove());
    [...itens].sort(() => Math.random() - .5).map(criarCard).forEach(card => ui.source.append(card));
    ui.next.classList.add('is-hidden');
    ui.message.textContent = 'Arraste um card ou selecione-o e escolha uma coluna.';
    atualizar();
    intervalo = setInterval(atualizar, 500);
  }

  /**
   * Alinha a tela ao estado salvo: se a sessão está concluída, esconde "Iniciar",
   * para o tempo e mostra o botão para seguir.
   */
  function sincronizarConclusao() {
    concluida = Boolean(obterEstado().sessoes.kanban?.concluida);
    ui.start.classList.toggle('is-hidden', concluida);

    if (concluida) {
      clearInterval(intervalo);
      ui.next.classList.remove('is-hidden');
    }
  }

  /** Reinício da jornada: para o tempo, destrava a sessão e devolve o botão "Começar classificação". */
  function liberarJornada() {
    clearInterval(intervalo);
    concluida = false;
    selecionado = null;
    inicio = 0;
    ui.start.classList.remove('is-hidden');
    ui.start.textContent = 'Começar classificação';
    ui.next.classList.add('is-hidden');
  }

  // Colunas (front e back): aceitam soltar por arrasto, por clique no fundo, no título ou no
  // texto da coluna (com um card selecionado) e pelo teclado (Enter ou Espaço).
  [ui.front, ui.back].forEach(coluna => {
    coluna.addEventListener('dragover', event => event.preventDefault());
    coluna.addEventListener('drop', event => soltar(event, coluna));
    coluna.addEventListener('click', event => {
      if (event.target === coluna || event.target.tagName === 'H3' || event.target.tagName === 'P') soltar(null, coluna);
    });
    coluna.addEventListener('keydown', event => {
      if ((event.key === 'Enter' || event.key === ' ') && selecionado) {
        event.preventDefault();
        soltar(null, coluna);
      }
    });
  });

  // "Iniciar" começa a rodada. O evento 'progressoatualizado' (disparado por state.js)
  // libera a jornada quando o progresso é zerado e, nos demais casos, sincroniza com o estado salvo.
  ui.start.addEventListener('click', iniciar);
  document.addEventListener('progressoatualizado', evento => evento.detail?.acao === 'zerar' ? liberarJornada() : sincronizarConclusao());

  // Estado inicial da tela.
  sincronizarConclusao();
  atualizar();
}
