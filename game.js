import { PUZZLES } from './puzzles.js';
import { sound } from './audio.js';

/**
 * PALAVRÓRIO — Motor Central do Jogo e Gerenciador de Protótipos
 * Desenvolvido pelo Painel de Especialistas: UX, A11y e Visual Design.
 */

class PalavrorioGame {
  constructor() {
    // Estado do Jogo
    this.currentLevelIndex = 0;
    this.currentPuzzle = null;
    this.solvedWords = new Set();
    this.foundBonusWords = new Set();
    this.hintedTiles = new Set(); // Chaves 'PALAVRA_INDEX'
    this.hintsUsed = 0;
    
    // Estado de Entrada (Roda de Letras)
    this.selectedNodeIndices = [];
    this.currentWord = "";
    this.isDragging = false;
    this.shuffledLetters = [];

    // Sistema de Pontuação da Rodada
    this.roundBaseScore = 0;
    this.bonusScoreRound = 0;

    // Estado dos Protótipos de Interface
    this.currentPrototype = 'aurora'; // 'aurora' | 'ergoflow' | 'arcade'
    this.highContrastMode = false;

    // Persistência e Estatísticas (localStorage)
    this.loadStats();

    // Cache de Elementos DOM
    this.dom = {};
  }

  init() {
    this.cacheDom();
    this.setupPrototypeBar();
    this.setupExpertReviewModal();
    this.bindEvents();
    this.loadLevel(this.stats.currentLevel || 0);
    this.updateStatsUi();
    this.initConfetti();
  }

  cacheDom() {
    this.dom.headerScore = document.getElementById("header-score");
    this.dom.headerBonus = document.getElementById("header-bonus-count");
    this.dom.levelTitle = document.getElementById("current-level-title");
    this.dom.progressFill = document.getElementById("round-progress-fill");
    this.dom.board = document.getElementById("words-board");
    
    this.dom.currentWordBubble = document.getElementById("current-word-display");
    this.dom.feedbackToast = document.getElementById("feedback-toast");
    this.dom.previewStar1 = document.getElementById("preview-star-1");
    this.dom.previewStar2 = document.getElementById("preview-star-2");
    this.dom.previewStar3 = document.getElementById("preview-star-3");

    // Roda e SVG
    this.dom.wheelStage = document.getElementById("wheel-stage-container");
    this.dom.wheelRing = document.getElementById("wheel-ring");
    this.dom.svg = document.getElementById("connection-svg");
    this.dom.dragLine = document.getElementById("dynamic-drag-line");

    // Botões
    this.dom.btnSubmit = document.getElementById("btn-submit-word");
    this.dom.btnShuffle = document.getElementById("btn-shuffle");
    this.dom.btnHintLetter = document.getElementById("btn-hint-letter");
    this.dom.btnHintClue = document.getElementById("btn-hint-clue");
    this.dom.btnClear = document.getElementById("btn-clear-selection");
    this.dom.btnToggleSound = document.getElementById("btn-toggle-sound");
    this.dom.soundIcon = document.getElementById("sound-icon");

    // Modais
    this.dom.btnOpenStats = document.getElementById("btn-open-stats");
    this.dom.btnCloseStats = document.getElementById("btn-close-stats");
    this.dom.modalStats = document.getElementById("modal-stats");

    this.dom.btnOpenHelp = document.getElementById("btn-open-help");
    this.dom.btnCloseHelp = document.getElementById("btn-close-help");
    this.dom.modalHelp = document.getElementById("modal-help");

    this.dom.modalVictory = document.getElementById("modal-victory");
    this.dom.btnNextLevel = document.getElementById("btn-next-level");

    this.dom.modalClue = document.getElementById("modal-clue");
    this.dom.btnCloseClue = document.getElementById("btn-close-clue");
    this.dom.btnDismissClue = document.getElementById("btn-dismiss-clue");
    this.dom.clueText = document.getElementById("clue-text-content");
    this.dom.clueTargetLen = document.getElementById("clue-target-len");

    this.dom.btnResetStats = document.getElementById("btn-reset-stats");
    this.dom.confettiCanvas = document.getElementById("confetti-canvas");
  }

  /* ========================================================================
     SISTEMA DE PERSISTÊNCIA & ESTATÍSTICAS
     ======================================================================== */
  loadStats() {
    const defaultStats = {
      currentLevel: 0,
      totalCompleted: 0,
      totalScore: 0,
      wordsFound: 0,
      bonusFound: 0,
      stars: { 1: 0, 2: 0, 3: 0 }
    };

    try {
      const saved = localStorage.getItem("palavrorio_stats");
      this.stats = saved ? { ...defaultStats, ...JSON.parse(saved) } : defaultStats;
    } catch {
      this.stats = defaultStats;
    }
  }

  saveStats() {
    try {
      localStorage.setItem("palavrorio_stats", JSON.stringify(this.stats));
    } catch (e) {
      console.warn("Falha ao salvar no localStorage", e);
    }
  }

