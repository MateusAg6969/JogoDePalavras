/**
 * PALAVRÓRIO NEXUS — SHOWROOM INTERATIVO DE TELAS CONCEITUAIS
 * Lógica de Navegação, Síntese Procedural de Áudio e Simulação Interativa
 */

// =============================================================================
// 1. MOTOR DE ÁUDIO PROCEDURAL (WEB AUDIO API - ZERO ARQUIVOS PESADOS)
// =============================================================================
class NexusAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    // Escala Pentatônica em Fá Maior (F4, G4, A4, C5, D5, F5, G5, A5)
    this.pentatonicScale = [349.23, 392.00, 440.00, 523.25, 587.33, 698.46, 783.99, 880.00];
    this.noteIndex = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }

  playAscendingNote() {
    const freq = this.pentatonicScale[this.noteIndex % this.pentatonicScale.length];
    this.playTone(freq, 'sine', 0.2, 0.12);
    this.noteIndex++;
  }

  resetNotes() {
    this.noteIndex = 0;
  }

  playSuccessChord() {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.35, 0.08), i * 60);
    });
  }

  playLaserClash() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch (e) {
      console.warn(e);
    }
  }

  playShuffleSound() {
    [300, 420, 360].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sine', 0.08, 0.05), i * 40);
    });
  }
}

const audio = new NexusAudioEngine();

// =============================================================================
// 2. SISTEMA DE NOTIFICAÇÕES (TOAST NOTIFY)
// =============================================================================
function showToast(message, icon = '✨') {
  const toast = document.getElementById('toast-notify');
  const msgEl = document.getElementById('toast-msg');
  const iconEl = document.getElementById('toast-icon');

  if (!toast || !msgEl || !iconEl) return;

  msgEl.textContent = message;
  iconEl.textContent = icon;
  toast.classList.add('show');

  if (window.toastTimeout) clearTimeout(window.toastTimeout);
  window.toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

// =============================================================================
// 3. NAVEGAÇÃO ENTRE TELAS CONCEITUAIS
// =============================================================================
const navTabs = document.querySelectorAll('.nav-tab');
const conceptScreens = document.querySelectorAll('.concept-screen');

navTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    audio.playTone(600, 'sine', 0.1, 0.05);

    // Atualiza Tabs
    navTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Troca de Tela
    const targetScreenId = tab.getAttribute('data-screen');
    conceptScreens.forEach(screen => {
      screen.classList.remove('active');
      if (screen.id === targetScreenId) {
        screen.classList.add('active');
      }
    });
  });
});

// =============================================================================
// 4. ALTERNADOR DE MODO DE EXIBIÇÃO (MOBILE FRAME VS EXPANDIDO)
// =============================================================================
const btnViewMobile = document.getElementById('btn-view-mobile');
const btnViewDesktop = document.getElementById('btn-view-desktop');
const viewportStage = document.getElementById('viewport-stage');

if (btnViewMobile && btnViewDesktop && viewportStage) {
  btnViewMobile.addEventListener('click', () => {
    audio.playTone(480, 'sine', 0.08, 0.04);
    btnViewMobile.classList.add('active');
    btnViewDesktop.classList.remove('active');
    viewportStage.classList.remove('mode-desktop');
    viewportStage.classList.add('mode-mobile');
    showToast('Visualização Mobile Ativada (390px)', '📱');
  });

  btnViewDesktop.addEventListener('click', () => {
    audio.playTone(540, 'sine', 0.08, 0.04);
    btnViewDesktop.classList.add('active');
    btnViewMobile.classList.remove('active');
    viewportStage.classList.remove('mode-mobile');
    viewportStage.classList.add('mode-desktop');
    showToast('Visualização Expandida Ativada', '🖥️');
  });
}

// Alternador de Som
const btnAudioToggle = document.getElementById('btn-audio-toggle');
const audioIcon = document.getElementById('audio-icon');

if (btnAudioToggle && audioIcon) {
  btnAudioToggle.addEventListener('click', () => {
    audio.enabled = !audio.enabled;
    if (audio.enabled) {
      audio.init();
      audioIcon.textContent = '🔊';
      audio.playTone(660, 'sine', 0.12, 0.08);
      showToast('Efeitos sonoros ativados', '🔊');
    } else {
      audioIcon.textContent = '🔇';
      showToast('Efeitos sonoros silenciados', '🔇');
    }
  });
}

// =============================================================================
// 5. INTERATIVIDADE DA TELA 01: NEXUS ARENA
// =============================================================================
const letterNodes = document.querySelectorAll('.letter-node');
const currentWordEl = document.getElementById('arena-current-word');
const btnArenaShuffle = document.getElementById('btn-arena-shuffle');
const btnArenaClear = document.getElementById('btn-arena-clear');
const btnArenaHint = document.getElementById('btn-arena-hint');
const wheelCore = document.getElementById('arena-wheel-core');

let selectedLetters = ['P', 'A', 'R', 'V', 'O'];

function updateWordPreview() {
  if (currentWordEl) {
    currentWordEl.textContent = selectedLetters.length > 0 ? selectedLetters.join('') : '...';
  }
}

letterNodes.forEach(node => {
  node.addEventListener('click', () => {
    const letter = node.getAttribute('data-letter');
    if (node.classList.contains('active')) {
      node.classList.remove('active');
      const idx = selectedLetters.lastIndexOf(letter);
      if (idx !== -1) selectedLetters.splice(idx, 1);
      audio.playTone(320, 'sine', 0.1, 0.05);
    } else {
      node.classList.add('active');
      selectedLetters.push(letter);
      audio.playAscendingNote();
    }
    updateWordPreview();
  });
});

