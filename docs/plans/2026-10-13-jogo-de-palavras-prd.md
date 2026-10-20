# PRD — Jogo Casual de Anagramas: "Palavrório / Conexão de Letras"

**Versão:** 1.0.0  
**Data:** 2026-10-13  
**Status:** Aprovado & Implementado  
**Caminho Normativo:** `docs/plans/2026-10-13-jogo-de-palavras-prd.md`  

---

## 1. Visão Geral do Produto

### 1.1 Resumo Executivo
O produto é um jogo casual web-first de formação e adivinhação de palavras baseado em anagramas (estilo *Letroca* e *Wordscapes*). A cada rodada, o jogador recebe um conjunto de letras embaralhadas em uma roda interativa e deve descobrir todas as palavras válidas ocultas no tabuleiro.

O diferencial do projeto é aliar uma experiência contínua e sem bloqueios (Modo Prática / Ilimitado) a uma estética visual sofisticada em **Dark Mode Glassmorphism**, com micro-animações táteis, síntese de áudio procedural e um sistema estratégico de dicas com penalidade de pontuação/estrelas.

### 1.2 Proposta de Valor
- **Acessibilidade Instantânea:** Jogo direto no navegador, responsivo (mobile e desktop), sem download ou cadastro obrigatório.
- **Ritmo Fluido (Bingeable):** Sessões infinitas com rotação contínua de novos desafios.
- **Estímulo Cognitivo com Recompensa:** Desafio intelectual prazeroso com retorno visual e sonoro imediato a cada palavra acertada.
- **Game Feel Premium:** Feedback háptico/sonoro suave, efeitos vítreos e transições elegantes.

---

## 2. Requisitos Funcionais (FR)

### FR-01: Roda de Letras Interativa (Word Wheel)
- **FR-01.1:** Apresentar letras sorteadas em formato circular ergonômico com cálculo polar equidistante.
- **FR-01.2:** Permitir entrada por:
  - Arrastar com linha elástica SVG em tempo real (touch/mouse).
  - Clique individual nos nós com confirmação central.
  - Digitação direta no teclado físico com `Enter` para submeter e `Backspace` para apagar.
- **FR-01.3:** Botão de **Embaralhar (🔀):** reordena as letras disponíveis com animação de giro (sem custo).
- **FR-01.4:** Botão de **Limpar / Desfazer (✖️):** remove a seleção atual.

### FR-02: Tabuleiro de Palavras Ocultas
- **FR-02.1:** Exibir todas as palavras da rodada organizadas por tamanho (ex: 3, 4, 5 e 6 letras).
- **FR-02.2:** Células não descobertas exibidas como slots translúcidos de vidro fosco.
- **FR-02.3:** Ao acertar uma palavra, preenchimento dinâmico com efeito de revelação 3D (*flip*) e destaque neon.
- **FR-02.4:** Suporte a **Palavras Bônus:** palavras válidas em português que não fazem parte do tabuleiro principal geram pontos extras no pote bônus (+25 pts).

### FR-03: Sistema de Dicas com Penalidade de Pontuação
- **FR-03.1: Dica de Revelação de Letra:** Revela uma letra aleatória de palavra oculta (-15% da pontuação).
- **FR-03.2: Dica Temática / Sinônimo:** Fornece a pista contextual do dicionário (-25% da pontuação).
- **FR-03.3: Avaliação por Estrelas:**
  - ⭐⭐⭐ (3 Estrelas): 100% das palavras resolvidas sem dicas (Multiplicador $\times 1.0$).
  - ⭐⭐ (2 Estrelas): Resolvido usando 1 dica (Multiplicador $\times 0.85$).
  - ⭐ (1 Estrela): Resolvido usando 2 ou mais dicas (Multiplicador $\times 0.60$).

### FR-04: Modo Ilimitado / Prática Contínua
- **FR-04.1:** Ao finalizar uma rodada, exibir modal de vitória com pontuação, estrelas obtidas, significados das palavras e botão **"Próximo Desafio ➔"**.
- **FR-04.2:** Transição suave entre rodadas sem recarregar a página.
- **FR-04.3:** Histórico da sessão salvo localmente (`localStorage`).

### FR-05: Validador de Idioma e Dicionário (PT-BR)
- **FR-05.1:** Normalização transparente de acentuação via Unicode NFD.
- **FR-05.2:** Banco de dados curado para evitar termos obscuros na grade principal.

---

## 3. Requisitos Não-Funcionais (NFR)

- **NFR-01 (Performance):** Tempo de carregamento < 1.0s; validação instantânea (< 50ms).
- **NFR-02 (Responsividade):** Layout adaptável para dispositivos móveis (360px a 430px) e desktops.
- **NFR-03 (Persistência):** Armazenamento em `localStorage` com recuperação resiliente.
- **NFR-04 (Acessibilidade):** Alto contraste, conformidade WCAG 2.2 AAA e alvos táteis generosos.
