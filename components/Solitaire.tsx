'use client';

import { useState, useCallback, useEffect } from 'react';
import { Win98Button } from './RetroUI';

// Card types
type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type Card = {
  suit: Suit;
  value: number; // 1=A, 11=J, 12=Q, 13=K
  faceUp: boolean;
  id: string;
};

type GameState = {
  stock: Card[];
  waste: Card[];
  foundations: Card[][]; // 4 piles, one per suit
  tableau: Card[][]; // 7 columns
};

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const SUIT_SYMBOLS: { [key in Suit]: string } = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};
const SUIT_COLORS: { [key in Suit]: string } = {
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-black',
  spades: 'text-black',
};

const createDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let value = 1; value <= 13; value++) {
      deck.push({
        suit,
        value,
        faceUp: false,
        id: `${suit}-${value}`,
      });
    }
  }
  return deck;
};

const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const dealGame = (): GameState => {
  const deck = shuffleDeck(createDeck());
  const tableau: Card[][] = [[], [], [], [], [], [], []];
  
  let cardIndex = 0;
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = { ...deck[cardIndex++] };
      card.faceUp = row === col; // Only top card is face up
      tableau[col].push(card);
    }
  }

  return {
    stock: deck.slice(cardIndex),
    waste: [],
    foundations: [[], [], [], []],
    tableau,
  };
};

const getValueDisplay = (value: number): string => {
  if (value === 1) return 'A';
  if (value === 11) return 'J';
  if (value === 12) return 'Q';
  if (value === 13) return 'K';
  return value.toString();
};

const isRed = (suit: Suit): boolean => suit === 'hearts' || suit === 'diamonds';

interface CardComponentProps {
  card: Card | null;
  onClick?: () => void;
  isSelected?: boolean;
  isEmpty?: boolean;
  isStock?: boolean;
}

const CardComponent: React.FC<CardComponentProps> = ({ card, onClick, isSelected, isEmpty, isStock }) => {
  if (isEmpty || !card) {
    return (
      <div 
        onClick={onClick}
        className={`w-10 h-14 border-2 border-dashed border-gray-400 rounded flex items-center justify-center
          ${onClick ? 'cursor-pointer hover:border-gray-600' : ''}
          ${isStock ? 'bg-green-800' : 'bg-green-900/30'}
        `}
      >
        {isStock && <span className="text-white text-xs">🔄</span>}
      </div>
    );
  }

  if (!card.faceUp) {
    return (
      <div 
        onClick={onClick}
        className="w-10 h-14 bg-blue-800 border border-white rounded cursor-pointer
          flex items-center justify-center shadow-sm"
        style={{
          background: 'repeating-linear-gradient(45deg, #1e3a8a, #1e3a8a 2px, #1e40af 2px, #1e40af 4px)',
        }}
      >
        <div className="w-7 h-10 border border-white/30 rounded-sm" />
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`w-10 h-14 bg-white border rounded cursor-pointer shadow-sm
        flex flex-col items-center justify-between p-0.5 text-xs font-bold
        ${isSelected ? 'ring-2 ring-yellow-400 ring-offset-1' : 'border-gray-300'}
        ${SUIT_COLORS[card.suit]}
        hover:shadow-md transition-shadow
      `}
    >
      <div className="self-start leading-none">
        <div>{getValueDisplay(card.value)}</div>
        <div className="text-[10px]">{SUIT_SYMBOLS[card.suit]}</div>
      </div>
      <div className="text-lg">{SUIT_SYMBOLS[card.suit]}</div>
    </div>
  );
};