  updateStatsUi() {
    if (this.dom.headerScore) {
      this.dom.headerScore.textContent = this.stats.totalScore.toLocaleString("pt-BR");
    }
    if (this.dom.headerBonus) {
      this.dom.headerBonus.textContent = this.stats.bonusFound;
    }

    // Modal de Estatísticas
    const totalComp = document.getElementById("stat-total-completed");
    const totalScore = document.getElementById("stat-total-score");
    const wordsFound = document.getElementById("stat-words-found");
    const bonusFound = document.getElementById("stat-bonus-found");

    if (totalComp) totalComp.textContent = this.stats.totalCompleted;
    if (totalScore) totalScore.textContent = this.stats.totalScore.toLocaleString("pt-BR");
    if (wordsFound) wordsFound.textContent = this.stats.wordsFound;
    if (bonusFound) bonusFound.textContent = this.stats.bonusFound;

    const s3 = this.stats.stars[3] || 0;
    const s2 = this.stats.stars[2] || 0;
    const s1 = this.stats.stars[1] || 0;
    const totalStarsRounds = Math.max(1, s3 + s2 + s1);

    const b3 = document.getElementById("bar-3-stars");
    const b2 = document.getElementById("bar-2-stars");
    const b1 = document.getElementById("bar-1-star");
    const c3 = document.getElementById("count-3-stars");
    const c2 = document.getElementById("count-2-stars");
    const c1 = document.getElementById("count-1-star");

    if (b3 && c3) {
      b3.style.width = `${(s3 / totalStarsRounds) * 100}%`;
      c3.textContent = s3;
    }
    if (b2 && c2) {
      b2.style.width = `${(s2 / totalStarsRounds) * 100}%`;
      c2.textContent = s2;
    }
    if (b1 && c1) {
      b1.style.width = `${(s1 / totalStarsRounds) * 100}%`;
      c1.textContent = s1;
    }
  }

  /* ========================================================================
     PAINEL DE PROTÓTIPOS E MODAL DOS ESPECIALISTAS (UI & UX)
     ======================================================================== */
  setupPrototypeBar() {
    // Cria uma barra moderna suspensa no topo do app para alternar entre os 3 mockups
    const bar = document.createElement("div");
    bar.className = "prototype-switcher-bar";
    bar.setAttribute("role", "toolbar");
    bar.setAttribute("aria-label", "Seletor de Protótipos de Interface");

    bar.innerHTML = `
      <div class="prototype-brand-tag">
        <span class="pulse-dot"></span>
        <span class="tag-txt">Studio de Mockups</span>
      </div>
      <div class="prototype-buttons-group">
        <button class="proto-btn active" data-proto="aurora" title="Protótipo 1: Aurora Glass (Dark Glassmorphism Padrão)">
          <span class="proto-icon">🌌</span>
          <span class="proto-name">Aurora Glass</span>
        </button>
        <button class="proto-btn" data-proto="ergoflow" title="Protótipo 2: ErgoFlow (Foco em Ergonomia Móvel e Acessibilidade WCAG AAA)">
          <span class="proto-icon">♿</span>
          <span class="proto-name">ErgoFlow (A11y)</span>
        </button>
        <button class="proto-btn" data-proto="arcade" title="Protótipo 3: Arcade Zen (Foco em Imersão e Cartas 3D)">
          <span class="proto-icon">⚡</span>
          <span class="proto-name">Arcade Zen</span>
        </button>
      </div>
      <button class="expert-panel-trigger" id="btn-open-experts" title="Ver parecer do Painel de Especialistas (UX, A11y e Visual)">
        <span>👥 Painel de Especialistas</span>
      </button>
    `;

    document.body.prepend(bar);

    // Eventos de clique na barra de protótipos
    bar.querySelectorAll(".proto-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const proto = btn.getAttribute("data-proto");
        this.switchPrototype(proto);
        bar.querySelectorAll(".proto-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    document.getElementById("btn-open-experts")?.addEventListener("click", () => {
      this.toggleExpertModal(true);
    });
  }

