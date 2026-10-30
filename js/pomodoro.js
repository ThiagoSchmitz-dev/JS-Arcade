/**
 * pomodoro.js
 *
 * Sessão Pomodoro: 3 rounds de foco de 20 s, com pausa curta de 10 s entre eles.
 * Durante o foco, um alvo aparece em posição aleatória e cada clique conta um
 * ponto (36 alvos = 100%, ver percentualPomodoro em state.js).
 *
 * Depende de state.js. Os elementos da tela (#pomodoro-*) estão no index.html.
 */

import { percentualPomodoro, salvarSessao } from './state.js';

/** Liga a sessão Pomodoro: busca os elementos da tela e controla fases, alvos e resultado. */
export function iniciarPomodoro() {
  // Elementos da tela.
  const ui = {
    board: document.querySelector('#pomodoro-board'),
    phase: document.querySelector('#pomodoro-phase'),
    time: document.querySelector('#pomodoro-time'),
    round: document.querySelector('#pomodoro-round'),
    targets: document.querySelector('#pomodoro-targets'),
    message: document.querySelector('#pomodoro-message'),
    start: document.querySelector('#pomodoro-start'),
    skip: document.querySelector('#pomodoro-skip'),
    stop: document.querySelector('#pomodoro-stop'),
    next: document.querySelector('#pomodoro-next')
  };

  // intervalo: id do setInterval da fase atual | fase: 'pronto', 'foco', 'pausa' ou 'fim'
  // round: round atual (1 a 3) | alvos: alvos clicados | concluidos: rounds de foco concluídos até o fim
  // restante: segundos que faltam na fase atual
  let intervalo;
  let fase = 'pronto';
  let round = 0;
  let alvos = 0;
  let concluidos = 0;
  let restante = 20;

  /** Para o cronômetro e limpa a área dos alvos. */
  const limpar = () => {
    clearInterval(intervalo);
    intervalo = null;
    ui.board.replaceChildren();
  };

  /** Atualiza fase, tempo restante, round e contador de alvos na tela. */
  const atualizar = () => {
    ui.phase.textContent = fase === 'foco' ? 'Foco' : fase === 'pausa' ? 'Pausa' : fase === 'fim' ? 'Finalizado' : 'Pronto';
    ui.time.textContent = `${restante}s`;
    ui.round.textContent = `${round} de 3`;
    ui.targets.textContent = `${alvos} / 36`;
  };

  /** Mostra um alvo em posição aleatória (só na fase de foco). Cada clique soma um alvo e gera o próximo. */
  function alvo() {
    ui.board.replaceChildren();
    if (fase !== 'foco') return;

    const botao = document.createElement('button');

    botao.className = 'focus-target';
    botao.type = 'button';
    botao.setAttribute('aria-label', 'Alvo de foco');
    botao.style.left = `${8 + Math.random() * 80}%`;
    botao.style.top = `${10 + Math.random() * 68}%`;
    botao.addEventListener('click', () => {
      alvos += 1;
      atualizar();
      alvo();
    });
    ui.board.append(botao);
  }

  /** Encerra a sessão: para tudo, mostra a mensagem, trava os botões e salva o resultado. */
  function encerrar(mensagem) {
    limpar();
    fase = 'fim';
    restante = 0;
    atualizar();
    ui.message.textContent = mensagem;
    ui.start.disabled = true;
    ui.skip.disabled = true;
    ui.stop.disabled = true;
    ui.next.classList.remove('is-hidden');
    salvarSessao('pomodoro', {
      percentual: percentualPomodoro(alvos),
      alvos,
      rounds: concluidos
    });
  }

  /** Pausa curta de 10 s entre rounds; ao zerar o tempo, começa o próximo round de foco. */
  function pausar() {
    fase = 'pausa';
    restante = 10;
    ui.message.textContent = 'Foco concluído. Pausa curta liberada.';
    ui.skip.disabled = false;
    atualizar();
    intervalo = setInterval(() => {
      restante -= 1;
      atualizar();

      if (restante <= 0) {
        clearInterval(intervalo);
        iniciarFoco();
      }
    }, 1000);
  }

  /**
   * Começa o próximo round de foco (20 s). Ao zerar o tempo, conta o round como
   * concluído e segue para a pausa ou, no round 3, encerra a sessão.
   */
  function iniciarFoco() {
    clearInterval(intervalo);
    round += 1;

    // Proteção: não passa de 3 rounds.
    if (round > 3) {
      encerrar('Você completou 3 de 3 rounds. Ótimo foco!');
      return;
    }

    fase = 'foco';
    restante = 20;
    ui.skip.disabled = true;
    ui.message.textContent = `Round ${round}: mantenha o foco até o fim.`;
    atualizar();
    alvo();
    intervalo = setInterval(() => {
      restante -= 1;
      atualizar();

      if (restante <= 0) {
        clearInterval(intervalo);
        concluidos += 1;
        ui.board.replaceChildren();
        round === 3 ? encerrar('Você completou 3 de 3 rounds. Ótimo foco!') : pausar();
      }
    }, 1000);
  }

  /** Botão de início: zera os contadores e começa o primeiro round. */
  function comecar() {
    limpar();
    fase = 'pronto';
    round = 0;
    alvos = 0;
    concluidos = 0;
    ui.start.disabled = true;
    ui.stop.disabled = false;
    ui.next.classList.add('is-hidden');
    iniciarFoco();
  }

  // Botões: iniciar; encerrar (registra os alvos clicados até ali); pular a pausa
  // (só vale durante a pausa); e seguir (limpa a área dos alvos).
  ui.start.addEventListener('click', comecar);
  ui.stop.addEventListener('click', () => encerrar('Sessão encerrada. Seus alvos clicados foram registrados.'));
  ui.skip.addEventListener('click', () => {
    if (fase === 'pausa') {
      ui.message.textContent = 'Pausa pulada e registrada. Novo round iniciado.';
      iniciarFoco();
    }
  });
  ui.next.addEventListener('click', limpar);

  // Estado inicial da tela.
  atualizar();
}