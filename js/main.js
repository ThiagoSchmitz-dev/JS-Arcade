/**
 * main.js
 *
 * Ponto de entrada da JS Arcade. Importa as sessões e o dashboard, liga cada
 * uma quando a página termina de carregar e ativa a navegação do menu.
 */


import { iniciarPomodoro } from './pomodoro.js'; // Iniciar o Pomodoro
import { iniciarKanban } from './kanban.js'; // Iniciar a Kanban
import { iniciarMemoria } from './memoria.js'; // Iniciar a Memória
import { iniciarReacao } from './reacao.js'; // Iniciar a Reação
import { atualizarDashboard, iniciarReinicioJornada } from './dashboard.js'; // Ver Dashboard

/**
 * Destaca no menu o link da seção visível na tela.
 * Usa IntersectionObserver com uma faixa estreita de observação (10% da altura
 * da tela, a partir de 35% do topo). Quando seções cruzam essa faixa, ativa a
 * que tem maior proporção visível.
 */
function ativarNavegacao() {
  const links = [...document.querySelectorAll('.nav-link')];
  const secoes = links.map(link => document.querySelector(link.hash));
  const observador = new IntersectionObserver(entries => {
    const ativa = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!ativa) return;

    links.forEach(link => link.classList.toggle('is-active', link.hash === `#${ativa.target.id}`));
  }, {
    rootMargin: '-35% 0px -55% 0px',
    threshold: [0, .2, .6]
  });

  secoes.forEach(secao => observador.observe(secao));
}

// Quando a página termina de carregar: liga as 4 sessões, o botão de reiniciar a jornada,
// o dashboard e a navegação. O dashboard é redesenhado a cada 'progressoatualizado' (disparado por state.js).
document.addEventListener('DOMContentLoaded', () => {
  iniciarPomodoro();
  iniciarKanban();
  iniciarMemoria();
  iniciarReacao();
  iniciarReinicioJornada();
  atualizarDashboard();
  ativarNavegacao();
  document.addEventListener('progressoatualizado', atualizarDashboard);
});