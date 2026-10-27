import { percentualMemoria, salvarSessao } from './state.js';

export const niveisMemoria = [
  { titulo: 'Nível 1 · Frontend', cards: [{ nome: 'HTML', ano: 1991 }, { nome: 'CSS', ano: 1994 }, { nome: 'JavaScript', ano: 1995 }] },
  { titulo: 'Nível 2 · Back-end histórico', cards: [{ nome: 'C', ano: 1972 }, { nome: 'Python', ano: 1991 }, { nome: 'Java', ano: 1995 }] }
];

export function ordenarPorCriacao(cards) {
  return [...cards].sort((a, b) => a.ano - b.ano || a.nome.localeCompare(b.nome, 'pt-BR'));
}

export function validarOrdemMemoria(ordemClicada, cards) {
  return ordemClicada.every((item, indice) => item === ordenarPorCriacao(cards)[indice]);
}

export function iniciarMemoria() {
  const ui = { cards: document.querySelector('#memory-cards'), level: document.querySelector('#memory-level'), correct: document.querySelector('#memory-correct'), errors: document.querySelector('#memory-errors'), message: document.querySelector('#memory-message'), start: document.querySelector('#memory-start'), next: document.querySelector('#memory-next') };
  let nivel = 0; let escolhas = []; let rodadasCorretas = 0; let erros = 0; let esperando = false; let timers = [];
  const limparTimers = () => { timers.forEach(clearTimeout); timers = []; };
  const atualizar = () => { ui.level.textContent = nivel < 2 ? `${nivel + 1} de 2` : '2 de 2'; ui.correct.textContent = rodadasCorretas; ui.errors.textContent = erros; };
  function renderizar(oculto = false) { const cards = ordenarPorCriacao(niveisMemoria[nivel].cards); ui.cards.replaceChildren(); cards.forEach((item, posicao) => { const card = document.createElement('button'); card.className = `memory-card${oculto ? ' is-concealed' : ''}`; card.type = 'button'; card.dataset.nome = item.nome; card.textContent = oculto ? '?' : item.nome; card.disabled = !esperando; card.setAttribute('aria-label', oculto ? `Opção ${posicao + 1}` : item.nome); card.addEventListener('click', () => escolha(item)); ui.cards.append(card); }); }
  function mostrarSequencia() { limparTimers(); esperando = false; renderizar(); ui.message.textContent = `${niveisMemoria[nivel].titulo}. Observe a sequência.`; ordenarPorCriacao(niveisMemoria[nivel].cards).forEach((item, i) => { timers.push(setTimeout(() => { [...ui.cards.children].find(card => card.dataset.nome === item.nome)?.classList.add('is-lit'); setTimeout(() => [...ui.cards.children].find(card => card.dataset.nome === item.nome)?.classList.remove('is-lit'), 700); }, i * 1000)); }); timers.push(setTimeout(() => { esperando = true; escolhas = []; renderizar(true); ui.message.textContent = 'Agora é sua vez. Repita a ordem.'; }, niveisMemoria[nivel].cards.length * 1000 + 250)); }
  function finalizarRodada(acertou) { esperando = false; limparTimers(); if (acertou) { rodadasCorretas++; ui.message.textContent = nivel === 1 ? 'Correto. Você concluiu as duas rodadas.' : 'Correto, próxima rodada.'; atualizar(); renderizar(); ui.next.classList.remove('is-hidden'); ui.next.textContent = 'Prosseguir'; return; } erros++; ui.message.textContent = 'Sequência incorreta. O erro foi registrado; observe e tente novamente.'; atualizar(); renderizar(); timers.push(setTimeout(mostrarSequencia, 900)); }
  function escolha(item) { if (!esperando) return; const tentativa = [...escolhas, item]; if (!validarOrdemMemoria(tentativa, niveisMemoria[nivel].cards)) { finalizarRodada(false); return; } escolhas = tentativa; [...ui.cards.children].find(card => card.dataset.nome === item.nome)?.classList.add('is-chosen'); if (escolhas.length === niveisMemoria[nivel].cards.length) finalizarRodada(true); }
  function proximo() { if (nivel === 0) { nivel = 1; ui.next.classList.add('is-hidden'); atualizar(); mostrarSequencia(); } else { salvarSessao('memoria', { percentual: percentualMemoria(rodadasCorretas), rodadasCorretas, nivelMaximo: 2, acertos: rodadasCorretas, erros }); location.hash = '#reacao'; } }
  function comecar() { limparTimers(); nivel = 0; escolhas = []; rodadasCorretas = 0; erros = 0; ui.start.disabled = true; ui.next.classList.add('is-hidden'); atualizar(); mostrarSequencia(); }
  ui.start.addEventListener('click', comecar); ui.next.addEventListener('click', proximo); atualizar();
}
