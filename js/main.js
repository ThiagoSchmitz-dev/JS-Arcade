alert('Para recomeçar o jogo, atualize a pagina') //Caixa de texto de alerta. . .
import { iniciarPomodoro } from './pomodoro.js'; // Iniciar o Pomodoro
import { iniciarKanban } from './kanban.js'; // Iniciar a Kanban
import { iniciarMemoria } from './memoria.js'; // Iniciar a Memória
import { iniciarReacao } from './reacao.js'; // Iniciar a Reação
import { atualizarDashboard, iniciarReinicioJornada } from './dashboard.js'; // Ver Dashboard

function ativarNavegacao() {
  const links = [...document.querySelectorAll('.nav-link')]; const secoes = links.map(link => document.querySelector(link.hash));
  const observador = new IntersectionObserver(entries => { const ativa = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]; if (!ativa) return; links.forEach(link => link.classList.toggle('is-active', link.hash === `#${ativa.target.id}`)); }, { rootMargin: '-35% 0px -55% 0px', threshold: [0, .2, .6] }); secoes.forEach(secao => observador.observe(secao));
}

document.addEventListener('DOMContentLoaded', () => { iniciarPomodoro(); iniciarKanban(); iniciarMemoria(); iniciarReacao(); iniciarReinicioJornada(); atualizarDashboard(); ativarNavegacao(); document.addEventListener('progressoatualizado', atualizarDashboard); });
