import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { flashcardsApi } from '../../utils/toolsApi';

export default function FlashcardsTool() {
  const [view, setView] = useState('decks'); // 'decks', 'create-deck', 'deck-view', 'study'
  const [decks, setDecks] = useState([]);
  const [currentDeck, setCurrentDeck] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create deck form
  const [deckName, setDeckName] = useState('');
  const [deckSubject, setDeckSubject] = useState('');

  // Study mode
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyProgress, setStudyProgress] = useState({});

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const response = await flashcardsApi.getDecks();
      if (response.data.success) {
        setDecks(response.data.decks || []);
      }
    } catch (err) {
      console.error('Error fetching decks:', err);
    }
  };

  const handleCreateDeck = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await flashcardsApi.createDeck({ name: deckName, subject: deckSubject });
      if (response.data.success) {
        await fetchDecks();
        setView('decks');
        setDeckName('');
        setDeckSubject('');
      } else {
        setError(response.data.error || 'Failed to create deck');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async (front, back) => {
    if (!currentDeck) return;

    try {
      const response = await flashcardsApi.createCard({
        deck_id: currentDeck.id,
        front_text: front,
        back_text: back
      });

      if (response.data.success) {
        // Refresh deck data
        const deckResponse = await flashcardsApi.getCards(currentDeck.id);
        if (deckResponse.data.success) {
          setCurrentDeck({ ...currentDeck, cards: deckResponse.data.cards });
        }
      }
    } catch (err) {
      console.error('Error adding card:', err);
    }
  };

  const handleStudyCard = async (cardId, masteryChange) => {
    try {
      // Calculate new mastery level
      const card = currentDeck.cards.find(c => c.id === cardId);
      const newLevel = Math.max(0, Math.min(5, (card?.mastery_level || 0) + masteryChange));

      await flashcardsApi.updateMastery(cardId, newLevel);
    } catch (err) {
      console.error('Error updating card:', err);
    }
  };

  const handleOpenDeck = async (deck) => {
    try {
      const response = await flashcardsApi.getCards(deck.id);
      if (response.data.success) {
        setCurrentDeck({ ...deck, cards: response.data.cards || [] });
        setView('deck-view');
      }
    } catch (err) {
      console.error('Error fetching cards:', err);
    }
  };

  const handleStartStudy = () => {
    if (!currentDeck || !currentDeck.cards || currentDeck.cards.length === 0) return;
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStudyProgress({});
    setView('study');
  };

  const handleCardRating = async (rating) => {
    const currentCard = currentDeck.cards[currentCardIndex];
    const masteryChange = rating === 'easy' ? 1 : rating === 'good' ? 0 : -1;

    await handleStudyCard(currentCard.id, masteryChange);

    setStudyProgress(prev => ({
      ...prev,
      [currentCardIndex]: rating
    }));

    // Move to next card
    if (currentCardIndex < currentDeck.cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      // Study session complete
      setTimeout(() => handleOpenDeck(currentDeck), 1500);
    }
  };

  const renderDecksView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">My Flashcard Decks</h2>
        <button
          onClick={() => setView('create-deck')}
          className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          + New Deck
        </button>
      </div>

      {decks.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🃏</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No decks yet</h3>
          <p className="text-gray-500 mb-6">Create your first flashcard deck to start learning</p>
          <button
            onClick={() => setView('create-deck')}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Create Deck
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decks.map((deck) => (
            <motion.div
              key={deck.id}
              whileHover={{ scale: 1.03, y: -4 }}
              className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-all"
              onClick={() => handleOpenDeck(deck)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">🃏</div>
                <span className="text-xs text-gray-500">
                  {new Date(deck.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{deck.name}</h3>
              <p className="text-sm text-gray-600 mb-4">📚 {deck.subject}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {deck.card_count || 0} cards
                </span>
                <button className="bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full text-sm font-semibold hover:bg-yellow-200 transition-colors">
                  Study →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  const renderCreateDeckView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Create New Deck</h2>
        <button
          onClick={() => setView('decks')}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleCreateDeck} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Deck Name
          </label>
          <input
            type="text"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            placeholder="e.g., Spanish Vocabulary, Biology Terms, History Dates"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Subject
          </label>
          <input
            type="text"
            value={deckSubject}
            onChange={(e) => setDeckSubject(e.target.value)}
            placeholder="e.g., Spanish, Biology, History"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !deckName.trim() || !deckSubject.trim()}
          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Deck'}
        </button>
      </form>
    </motion.div>
  );

  const renderDeckView = () => {
    if (!currentDeck) return null;

    const [newFront, setNewFront] = useState('');
    const [newBack, setNewBack] = useState('');

    const addCard = async (e) => {
      e.preventDefault();
      if (newFront.trim() && newBack.trim()) {
        await handleAddCard(newFront, newBack);
        setNewFront('');
        setNewBack('');
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{currentDeck.name}</h2>
            <p className="text-gray-600">📚 {currentDeck.subject}</p>
          </div>
          <div className="flex items-center gap-3">
            {currentDeck.cards && currentDeck.cards.length > 0 && (
              <button
                onClick={handleStartStudy}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                📖 Study Now
              </button>
            )}
            <button
              onClick={() => setView('decks')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Add new card form */}
        <form onSubmit={addCard} className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Add New Card</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Front (Question)
              </label>
              <textarea
                value={newFront}
                onChange={(e) => setNewFront(e.target.value)}
                placeholder="Enter question or term"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                rows="3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Back (Answer)
              </label>
              <textarea
                value={newBack}
                onChange={(e) => setNewBack(e.target.value)}
                placeholder="Enter answer or definition"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                rows="3"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600 transition-colors"
          >
            + Add Card
          </button>
        </form>

        {/* Cards list */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-800">
            Cards ({currentDeck.cards?.length || 0})
          </h3>
          {!currentDeck.cards || currentDeck.cards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No cards yet. Add your first card above!
            </div>
          ) : (
            <div className="grid gap-3">
              {currentDeck.cards.map((card, idx) => (
                <div
                  key={card.id}
                  className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-yellow-300 transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 font-semibold mb-1">FRONT</div>
                      <p className="text-gray-800">{card.front_text}</p>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 font-semibold mb-1">BACK</div>
                      <p className="text-gray-800">{card.back_text}</p>
                    </div>
                  </div>
                  {card.mastery_level !== null && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-gray-500">Mastery:</span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${
                              i < card.mastery_level ? 'bg-yellow-500' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderStudyView = () => {
    if (!currentDeck || !currentDeck.cards || currentDeck.cards.length === 0) return null;

    const currentCard = currentDeck.cards[currentCardIndex];
    const progress = ((currentCardIndex + 1) / currentDeck.cards.length) * 100;
    const isComplete = currentCardIndex === currentDeck.cards.length - 1 && studyProgress[currentCardIndex];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">{currentDeck.name}</h2>
          <button
            onClick={() => handleOpenDeck(currentDeck)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕ Close
          </button>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Card {currentCardIndex + 1} of {currentDeck.cards.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {isComplete ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Study Session Complete!</h3>
            <p className="text-gray-600 mb-6">Great job! You've reviewed all cards in this deck.</p>
            <button
              onClick={() => handleOpenDeck(currentDeck)}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Back to Deck
            </button>
          </div>
        ) : (
          <>
            {/* Flashcard */}
            <div className="perspective-1000">
              <motion.div
                className="relative w-full h-80 cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-orange-100 border-4 border-yellow-400 rounded-2xl shadow-xl flex items-center justify-center p-8"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(0deg)'
                  }}
                >
                  <div className="text-center">
                    <div className="text-sm text-yellow-700 font-semibold mb-4">QUESTION</div>
                    <p className="text-2xl font-bold text-gray-800">{currentCard.front_text}</p>
                    <div className="mt-8 text-sm text-gray-500">Click to reveal answer</div>
                  </div>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-orange-100 to-yellow-100 border-4 border-orange-400 rounded-2xl shadow-xl flex items-center justify-center p-8"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="text-center" style={{ transform: 'rotateY(180deg)' }}>
                    <div className="text-sm text-orange-700 font-semibold mb-4">ANSWER</div>
                    <p className="text-2xl font-bold text-gray-800">{currentCard.back_text}</p>
                    <div className="mt-8 text-sm text-gray-500">Rate your knowledge below</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Rating buttons (only show when flipped) */}
            {isFlipped && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-3"
              >
                <button
                  onClick={() => handleCardRating('hard')}
                  className="bg-red-100 text-red-700 py-4 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                >
                  😰 Hard
                </button>
                <button
                  onClick={() => handleCardRating('good')}
                  className="bg-yellow-100 text-yellow-700 py-4 rounded-lg font-semibold hover:bg-yellow-200 transition-colors"
                >
                  🤔 Good
                </button>
                <button
                  onClick={() => handleCardRating('easy')}
                  className="bg-green-100 text-green-700 py-4 rounded-lg font-semibold hover:bg-green-200 transition-colors"
                >
                  😊 Easy
                </button>
              </motion.div>
            )}
          </>
        )}
      </motion.div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <AnimatePresence mode="wait">
        {view === 'decks' && renderDecksView()}
        {view === 'create-deck' && renderCreateDeckView()}
        {view === 'deck-view' && renderDeckView()}
        {view === 'study' && renderStudyView()}
      </AnimatePresence>
    </div>
  );
}