if (btnArenaShuffle) {
  btnArenaShuffle.addEventListener('click', () => {
    audio.playShuffleSound();
    const wheel = document.querySelector('.wheel-outer-ring');
    if (wheel) {
      wheel.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      wheel.style.transform = `rotate(${Math.floor(Math.random() * 360 + 180)}deg)`;
      setTimeout(() => {
        wheel.style.transform = 'rotate(0deg)';
      }, 550);
    }
    showToast('Nós polares reordenados!', '🔀');
  });
}

if (btnArenaClear) {
  btnArenaClear.addEventListener('click', () => {
    selectedLetters = [];
    audio.resetNotes();
    audio.playTone(240, 'triangle', 0.1, 0.05);
    letterNodes.forEach(n => n.classList.remove('active'));
    updateWordPreview();
    showToast('Seleção limpa', '✖️');
  });
}

if (wheelCore) {
  wheelCore.addEventListener('click', () => {
    if (selectedLetters.length >= 3) {
      audio.playSuccessChord();
      const word = selectedLetters.join('');
      showToast(`Palavra "${word}" Validada! +450 Pontos`, '🌟');
      selectedLetters = [];
      audio.resetNotes();
      letterNodes.forEach(n => n.classList.remove('active'));
      updateWordPreview();
    } else {
      audio.playTone(180, 'sawtooth', 0.15, 0.08);
      showToast('Selecione ao menos 3 letras!', '⚠️');
    }
  });
}

if (btnArenaHint) {
  btnArenaHint.addEventListener('click', () => {
    audio.playTone(880, 'sine', 0.25, 0.08);
    showToast('Oráculo: Letra "V" revelada no tabuleiro!', '🔮');
  });
}

// =============================================================================
// 6. INTERATIVIDADE DA TELA 02: DUELO MENTAL 1V1 (PVP MULTIPLAYER)
// =============================================================================
const btnSimulateStrike = document.getElementById('btn-simulate-strike');
const clashFeedLog = document.getElementById('clash-feed-log');
const rivalEnergyBar = document.querySelector('.energy-bar.magenta');
const btnSpellFog = document.getElementById('btn-spell-fog');
const btnSpellShock = document.getElementById('btn-spell-shock');
const btnSpellOracle = document.getElementById('btn-spell-oracle');

let rivalHP = 85;

if (btnSimulateStrike) {
  btnSimulateStrike.addEventListener('click', () => {
    audio.playLaserClash();

    // Reduz HP do Rival
    rivalHP = Math.max(10, rivalHP - 25);
    if (rivalEnergyBar) {
      rivalEnergyBar.style.width = `${rivalHP}%`;
    }
    const rivalHPText = document.querySelector('.player-remote .energy-num');
    if (rivalHPText) {
      rivalHPText.textContent = `${rivalHP}/100 HP`;
    }

    // Efeito visual no míssil e impacto
    const impactSpark = document.querySelector('.impact-spark');
    if (impactSpark) {
      impactSpark.style.transform = 'scale(1.8)';
      setTimeout(() => { impactSpark.style.transform = 'scale(1)'; }, 300);
    }

    // Adiciona log ao feed
    if (clashFeedLog) {
      const newEntry = document.createElement('div');
      newEntry.className = 'feed-item blue-text';
      newEntry.textContent = `💥 Você disparou "ASTEROIDE" (-25 HP em Ryuuji)!`;
      clashFeedLog.prepend(newEntry);
    }

    showToast('Ataque Léxico Crítico! -25 HP no Rival', '⚔️');
  });
}

// Spells
if (btnSpellFog) {
  btnSpellFog.addEventListener('click', () => {
    audio.playTone(340, 'triangle', 0.2, 0.07);
    showToast('Névoa ativada: Roda de Ryuuji obscurecida por 4s!', '🌫️');
  });
}

if (btnSpellShock) {
  btnSpellShock.addEventListener('click', () => {
    audio.playTone(720, 'sawtooth', 0.15, 0.08);
    showToast('Onda de Choque: Roda rival embaralhada!', '⚡');
  });
}

if (btnSpellOracle) {
  btnSpellOracle.addEventListener('click', () => {
    audio.playTone(920, 'sine', 0.25, 0.08);
    showToast('Oráculo: Maior palavra disponível revelada!', '👁️');
  });
}

// =============================================================================
// 7. INTERATIVIDADE DA TELA 03: NEURO-HUB (CONSTELAÇÃO & RADAR)
// =============================================================================
const starNodes = document.querySelectorAll('.star-node');

starNodes.forEach(star => {
  star.addEventListener('click', () => {
    const starName = star.querySelector('.star-name')?.textContent || 'Raiz';
    audio.playTone(660, 'sine', 0.18, 0.06);
    showToast(`Raiz ${starName}: Dominada em 100% dos desafios!`, '✦');
  });
});

// =============================================================================
// 8. INTERATIVIDADE DA TELA 04: PRD MASTER (AÇÕES)
// =============================================================================
const btnCopyPrdPath = document.getElementById('btn-copy-prd-path');

if (btnCopyPrdPath) {
  btnCopyPrdPath.addEventListener('click', () => {
    const pathText = 'docs/plans/2026-10-20-planejamento-estrategico-nexus-edition.md';
    navigator.clipboard.writeText(pathText).then(() => {
      audio.playTone(750, 'sine', 0.12, 0.07);
      showToast('Caminho do PRD copiado para a área de transferência!', '📋');
    }).catch(() => {
      showToast('Caminho: ' + pathText, '📋');
    });
  });
}

console.log('⚡ Palavrório Nexus — Suíte Conceitual Carregada com Sucesso.');
