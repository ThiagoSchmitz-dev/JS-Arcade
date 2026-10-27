import { percentualPomodoro, salvarSessao } from './state.js';

export function iniciarPomodoro() {
  const ui = {
    board: document.querySelector('#pomodoro-board'), phase: document.querySelector('#pomodoro-phase'), time: document.querySelector('#pomodoro-time'),
    round: document.querySelector('#pomodoro-round'), targets: document.querySelector('#pomodoro-targets'), message: document.querySelector('#pomodoro-message'),
    start: document.querySelector('#pomodoro-start'), skip: document.querySelector('#pomodoro-skip'), stop: document.querySelector('#pomodoro-stop'), next: document.querySelector('#pomodoro-next')
  };
  let intervalo; let fase = 'pronto'; let round = 0; let alvos = 0; let concluidos = 0; let restante = 20;
  const limpar = () => { clearInterval(intervalo); intervalo = null; ui.board.replaceChildren(); };
  const atualizar = () => { ui.phase.textContent = fase === 'foco' ? 'Foco' : fase === 'pausa' ? 'Pausa' : fase === 'fim' ? 'Finalizado' : 'Pronto'; ui.time.textContent = `${restante}s`; ui.round.textContent = `${round} de 3`; ui.targets.textContent = `${alvos} / 36`; };
  function alvo() {
    ui.board.replaceChildren();
    if (fase !== 'foco') return;
    const botao = document.createElement('button'); botao.className = 'focus-target'; botao.type = 'button'; botao.setAttribute('aria-label', 'Alvo de foco');
    botao.style.left = `${8 + Math.random() * 80}%`; botao.style.top = `${10 + Math.random() * 68}%`;
    botao.addEventListener('click', () => { alvos += 1; atualizar(); alvo(); }); ui.board.append(botao);
  }
  function encerrar(mensagem) {
    limpar(); fase = 'fim'; restante = 0; atualizar(); ui.message.textContent = mensagem;
    ui.start.disabled = true; ui.skip.disabled = true; ui.stop.disabled = true; ui.next.classList.remove('is-hidden');
    salvarSessao('pomodoro', { percentual: percentualPomodoro(alvos), alvos, rounds: concluidos });
  }
  function pausar() {
    fase = 'pausa'; restante = 10; ui.message.textContent = 'Foco concluído. Pausa curta liberada.'; ui.skip.disabled = false; atualizar();
    intervalo = setInterval(() => { restante -= 1; atualizar(); if (restante <= 0) { clearInterval(intervalo); iniciarFoco(); } }, 1000);
  }
  function iniciarFoco() {
    clearInterval(intervalo); round += 1;
    if (round > 3) { encerrar('Você completou 3 de 3 rounds. Ótimo foco!'); return; }
    fase = 'foco'; restante = 20; ui.skip.disabled = true; ui.message.textContent = `Round ${round}: mantenha o foco até o fim.`; atualizar(); alvo();
    intervalo = setInterval(() => { restante -= 1; atualizar(); if (restante <= 0) { clearInterval(intervalo); concluidos += 1; ui.board.replaceChildren(); round === 3 ? encerrar('Você completou 3 de 3 rounds. Ótimo foco!') : pausar(); } }, 1000);
  }
  function comecar() { limpar(); fase = 'pronto'; round = 0; alvos = 0; concluidos = 0; ui.start.disabled = true; ui.stop.disabled = false; ui.next.classList.add('is-hidden'); iniciarFoco(); }
  ui.start.addEventListener('click', comecar); ui.stop.addEventListener('click', () => encerrar('Sessão encerrada. Seus alvos clicados foram registrados.'));
  ui.skip.addEventListener('click', () => { if (fase === 'pausa') { ui.message.textContent = 'Pausa pulada e registrada. Novo round iniciado.'; iniciarFoco(); } });
  ui.next.addEventListener('click', limpar); atualizar();
}