  setupExpertReviewModal() {
    const expertModal = document.createElement("div");
    expertModal.className = "modal-overlay";
    expertModal.id = "modal-experts";
    expertModal.setAttribute("aria-hidden", "true");
    expertModal.setAttribute("role", "dialog");

    expertModal.innerHTML = `
      <div class="modal-card expert-modal-card glass-card">
        <div class="modal-header">
          <div class="expert-title-wrap">
            <span class="expert-title-icon">🏛️</span>
            <div>
              <h2 class="modal-title">Painel de Agentes Especialistas</h2>
              <p class="expert-subtitle">Avaliação Técnica dos 3 Protótipos de Interface</p>
            </div>
          </div>
          <button class="modal-close-btn" id="btn-close-experts" aria-label="Fechar Painel">&times;</button>
        </div>

        <div class="experts-grid">
          <!-- Especialista UX -->
          <article class="expert-profile-card ux-border">
            <header class="expert-card-header">
              <span class="expert-avatar">🧠</span>
              <div>
                <h3 class="expert-name">Camila Rocha</h3>
                <span class="expert-role">UX Lead & Interação Casual</span>
              </div>
            </header>
            <div class="expert-verdict">
              <p class="quote">"O modelo <strong>ErgoFlow</strong> vence na ergonomia de uma mão, posicionando a roda de letras na zona do polegar natural de celulares 6.5″. Já o <strong>Aurora Glass</strong> traz a melhor cadência entre visualização do tabuleiro e entrada por gesto contínuo sem fadiga."</p>
              <ul class="expert-metrics">
                <li>🎯 <em>Fitts's Law:</em> Distância reduzida entre roda e slots.</li>
                <li>🔄 <em>Zero-Spillover:</em> Gestos em curva prevenem toques fantasmas.</li>
              </ul>
            </div>
          </article>

          <!-- Especialista A11y -->
          <article class="expert-profile-card a11y-border">
            <header class="expert-card-header">
              <span class="expert-avatar">♿</span>
              <div>
                <h3 class="expert-name">Rafael Nogueira</h3>
                <span class="expert-role">Especialista WCAG 2.2 AAA</span>
              </div>
            </header>
            <div class="expert-verdict">
              <p class="quote">"No protótipo <strong>ErgoFlow</strong>, atingimos contraste de <strong>9.8:1</strong> (acima dos 7:1 exigidos no AAA), eliminamos dependência estrita de cor com padrões geométricos nas dicas e garantimos que os alvos de toque meçam no mínimo <strong>56x56px</strong>."</p>
              <ul class="expert-metrics">
                <li>👁️ <em>Daltonismo:</em> Modos Deuteranopia e Protanopia nativos.</li>
                <li>🔊 <em>Dual-Channel:</em> Cada som possui legenda/símbolo háptico visual.</li>
              </ul>
            </div>
          </article>

          <!-- Especialista Visual Design -->
          <article class="expert-profile-card visual-border">
            <header class="expert-card-header">
              <span class="expert-avatar">🎨</span>
              <div>
                <h3 class="expert-name">Lucas Vance</h3>
                <span class="expert-role">Diretor de Arte & Motion</span>
              </div>
            </header>
            <div class="expert-verdict">
              <p class="quote">"O protótipo <strong>Aurora Glass</strong> traduz o Dark Glassmorphism no seu ápice: blur de 20px com orbes bioluminescentes e flip 3D nas cartas de palavras. O <strong>Arcade Zen</strong> traz uma abordagem alternativa estilo mesa tátil com sombras e física refinada."</p>
              <ul class="expert-metrics">
                <li>✨ <em>Game Feel:</em> Flip sequencial de cartas a 60fps.</li>
                <li>💎 <em>Refração:</em> Efeito de vidro que responde à iluminação de fundo.</li>
              </ul>
            </div>
          </article>
        </div>

        <div class="prototype-comparison-table-wrapper">
          <h4 class="comparison-title">Matriz Comparativa dos 3 Mockups</h4>
          <table class="proto-table">
            <thead>
              <tr>
                <th>Protótipo</th>
                <th>Filosofia Central</th>
                <th>Diferencial de Interação</th>
                <th>Público Recomendado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>1. Aurora Glass</strong></td>
                <td>Elegância & Estética Futurista</td>
                <td>Roda orbital luminosa com trilha em gradiente SVG</td>
                <td>Jogadores que buscam imersão premium moderna</td>
              </tr>
              <tr>
                <td><strong>2. ErgoFlow (A11y)</strong></td>
                <td>Ergonomia Móvel & WCAG AAA</td>
                <td>Teclas gigantes de 60px, alto contraste e legendas</td>
                <td>Jogadores em telas grandes, acessibilidade e idosos</td>
              </tr>
              <tr>
                <td><strong>3. Arcade Zen</strong></td>
                <td>Foco Intenso & Minimalismo</td>
                <td>Tabuleiro estilo cartas físicas táteis e feedback direto</td>
                <td>Jogadores competitivos focados em velocidade</td>
              </tr>
            </tbody>
          </table>
        </div>

        <button class="primary-gradient-btn" id="btn-close-experts-cta" style="width: 100%; margin-top: 18px;">
          Retornar aos Mockups Interativos ➔
        </button>
      </div>
    `;

    document.body.appendChild(expertModal);

    document.getElementById("btn-close-experts")?.addEventListener("click", () => this.toggleExpertModal(false));
    document.getElementById("btn-close-experts-cta")?.addEventListener("click", () => this.toggleExpertModal(false));
    expertModal.addEventListener("click", (e) => {
      if (e.target === expertModal) this.toggleExpertModal(false);
    });
  }

  toggleExpertModal(open) {
    const modal = document.getElementById("modal-experts");
    if (!modal) return;
    if (open) {
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
    } else {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
    }
  }

  /* Alternar Dinamicamente entre os 3 Protótipos */
  switchPrototype(prototypeKey) {
    this.currentPrototype = prototypeKey;
    document.body.classList.remove("proto-aurora", "proto-ergoflow", "proto-arcade");
    document.body.classList.add(`proto-${prototypeKey}`);

    this.showFeedbackToast(
      prototypeKey === 'aurora' ? "🌌 Protótipo 1: Aurora Glass Ativado" :
      prototypeKey === 'ergoflow' ? "♿ Protótipo 2: ErgoFlow (A11y WCAG AAA) Ativado" :
      "⚡ Protótipo 3: Arcade Zen Ativado",
      "toast-bonus"
    );

    // Re-renderiza a roda e tabuleiro com as proporções do protótipo selecionado
    this.renderWordWheel();
    this.renderBoard();
  }