export const Solitaire: React.FC = () => {
  const [game, setGame] = useState<GameState>(dealGame);
  const [selectedCard, setSelectedCard] = useState<{ source: string; index: number; cardIndex: number } | null>(null);
  const [moves, setMoves] = useState(0);
  const [hasWon, setHasWon] = useState(false);

  // Check for win condition
  useEffect(() => {
    const totalFoundation = game.foundations.reduce((sum, f) => sum + f.length, 0);
    if (totalFoundation === 52) {
      setHasWon(true);
    }
  }, [game.foundations]);

  const drawFromStock = useCallback(() => {
    setGame(prev => {
      const newStock = [...prev.stock];
      const newWaste = [...prev.waste];
      
      if (newStock.length === 0) {
        // Reset: move waste back to stock
        return {
          ...prev,
          stock: newWaste.reverse().map(c => ({ ...c, faceUp: false })),
          waste: [],
        };
      }
      
      const card = newStock.pop()!;
      card.faceUp = true;
      newWaste.push(card);
      
      return { ...prev, stock: newStock, waste: newWaste };
    });
    setMoves(m => m + 1);
  }, []);

  const canMoveToFoundation = (card: Card, foundation: Card[]): boolean => {
    if (foundation.length === 0) {
      return card.value === 1; // Only Ace can start a foundation
    }
    const topCard = foundation[foundation.length - 1];
    return card.suit === topCard.suit && card.value === topCard.value + 1;
  };

  const canMoveToTableau = (card: Card, tableau: Card[]): boolean => {
    if (tableau.length === 0) {
      return card.value === 13; // Only King can go to empty column
    }
    const topCard = tableau[tableau.length - 1];
    if (!topCard.faceUp) return false;
    return isRed(card.suit) !== isRed(topCard.suit) && card.value === topCard.value - 1;
  };

  const handleCardClick = (source: string, index: number, cardIndex: number = -1) => {
    // If clicking on stock
    if (source === 'stock') {
      drawFromStock();
      setSelectedCard(null);
      return;
    }

    // If no card is selected, select this one
    if (!selectedCard) {
      // Can't select from empty pile or face-down card
      if (source === 'waste' && game.waste.length > 0) {
        setSelectedCard({ source, index, cardIndex: game.waste.length - 1 });
      } else if (source === 'tableau' && game.tableau[index].length > 0) {
        const pile = game.tableau[index];
        const actualIndex = cardIndex >= 0 ? cardIndex : pile.length - 1;
        if (pile[actualIndex]?.faceUp) {
          setSelectedCard({ source, index, cardIndex: actualIndex });
        }
      } else if (source === 'foundation' && game.foundations[index].length > 0) {
        setSelectedCard({ source, index, cardIndex: game.foundations[index].length - 1 });
      }
      return;
    }

    // Try to move selected card
    setGame(prev => {
      const newGame = {
        stock: [...prev.stock],
        waste: [...prev.waste],
        foundations: prev.foundations.map(f => [...f]),
        tableau: prev.tableau.map(t => [...t]),
      };

      // Get the selected card(s)
      let cardsToMove: Card[] = [];
      if (selectedCard.source === 'waste') {
        cardsToMove = [newGame.waste[newGame.waste.length - 1]];
      } else if (selectedCard.source === 'tableau') {
        cardsToMove = newGame.tableau[selectedCard.index].slice(selectedCard.cardIndex);
      } else if (selectedCard.source === 'foundation') {
        cardsToMove = [newGame.foundations[selectedCard.index][newGame.foundations[selectedCard.index].length - 1]];
      }

      if (cardsToMove.length === 0) {
        return prev;
      }

      const cardToCheck = cardsToMove[0];
      let moved = false;

      // Try moving to foundation
      if (source === 'foundation' && cardsToMove.length === 1) {
        if (canMoveToFoundation(cardToCheck, newGame.foundations[index])) {
          newGame.foundations[index].push(cardToCheck);
          moved = true;
        }
      }

      // Try moving to tableau
      if (source === 'tableau' && !moved) {
        if (canMoveToTableau(cardToCheck, newGame.tableau[index])) {
          newGame.tableau[index].push(...cardsToMove);
          moved = true;
        }
      }

      if (moved) {
        // Remove cards from source
        if (selectedCard.source === 'waste') {
          newGame.waste.pop();
        } else if (selectedCard.source === 'tableau') {
          newGame.tableau[selectedCard.index] = newGame.tableau[selectedCard.index].slice(0, selectedCard.cardIndex);
          // Flip the new top card
          const pile = newGame.tableau[selectedCard.index];
          if (pile.length > 0 && !pile[pile.length - 1].faceUp) {
            pile[pile.length - 1].faceUp = true;
          }
        } else if (selectedCard.source === 'foundation') {
          newGame.foundations[selectedCard.index].pop();
        }
        setMoves(m => m + 1);
      }

      return moved ? newGame : prev;
    });

    setSelectedCard(null);
  };

  const resetGame = () => {
    setGame(dealGame());
    setSelectedCard(null);
    setMoves(0);
    setHasWon(false);
  };

  // Auto-move to foundation on double click
  const handleDoubleClick = (source: string, index: number) => {
    let card: Card | undefined;
    
    if (source === 'waste' && game.waste.length > 0) {
      card = game.waste[game.waste.length - 1];
    } else if (source === 'tableau' && game.tableau[index].length > 0) {
      card = game.tableau[index][game.tableau[index].length - 1];
    }

    if (!card || !card.faceUp) return;

    // Find matching foundation
    for (let i = 0; i < 4; i++) {
      if (canMoveToFoundation(card, game.foundations[i])) {
        setSelectedCard({ source, index, cardIndex: source === 'waste' ? game.waste.length - 1 : game.tableau[index].length - 1 });
        setTimeout(() => handleCardClick('foundation', i), 50);
        return;
      }
    }
  };

  return (
    <div className="bg-green-800 p-3 select-none min-w-[320px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 text-white font-retro text-xs">
        <span>Movimientos: {moves}</span>
        <Win98Button onClick={resetGame} className="text-xs px-2 py-0.5">
          Nueva partida
        </Win98Button>
      </div>

      {/* Top row: Stock, Waste, and Foundations */}
      <div className="flex gap-2 mb-4">
        {/* Stock */}
        <CardComponent 
          card={game.stock.length > 0 ? { ...game.stock[game.stock.length - 1], faceUp: false } : null}
          onClick={drawFromStock}
          isEmpty={game.stock.length === 0}
          isStock={game.stock.length === 0}
        />

        {/* Waste */}
        <div onDoubleClick={() => handleDoubleClick('waste', 0)}>
          <CardComponent 
            card={game.waste.length > 0 ? game.waste[game.waste.length - 1] : null}
            onClick={() => handleCardClick('waste', 0)}
            isSelected={selectedCard?.source === 'waste'}
            isEmpty={game.waste.length === 0}
          />
        </div>

        <div className="w-4" /> {/* Spacer */}

        {/* Foundations */}
        {game.foundations.map((foundation, i) => (
          <CardComponent 
            key={`foundation-${i}`}
            card={foundation.length > 0 ? foundation[foundation.length - 1] : null}
            onClick={() => handleCardClick('foundation', i)}
            isSelected={selectedCard?.source === 'foundation' && selectedCard.index === i}
            isEmpty={foundation.length === 0}
          />
        ))}
      </div>

      {/* Tableau */}
      <div className="flex gap-2">
        {game.tableau.map((pile, colIndex) => (
          <div key={`tableau-${colIndex}`} className="flex flex-col" style={{ minHeight: '100px' }}>
            {pile.length === 0 ? (
              <CardComponent 
                card={null}
                onClick={() => handleCardClick('tableau', colIndex)}
                isEmpty={true}
              />
            ) : (
              pile.map((card, cardIndex) => (
                <div 
                  key={card.id}
                  className={cardIndex > 0 ? '-mt-10' : ''}
                  style={{ zIndex: cardIndex }}
                  onDoubleClick={() => card.faceUp && handleDoubleClick('tableau', colIndex)}
                >
                  <CardComponent 
                    card={card}
                    onClick={() => handleCardClick('tableau', colIndex, cardIndex)}
                    isSelected={
                      selectedCard?.source === 'tableau' && 
                      selectedCard.index === colIndex && 
                      cardIndex >= selectedCard.cardIndex
                    }
                  />
                </div>
              ))
            )}
          </div>
        ))}
      </div>

      {/* Win message */}
      {hasWon && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-win-gray p-4 border-2 text-center" style={{ borderColor: '#fff #808080 #808080 #fff' }}>
            <p className="text-2xl mb-2">🎉 ¡Ganaste!</p>
            <p className="font-retro text-sm mb-4">Completaste el solitario en {moves} movimientos</p>
            <Win98Button onClick={resetGame}>Jugar de nuevo</Win98Button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-3 text-[10px] text-green-200 font-retro">
        <p>Click para seleccionar | Doble click para mover a fundación</p>
      </div>
    </div>
  );
};

