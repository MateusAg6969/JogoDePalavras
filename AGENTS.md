# Diretrizes para Agentes de IA (AGENTS.md)

## Regras de Documentação e PRD
- **Localização de PRDs:** Os PRDs devem ser _sempre_ criados na raiz do projeto atual, seguindo o formato `docs/plans/{{YYYY-MM-DD}}-{{descrição}}.md`.
- Toda nova funcionalidade substancial deve ser precedida ou acompanhada pelo respectivo PRD no caminho especificado acima.

## Diretrizes de Implementação
- **Tecnologias:** Vanilla Web Core (HTML5, Modern CSS Glassmorphism, JavaScript ES6+ Modular, Web Audio API).
- **Sem Dependências Pesadas:** Manter o projeto leve, sem bundlers obrigatórios e sem frameworks pesados, garantindo carregamento instantâneo.
- **Acessibilidade & Ergonomia:** Preservar a conformidade com as diretrizes WCAG 2.2 AAA (alto contraste, alvos táteis mínimos de 48-60px e suporte a navegação por teclado).
- **Design Visual:** Priorizar o acabamento *Dark Glassmorphism* com feedback visual e sonoro em tempo real.
- **Qualidade de Código:** Preservar comentários explicativos, código modular, tipagem defensiva e persistência confiável em `localStorage`.