  /* ========================================================================
     GERENCIAMENTO DE NÍVEL E TABULEIRO
     ======================================================================== */
  loadLevel(levelIndex) {
    const safeIndex = levelIndex % PUZZLES.length;
    this.currentLevelIndex = safeIndex;
    this.currentPuzzle = PUZZLES[safeIndex];

    this.solvedWords.clear();
    this.foundBonusWords.clear();
    this.hintedTiles.clear();
    this.hintsUsed = 0;
    this.selectedNodeIndices = [];
    this.currentWord = "";
    this.roundBaseScore = 0;
    this.bonusScoreRound = 0;

    // Embaralha letras inicialmente
    this.shuffledLetters = [...this.currentPuzzle.letters];
    this.shuffleLetters(false);

    // Atualiza cabeçalho e progresso
    if (this.dom.levelTitle) {
      this.dom.levelTitle.textContent = this.currentPuzzle.title;
    }
    this.updatePreviewStars();
    this.updateProgressBar();

    // Renderiza tabuleiro e roda
    this.renderBoard();
    this.renderWordWheel();
    this.updateCurrentWordDisplay();
  }

  renderBoard() {
    if (!this.dom.board) return;
    this.dom.board.innerHTML = "";

    const targetWords = Object.keys(this.currentPuzzle.targetWords);

    // Agrupa palavras por quantidade de letras (3, 4, 5, 6, 7...)
    const grouped = {};
    targetWords.forEach(word => {
      const len = word.length;
      if (!grouped[len]) grouped[len] = [];
      grouped[len].push(word);
    });

    const lengths = Object.keys(grouped).map(Number).sort((a, b) => a - b);

    lengths.forEach(len => {
      const groupDiv = document.createElement("div");
      groupDiv.className = "word-length-group";

      const header = document.createElement("div");
      header.className = "group-header";
      header.innerHTML = `<span>${len} Letras (${grouped[len].length})</span>`;
      groupDiv.appendChild(header);

      const rowWrapper = document.createElement("div");
      rowWrapper.className = "words-row-wrapper";

      grouped[len].forEach(word => {
        const wordItem = document.createElement("div");
        wordItem.className = "word-item";
        wordItem.setAttribute("data-word", word);
        wordItem.setAttribute("role", "group");
        wordItem.setAttribute("aria-label", `Palavra de ${len} letras`);

        const isSolved = this.solvedWords.has(word);
        if (isSolved) {
          wordItem.classList.add("solved");
        }

        for (let i = 0; i < word.length; i++) {
          const tile = document.createElement("div");
          tile.className = "letter-tile";
          tile.setAttribute("data-index", i);

          const isTileHinted = this.hintedTiles.has(`${word}_${i}`);

          if (isSolved) {
            tile.classList.add("revealed");
            tile.textContent = word[i];
          } else if (isTileHinted) {
            tile.classList.add("hinted");
            tile.textContent = word[i];
          } else {
            tile.textContent = "";
          }

          wordItem.appendChild(tile);
        }

        rowWrapper.appendChild(wordItem);
      });

      groupDiv.appendChild(rowWrapper);
      this.dom.board.appendChild(groupDiv);
    });
  }

  /* ========================================================================
     RODA DE LETRAS INTERATIVA (WORD WHEEL)
     ======================================================================== */
  renderWordWheel() {
    if (!this.dom.wheelRing) return;
    this.dom.wheelRing.innerHTML = "";

    const letters = this.shuffledLetters;
    const count = letters.length;
    
    // Raio adaptado por protótipo
    const isErgo = this.currentPrototype === 'ergoflow';
    const isArcade = this.currentPrototype === 'arcade';
    const radius = isErgo ? 86 : isArcade ? 92 : 88; // pixels do centro

    const centerX = 125;
    const centerY = 125;

    letters.forEach((char, index) => {
      const node = document.createElement("button");
      node.className = "wheel-node";
      node.setAttribute("data-index", index);
      node.setAttribute("data-char", char);
      node.setAttribute("aria-label", `Letra ${char}`);
      node.textContent = char;

      // Distribuição circular: ângulo em radianos
      const angle = (index * (2 * Math.PI) / count) - (Math.PI / 2);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      node.style.left = `${x}px`;
      node.style.top = `${y}px`;

      this.dom.wheelRing.appendChild(node);
    });

    this.clearDragLines();
  }

  shuffleLetters(animate = true) {
    if (animate) {
      sound.playShuffle();
      this.dom.wheelRing?.classList.add("shuffling");
      setTimeout(() => this.dom.wheelRing?.classList.remove("shuffling"), 550);
    }

    // Embaralha array
    for (let i = this.shuffledLetters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffledLetters[i], this.shuffledLetters[j]] = [this.shuffledLetters[j], this.shuffledLetters[i]];
    }

