// Memory Game Component (versão com IMAGENS)
AFRAME.registerComponent('memory-game', {
  init: function () {
    this.cards = [];
    this.flippedCards = [];
    this.pairsFound = 0;
    this.canFlip = true;

    // 🔹 Lista de imagens (8 pares = 16 itens). Troque pelos seus arquivos.
    this.cardImages = [
      'assets/captain.jpeg','assets/captain.jpeg',
      'assets/hulk.jpeg','assets/hulk.jpeg',
      'assets/panter.jpeg','assets/panter.jpeg',
      'assets/spider.jpeg','assets/spider.jpeg',
      'assets/tanos.jpeg','assets/tanos.jpeg',
      'assets/wolve.jpeg','assets/wolve.jpeg',
      'img/07.png','img/07.png',
      'img/08.png','img/08.png'
    ];

    // Quantidade real de pares
    this.totalPairs = this.cardImages.length / 2;

    // Monta pares (agora só com imagem)
    this.cardPairs = this.cardImages.map(src => ({ image: src }));

    // Embaralha
    this.shuffle(this.cardPairs);

    // Cria tabuleiro quando a cena estiver pronta
    this.el.sceneEl.addEventListener('loaded', () => {
      this.createBoard();
    });

    // Botão de reiniciar
    const restartButton = document.getElementById('restart-button');
    if (restartButton) {
      restartButton.addEventListener('click', () => this.resetGame());
    }
  },

  shuffle: function (array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },

  createBoard: function () {
    const gameBoard = document.getElementById('game-board');

    // Limpa cards antigos
    while (gameBoard && gameBoard.firstChild) {
      gameBoard.removeChild(gameBoard.firstChild);
    }
    this.cards = [];
    this.flippedCards = [];
    this.pairsFound = 0;
    const scoreEl = document.getElementById('score');
    if (scoreEl) scoreEl.textContent = 'Pairs Found: 0';

    // Dimensões
    const cardWidth = 0.4;
    const cardHeight = 0.4;
    const gap = 0.1;
    const cols = 4;
    const rows = 4;

    // Cálculo de grade
    const boardWidth = cols * cardWidth + (cols - 1) * gap;
    const boardHeight = rows * cardHeight + (rows - 1) * gap;
    const startX = -boardWidth / 2 + cardWidth / 2;
    const startY = boardHeight / 2 - cardHeight / 2;

    // Cria os 16 cards
    let cardIndex = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = startX + col * (cardWidth + gap);
        const y = startY - row * (cardHeight + gap);
        const cardPair = this.cardPairs[cardIndex];

        // Entidade do card
        const card = document.createElement('a-entity');
        card.setAttribute('position', `${x} ${y} 0`);
        card.setAttribute('data-index', cardIndex);
        card.setAttribute('data-image', cardPair.image);
        card.setAttribute('class', 'card');

        // Frente (verso fechado) clicável
        const cardFront = document.createElement('a-plane');
        cardFront.setAttribute('width', cardWidth);
        cardFront.setAttribute('height', cardHeight);
        cardFront.setAttribute('color', '#1E90FF');
        cardFront.setAttribute('position', '0 0 0.01');
        cardFront.setAttribute('class', 'card-front clickable');
        // Hover suave
        cardFront.setAttribute('card-hover', '');

        // ? na frente
        const questionMark = document.createElement('a-text');
        questionMark.setAttribute('value', '?');
        questionMark.setAttribute('color', 'white');
        questionMark.setAttribute('position', '0 0 0.02');
        questionMark.setAttribute('align', 'center');
        questionMark.setAttribute('width', 2);
        questionMark.setAttribute('scale', '0.5 0.5 0.5');
        cardFront.appendChild(questionMark);

        // Clique no front
        cardFront.addEventListener('click', () => {
          this.flipCard(card);
        });

        // Fundo do lado revelado (branco)
        const cardBackBg = document.createElement('a-plane');
        cardBackBg.setAttribute('width', cardWidth);
        cardBackBg.setAttribute('height', cardHeight);
        cardBackBg.setAttribute('color', '#FFFFFF');
        cardBackBg.setAttribute('position', '0 0 0');
        cardBackBg.setAttribute('visible', 'false');
        cardBackBg.setAttribute('class', 'card-back-bg');

        // Imagem do card (invisível até virar)
        const imageEl = document.createElement('a-plane');
        imageEl.setAttribute('width', cardWidth);
        imageEl.setAttribute('height', cardHeight);
        imageEl.setAttribute('material', `src: url(${cardPair.image}); shader: flat`);
        imageEl.setAttribute('position', '0 0 0.001');
        imageEl.setAttribute('visible', 'false');
        imageEl.setAttribute('class', 'card-image');

        // Monta card
        card.appendChild(cardFront);
        card.appendChild(cardBackBg);
        card.appendChild(imageEl);

        // Adiciona no tabuleiro e salva referência
        if (gameBoard) gameBoard.appendChild(card);
        this.cards.push(card);

        cardIndex++;
      }
    }

    // Permite virar novamente
    this.canFlip = true;

    console.log(`Criado tabuleiro com ${this.cards.length} cartas`);
  },

  flipCard: function (card) {
    // Bloqueios
    if (!this.canFlip) return;
    if (this.flippedCards.includes(card)) return;

    const cardFront = card.querySelector('.card-front');
    const cardBackBg = card.querySelector('.card-back-bg');
    const imageEl = card.querySelector('.card-image');

    // Se já está revelado, ignora
    if (imageEl.getAttribute('visible') === true) return;

    // Virar
    cardFront.setAttribute('visible', false);
    cardFront.classList.remove('clickable');
    cardBackBg.setAttribute('visible', true);
    imageEl.setAttribute('visible', true);

    // Guarda virada
    this.flippedCards.push(card);

    // Se 2 viradas, checa par
    if (this.flippedCards.length === 2) {
      this.canFlip = false;
      setTimeout(() => this.checkMatch(), 1000);
    }
  },

  checkMatch: function () {
    const card1 = this.flippedCards[0];
    const card2 = this.flippedCards[1];

    const img1 = card1.getAttribute('data-image');
    const img2 = card2.getAttribute('data-image');

    if (img1 === img2) {
      // Par encontrado
      this.pairsFound++;

      const scoreEl = document.getElementById('score');
      if (scoreEl) scoreEl.textContent = `Pairs Found: ${this.pairsFound}`;

      const messageEl = document.getElementById('message');
      if (messageEl) {
        messageEl.textContent = 'Match found!';
        setTimeout(() => { messageEl.textContent = ''; }, 1500);
      }

      // Mantém reveladas
      this.flippedCards = [];

      // Vitória?
      if (this.pairsFound === this.totalPairs) {
        this.gameComplete();
      }
    } else {
      // Não deu match: desvira
      this.flippedCards.forEach(card => {
        const cardFront = card.querySelector('.card-front');
        const cardBackBg = card.querySelector('.card-back-bg');
        const imageEl = card.querySelector('.card-image');

        cardFront.setAttribute('visible', true);
        cardFront.classList.add('clickable');
        cardBackBg.setAttribute('visible', false);
        imageEl.setAttribute('visible', false);
      });

      const messageEl = document.getElementById('message');
      if (messageEl) {
        messageEl.textContent = 'No match!';
        setTimeout(() => { messageEl.textContent = ''; }, 1500);
      }

      this.flippedCards = [];
    }

    // Libera viradas novamente
    this.canFlip = true;
  },

  gameComplete: function () {
    const victoryMessage = document.getElementById('victory-message');
    if (victoryMessage) {
      victoryMessage.setAttribute('visible', true);
      victoryMessage.setAttribute('text', 'opacity', 1);
    }

    const restartButton = document.getElementById('restart-button');
    if (restartButton) restartButton.setAttribute('visible', true);

    const messageEl = document.getElementById('message');
    if (messageEl) messageEl.textContent = 'Congratulations! You found all pairs!';
  },

  resetGame: function () {
    // Reseta estado
    this.flippedCards = [];
    this.pairsFound = 0;

    const scoreEl = document.getElementById('score');
    if (scoreEl) scoreEl.textContent = 'Pairs Found: 0';

    const messageEl = document.getElementById('message');
    if (messageEl) messageEl.textContent = '';

    const victoryMessage = document.getElementById('victory-message');
    if (victoryMessage) victoryMessage.setAttribute('visible', false);

    const restartButton = document.getElementById('restart-button');
    if (restartButton) restartButton.setAttribute('visible', false);

    // Embaralha e recria
    this.shuffle(this.cardPairs);
    this.createBoard();
  }
});

// Componente auxiliar para melhorar o cursor
AFRAME.registerComponent('cursor-feedback', {
  init: function () {
    var el = this.el;

    el.addEventListener('mouseenter', function () {
      el.setAttribute('material', 'color', '#4CAF50');
    });

    el.addEventListener('mouseleave', function () {
      el.setAttribute('material', 'color', 'white');
    });

    el.addEventListener('click', function () {
      console.log('Cursor click detectado');
    });
  }
});

// Hover das cartas (sem animation)
AFRAME.registerComponent('card-hover', {
  init: function () {
    const el = this.el;
    const originalColor = '#1E90FF';
    const hoverColor = '#64B5F6';

    el.addEventListener('mouseenter', () => {
      el.setAttribute('material', 'color', hoverColor);
    });

    el.addEventListener('mouseleave', () => {
      el.setAttribute('material', 'color', originalColor);
    });
  }
});