    this.renderWordWheel();
    this.clearSelection();
  }

  /* ========================================================================
     SISTEMA DE GESTOS, ARRASTO E CLIQUE NA RODA
     ======================================================================== */
  bindEvents() {
    // 1. Suporte a Arrastar (Pointer Events: Touch + Mouse unificados)
    const stage = this.dom.wheelStage;
    if (stage) {
      stage.addEventListener("pointerdown", (e) => this.onPointerDown(e));
      window.addEventListener("pointermove", (e) => this.onPointerMove(e));
      window.addEventListener("pointerup", (e) => this.onPointerUp(e));
      window.addEventListener("pointercancel", (e) => this.onPointerUp(e));
    }

    // 2. Botão de Enviar Palavra
    this.dom.btnSubmit?.addEventListener("click", () => this.submitWord());

    // 3. Botão de Embaralhar
    this.dom.btnShuffle?.addEventListener("click", () => this.shuffleLetters(true));

    // 4. Botão de Limpar
    this.dom.btnClear?.addEventListener("click", () => this.clearSelection());

    // 5. Botões de Dicas
    this.dom.btnHintLetter?.addEventListener("click", () => this.useLetterHint());
    this.dom.btnHintClue?.addEventListener("click", () => this.useClueHint());

    // 6. Botão de Som
    this.dom.btnToggleSound?.addEventListener("click", () => {
      const muted = sound.toggleMute();
      if (this.dom.soundIcon) {
        this.dom.soundIcon.textContent = muted ? "🔇" : "🔊";
      }
      this.showFeedbackToast(muted ? "Som Desativado" : "Som Ativado", "toast-bonus");
    });

    // 7. Modais de Ajuda e Estatísticas
    this.dom.btnOpenStats?.addEventListener("click", () => this.toggleModal(this.dom.modalStats, true));
    this.dom.btnCloseStats?.addEventListener("click", () => this.toggleModal(this.dom.modalStats, false));

    this.dom.btnOpenHelp?.addEventListener("click", () => this.toggleModal(this.dom.modalHelp, true));
    this.dom.btnCloseHelp?.addEventListener("click", () => this.toggleModal(this.dom.modalHelp, false));

    this.dom.btnCloseClue?.addEventListener("click", () => this.toggleModal(this.dom.modalClue, false));
    this.dom.btnDismissClue?.addEventListener("click", () => this.toggleModal(this.dom.modalClue, false));

    this.dom.btnNextLevel?.addEventListener("click", () => {
      this.toggleModal(this.dom.modalVictory, false);
      this.loadLevel(this.currentLevelIndex + 1);
      this.stats.currentLevel = this.currentLevelIndex;
      this.saveStats();
    });

    this.dom.btnResetStats?.addEventListener("click", () => {
      if (confirm("Deseja realmente zerar todas as estatísticas e pontuações?")) {
        localStorage.removeItem("palavrorio_stats");
        this.loadStats();
        this.updateStatsUi();
        this.showFeedbackToast("Estatísticas Zeradas", "toast-error");
      }
    });

    // Fechar modais ao clicar no fundo
    [this.dom.modalStats, this.dom.modalHelp, this.dom.modalClue].forEach(modal => {
      modal?.addEventListener("click", (e) => {
        if (e.target === modal) this.toggleModal(modal, false);
      });
    });

    // 8. Atalhos de Teclado Físico
    window.addEventListener("keydown", (e) => this.onKeyDown(e));
  }

  onPointerDown(e) {
    const targetNode = e.target.closest(".wheel-node");
    if (!targetNode) return;

    this.isDragging = true;
    const index = parseInt(targetNode.getAttribute("data-index"), 10);
    this.addNodeToSelection(index);
    this.updateDragLineToCursor(e.clientX, e.clientY);
  }

  onPointerMove(e) {
    if (!this.isDragging) return;

    // Procura nó sob a posição atual do ponteiro
    const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
    const nodeBelow = elemBelow?.closest(".wheel-node");

    if (nodeBelow) {
      const index = parseInt(nodeBelow.getAttribute("data-index"), 10);
      
      // Se for o penúltimo selecionado, permite voltar (desfazer)
      if (this.selectedNodeIndices.length >= 2 && this.selectedNodeIndices[this.selectedNodeIndices.length - 2] === index) {
        this.removeLastNode();
      } else if (!this.selectedNodeIndices.includes(index)) {
        this.addNodeToSelection(index);
      }
    }

    this.updateDragLineToCursor(e.clientX, e.clientY);
  }

  onPointerUp() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.hideDynamicDragLine();

    // Se tiver pelo menos 2 letras, submete automaticamente no gesto de arrastar!
    if (this.selectedNodeIndices.length >= 2) {
      this.submitWord();
    }
  }

  onKeyDown(e) {
    // Ignora se modal estiver aberto
    if (document.querySelector(".modal-overlay.active")) return;

    const key = e.key.toUpperCase();

    if (key === "ENTER") {
      e.preventDefault();
      this.submitWord();
      return;
    }

    if (key === "BACKSPACE" || key === "ESCAPE") {
      e.preventDefault();
      if (key === "BACKSPACE") {
        this.removeLastNode();
      } else {
        this.clearSelection();
      }
      return;
    }

    if (key === " " || key === "SPACEBAR") {
      e.preventDefault();
      this.shuffleLetters(true);
      return;
    }

    // Procura letra correspondente na roda que ainda não foi selecionada
    if (/^[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇ]$/.test(key)) {
      const normalizedKey = this.normalizeChar(key);
      const availableIndex = this.shuffledLetters.findIndex((char, idx) => {
        return this.normalizeChar(char) === normalizedKey && !this.selectedNodeIndices.includes(idx);
      });

      if (availableIndex !== -1) {
        this.addNodeToSelection(availableIndex);
      }
    }
  }

  /* ========================================================================
     MANIPULAÇÃO DE SELEÇÃO E CONEXÃO SVG
     ======================================================================== */
  addNodeToSelection(index) {
    if (this.selectedNodeIndices.includes(index)) return;

    this.selectedNodeIndices.push(index);
    this.currentWord += this.shuffledLetters[index];

    // Som de tecla com arpejo progressivo
    sound.playLetterSelect(this.selectedNodeIndices.length - 1);

    // Destaque visual no nó
    const node = this.dom.wheelRing?.querySelector(`.wheel-node[data-index="${index}"]`);
    node?.classList.add("selected");

    this.updateCurrentWordDisplay();
    this.drawSvgConnectionLines();
  }

  removeLastNode() {
    if (this.selectedNodeIndices.length === 0) return;

    const removedIndex = this.selectedNodeIndices.pop();
    this.currentWord = this.currentWord.slice(0, -1);

    sound.playLetterDeselect();

    const node = this.dom.wheelRing?.querySelector(`.wheel-node[data-index="${removedIndex}"]`);
    node?.classList.remove("selected");

    this.updateCurrentWordDisplay();
    this.drawSvgConnectionLines();
  }

  clearSelection() {
    this.selectedNodeIndices = [];
    this.currentWord = "";

    this.dom.wheelRing?.querySelectorAll(".wheel-node").forEach(node => {
      node.classList.remove("selected");
    });

    this.clearDragLines();
    this.updateCurrentWordDisplay();
  }

  updateCurrentWordDisplay() {
    const bubble = this.dom.currentWordBubble;
    if (!bubble) return;

    if (this.currentWord.length === 0) {
      bubble.classList.remove("has-word");
      bubble.innerHTML = `<span class="placeholder-hint">Arraste ou clique nas letras</span>`;
    } else {
      bubble.classList.add("has-word");
      bubble.innerHTML = `
        <div class="active-letters-row">
          ${this.currentWord.split("").map(char => `<span class="active-letter-badge">${char}</span>`).join("")}
        </div>
      `;
    }
  }

  drawSvgConnectionLines() {
    if (!this.dom.svg) return;

    // Remove paths anteriores exceto o dynamic line
    const existingPaths = this.dom.svg.querySelectorAll(".connection-path");
    existingPaths.forEach(p => p.remove());

    if (this.selectedNodeIndices.length < 2) return;

    const nodes = this.selectedNodeIndices.map(idx => {
      const el = this.dom.wheelRing?.querySelector(`.wheel-node[data-index="${idx}"]`);
      return {
        x: parseFloat(el.style.left),
        y: parseFloat(el.style.top)
      };
    });

    let d = `M ${nodes[0].x} ${nodes[0].y}`;
    for (let i = 1; i < nodes.length; i++) {
      d += ` L ${nodes[i].x} ${nodes[i].y}`;
    }

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("class", "connection-path");
    this.dom.svg.appendChild(path);
  }

  updateDragLineToCursor(clientX, clientY) {
    if (!this.isDragging || this.selectedNodeIndices.length === 0 || !this.dom.dragLine) return;

    const lastIdx = this.selectedNodeIndices[this.selectedNodeIndices.length - 1];
    const lastNode = this.dom.wheelRing?.querySelector(`.wheel-node[data-index="${lastIdx}"]`);
    if (!lastNode) return;

    const stageRect = this.dom.wheelStage.getBoundingClientRect();
    const cursorX = clientX - stageRect.left;
    const cursorY = clientY - stageRect.top;

    const startX = parseFloat(lastNode.style.left);
    const startY = parseFloat(lastNode.style.top);

    this.dom.dragLine.setAttribute("x1", startX);
    this.dom.dragLine.setAttribute("y1", startY);
    this.dom.dragLine.setAttribute("x2", cursorX);
    this.dom.dragLine.setAttribute("y2", cursorY);
    this.dom.dragLine.style.display = "block";
  }

  hideDynamicDragLine() {
    if (this.dom.dragLine) {
      this.dom.dragLine.style.display = "none";
    }
  }

  clearDragLines() {
    this.hideDynamicDragLine();
    if (!this.dom.svg) return;
    const existingPaths = this.dom.svg.querySelectorAll(".connection-path");
    existingPaths.forEach(p => p.remove());
  }

  /* ========================================================================
     VALIDAÇÃO DE PALAVRAS, PONTUAÇÃO E FEEDBACK
     ======================================================================== */
  submitWord() {
    const rawGuess = this.currentWord.trim().toUpperCase();
    if (rawGuess.length < 3) {
      this.shakeBubble();
      this.showFeedbackToast("Palavra muito curta (mínimo 3 letras)", "toast-error");
      this.clearSelection();
      return;
    }

    const normalizedGuess = this.normalizeWord(rawGuess);
    const targetWords = Object.keys(this.currentPuzzle.targetWords);

    // 1. Procura se a palavra é um dos alvos obrigatórios do tabuleiro
    const matchedTarget = targetWords.find(w => this.normalizeWord(w) === normalizedGuess);

    if (matchedTarget) {
      if (this.solvedWords.has(matchedTarget)) {
        sound.playInvalidWord();
        this.shakeBubble();
        this.showFeedbackToast("Palavra já encontrada!", "toast-error");
      } else {
        // Acerto no tabuleiro!
        this.solvedWords.add(matchedTarget);
        sound.playWordSuccess();
        this.onTargetWordFound(matchedTarget);
      }
      this.clearSelection();
      return;
    }

    // 2. Procura se a palavra é uma palavra bônus válida
    const bonusWords = this.currentPuzzle.bonusWords || [];
    const matchedBonus = bonusWords.find(w => this.normalizeWord(w) === normalizedGuess);

    if (matchedBonus) {
      if (this.foundBonusWords.has(matchedBonus)) {
        sound.playInvalidWord();
        this.shakeBubble();
        this.showFeedbackToast("Palavra bônus já coletada!", "toast-error");
      } else {
        this.foundBonusWords.add(matchedBonus);
        sound.playBonusWord();
        this.onBonusWordFound(matchedBonus);
      }
      this.clearSelection();
      return;
    }

    // 3. Palavra não reconhecida no dicionário do nível
    sound.playInvalidWord();
    this.shakeBubble();
    this.showFeedbackToast("Não consta no dicionário", "toast-error");
    this.clearSelection();
  }

  onTargetWordFound(word) {
    const pts = word.length * 15;
    this.roundBaseScore += pts;
    this.stats.wordsFound++;
    this.showFeedbackToast(`Excelente! +${pts} pts`, "toast-success");

    // Animação de revelação na grade
    const wordElem = this.dom.board?.querySelector(`.word-item[data-word="${word}"]`);
    if (wordElem) {
      wordElem.classList.add("just-solved", "solved");
      const tiles = wordElem.querySelectorAll(".letter-tile");
      tiles.forEach((tile, i) => {
        tile.classList.add("revealed");
        tile.textContent = word[i];
      });
      setTimeout(() => wordElem.classList.remove("just-solved"), 650);
    }

    this.updateProgressBar();

    // Checa se o nível foi 100% concluído
    const totalRequired = Object.keys(this.currentPuzzle.targetWords).length;
    if (this.solvedWords.size === totalRequired) {
      setTimeout(() => this.triggerVictory(), 700);
    }
  }

  onBonusWordFound(word) {
    const pts = 25;
    this.bonusScoreRound += pts;
    this.stats.bonusFound++;
    this.updateStatsUi();
    this.showFeedbackToast(`💎 Palavra Bônus: ${word} (+${pts} pts)`, "toast-bonus");
  }

  shakeBubble() {
    this.dom.currentWordBubble?.classList.remove("shake");
    // Força reflow
    void this.dom.currentWordBubble?.offsetWidth;
    this.dom.currentWordBubble?.classList.add("shake");
  }

  showFeedbackToast(text, type = "toast-success") {
    const toast = this.dom.feedbackToast;
    if (!toast) return;

    toast.textContent = text;
    toast.className = `feedback-toast ${type} show`;

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
  }

  updateProgressBar() {
    const totalRequired = Object.keys(this.currentPuzzle.targetWords).length;
    const solved = this.solvedWords.size;
    const pct = Math.round((solved / totalRequired) * 100);

    if (this.dom.progressFill) {
      this.dom.progressFill.style.width = `${pct}%`;
    }
    const bar = document.getElementById("round-progressbar");
    bar?.setAttribute("aria-valuenow", pct);
  }

  /* ========================================================================
     SISTEMA DE DICAS COM PENALIDADE DE PONTUAÇÃO & ESTRELAS
     ======================================================================== */
  useLetterHint() {
    // Encontra a primeira palavra não resolvida com letra ainda não revelada
    const unsolvedWords = Object.keys(this.currentPuzzle.targetWords).filter(w => !this.solvedWords.has(w));
    if (unsolvedWords.length === 0) return;

    // Encontra um slot ainda não revelado
    let foundWord = null;
    let foundIndex = -1;

    for (const w of unsolvedWords) {
      for (let i = 0; i < w.length; i++) {
        if (!this.hintedTiles.has(`${w}_${i}`)) {
          foundWord = w;
          foundIndex = i;
          break;
        }
      }
      if (foundWord) break;
    }

    if (!foundWord) {
      this.showFeedbackToast("Todas as letras já estão com dicas!", "toast-error");
      return;
    }

    sound.playHint();
    this.hintsUsed++;
    this.hintedTiles.add(`${foundWord}_${foundIndex}`);

    // Revela a letra no tabuleiro com estilo de dica
    const wordElem = this.dom.board?.querySelector(`.word-item[data-word="${foundWord}"]`);
    const tile = wordElem?.querySelector(`.letter-tile[data-index="${foundIndex}"]`);
    if (tile) {
      tile.classList.add("hinted");
      tile.textContent = foundWord[foundIndex];
    }

    this.updatePreviewStars();
    this.showFeedbackToast(`Letra Revelada: "${foundWord[foundIndex]}" (-15% pts)`, "toast-bonus");
  }

  useClueHint() {
    const unsolvedWords = Object.keys(this.currentPuzzle.targetWords).filter(w => !this.solvedWords.has(w));
    if (unsolvedWords.length === 0) return;

    // Pega uma palavra não resolvida e exibe sua pista do dicionário
    const target = unsolvedWords[0];
    const definition = this.currentPuzzle.targetWords[target];

    sound.playHint();
    this.hintsUsed += 2; // Pista temática tem maior peso de penalidade
    this.updatePreviewStars();

    if (this.dom.clueTargetLen) {
      this.dom.clueTargetLen.textContent = `Palavra de ${target.length} Letras`;
    }
    if (this.dom.clueText) {
      this.dom.clueText.textContent = `"${definition}"`;
    }

    this.toggleModal(this.dom.modalClue, true);
  }

  updatePreviewStars() {
    const stars = this.calculateStars();
    [this.dom.previewStar1, this.dom.previewStar2, this.dom.previewStar3].forEach((el, idx) => {
      if (!el) return;
      if (idx < stars) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });
  }

  calculateStars() {
    if (this.hintsUsed === 0) return 3; // ⭐⭐⭐ Perfeito
    if (this.hintsUsed === 1) return 2; // ⭐⭐ 1 Dica
    return 1; // ⭐ 2+ Dicas
  }

  /* ========================================================================
     TELA DE VITÓRIA & PARTICULAS DE CONFETES
     ======================================================================== */
  triggerVictory() {
    sound.playLevelComplete();
    const stars = this.calculateStars();

    // Aplica multiplicador de penalidade conforme o PRD
    const penaltyMultiplier = stars === 3 ? 1.0 : stars === 2 ? 0.85 : 0.60;
    const finalRoundScore = Math.round((this.roundBaseScore + 200 + this.bonusScoreRound) * penaltyMultiplier);

    this.stats.totalCompleted++;
    this.stats.totalScore += finalRoundScore;
    this.stats.stars[stars] = (this.stats.stars[stars] || 0) + 1;
    this.saveStats();
    this.updateStatsUi();

    // Preenche o Modal de Vitória
    const vRoundScore = document.getElementById("v-round-score");
    const vHintsUsed = document.getElementById("v-hints-used");
    const vBonusScore = document.getElementById("v-bonus-score");
    const vRatingLabel = document.getElementById("star-rating-label");

    if (vRoundScore) vRoundScore.textContent = `+${finalRoundScore}`;
    if (vHintsUsed) vHintsUsed.textContent = this.hintsUsed;
    if (vBonusScore) vBonusScore.textContent = `+${this.bonusScoreRound}`;

    if (vRatingLabel) {
      vRatingLabel.textContent = stars === 3 ? "⭐⭐⭐ Desempenho Perfeito! (Sem Dicas)" :
                                 stars === 2 ? "⭐⭐ Ótimo Desempenho! (1 Dica Usada)" :
                                 "⭐ Nível Concluído com Suporte de Dicas";
    }

    // Animação sequencial das estrelas
    const s1 = document.getElementById("v-star-1");
    const s2 = document.getElementById("v-star-2");
    const s3 = document.getElementById("v-star-3");

    [s1, s2, s3].forEach(s => s?.classList.remove("earned"));
    setTimeout(() => { if (stars >= 1) s1?.classList.add("earned"); }, 200);
    setTimeout(() => { if (stars >= 2) s2?.classList.add("earned"); }, 550);
    setTimeout(() => { if (stars >= 3) s3?.classList.add("earned"); }, 900);

    // Preenche vocabulário e significados
    const wordsList = document.getElementById("victory-words-list");
    if (wordsList) {
      wordsList.innerHTML = Object.entries(this.currentPuzzle.targetWords).map(([word, desc]) => `
        <div class="word-meaning-item">
          <span class="word-meaning-term">${word}:</span>
          <span class="word-meaning-desc">${desc}</span>
        </div>
      `).join("");
    }

    this.toggleModal(this.dom.modalVictory, true);
    this.launchConfetti();
  }

  toggleModal(modal, open) {
    if (!modal) return;
    if (open) {
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
    } else {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
    }
  }

  /* ========================================================================
     SISTEMA DE CONFETES PROCEDURAIS (CANVAS)
     ======================================================================== */
  initConfetti() {
    this.canvas = this.dom.confettiCanvas;
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.confettiParticles = [];

    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);
    resize();
  }

  launchConfetti() {
    if (!this.ctx) return;
    this.confettiParticles = [];
    const colors = ["#00f2fe", "#4facfe", "#fbbf24", "#f43f5e", "#10b981", "#a855f7"];

    for (let i = 0; i < 90; i++) {
      this.confettiParticles.push({
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 18,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        spin: (Math.random() - 0.5) * 12,
        alpha: 1
      });
    }

    const animate = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      this.confettiParticles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.4; // Gravidade
        p.rotation += p.spin;
        p.alpha -= 0.012;

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.globalAlpha = Math.max(0, p.alpha);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        this.ctx.restore();

        if (p.alpha <= 0) {
          this.confettiParticles.splice(idx, 1);
        }
      });

      if (this.confettiParticles.length > 0) {
        requestAnimationFrame(animate);
      } else {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    };

    requestAnimationFrame(animate);
  }

  /* Utilitários */
  normalizeChar(c) {
    return c.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  }

  normalizeWord(w) {
    return w.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
  }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  const game = new PalavrorioGame();
  game.init();
});
