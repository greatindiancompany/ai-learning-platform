import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function StudyMusicTool() {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const musicGenres = [
    {
      id: 'lofi',
      name: 'Lo-Fi Beats',
      icon: '🎧',
      color: 'from-purple-400 to-purple-600',
      description: 'Relaxing lo-fi hip hop beats for focus',
      url: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&loop=1&playlist=jfKfPfyJRdk'
    },
    {
      id: 'classical',
      name: 'Classical',
      icon: '🎼',
      color: 'from-blue-400 to-blue-600',
      description: 'Classical music for concentration',
      url: 'https://www.youtube.com/embed/3wZ_sRxPj1o?autoplay=1&loop=1&playlist=3wZ_sRxPj1o'
    },
    {
      id: 'nature',
      name: 'Nature Sounds',
      icon: '🌿',
      color: 'from-green-400 to-green-600',
      description: 'Calming nature ambience',
      url: 'https://www.youtube.com/embed/eKFTSSKCzWA?autoplay=1&loop=1&playlist=eKFTSSKCzWA'
    },
    {
      id: 'rain',
      name: 'Rain Sounds',
      icon: '🌧️',
      color: 'from-cyan-400 to-cyan-600',
      description: 'Peaceful rain for studying',
      url: 'https://www.youtube.com/embed/mPZkdNFkNps?autoplay=1&loop=1&playlist=mPZkdNFkNps'
    },
    {
      id: 'jazz',
      name: 'Jazz',
      icon: '🎷',
      color: 'from-amber-400 to-amber-600',
      description: 'Smooth jazz instrumentals',
      url: 'https://www.youtube.com/embed/Dx5qFachd3A?autoplay=1&loop=1&playlist=Dx5qFachd3A'
    },
    {
      id: 'piano',
      name: 'Piano',
      icon: '🎹',
      color: 'from-indigo-400 to-indigo-600',
      description: 'Beautiful piano melodies',
      url: 'https://www.youtube.com/embed/3vfH42IHUv8?autoplay=1&loop=1&playlist=3vfH42IHUv8'
    },
    {
      id: 'biiba',
      name: 'Biiba',
      icon: '🎶',
      color: 'from-pink-400 to-rose-600',
      description: 'Upbeat study vibes',
      url: 'https://w.soundcloud.com/player/?url=https://soundcloud.com/chaippaani/biiba&auto_play=true&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=true',
      isSoundCloud: true
    }
  ];

  const handlePlay = (genre) => {
    setSelectedGenre(genre);
    setIsPlaying(true);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setSelectedGenre(null);
  };

  return (
    <div className="h-full overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={isMobile ? 'space-y-3' : 'space-y-6'}
      >
        {!isPlaying && (
          <div className="mb-3">
            <h2 className={`font-bold text-gray-800 ${isMobile ? 'text-xl mb-1' : 'text-2xl mb-2'}`}>
              Study Music
            </h2>
            {!isMobile && <p className="text-gray-600 text-sm">Focus music and ambient sounds to boost productivity</p>}
          </div>
        )}

        {isPlaying && selectedGenre ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={isMobile ? 'space-y-3' : 'space-y-4'}
          >
            <div className={`bg-gradient-to-r ${selectedGenre.color} text-white rounded-lg ${isMobile ? 'p-4' : 'p-6'}`}>
              <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-4'}`}>
                <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
                  <span className={isMobile ? 'text-3xl' : 'text-4xl'}>{selectedGenre.icon}</span>
                  <div>
                    <h3 className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}>{selectedGenre.name}</h3>
                    {!isMobile && <p className="text-white/90 text-sm">{selectedGenre.description}</p>}
                  </div>
                </div>
                <button
                  onClick={handleStop}
                  className={`bg-white/20 hover:bg-white/30 ${isMobile ? 'px-3 py-1.5 text-sm' : 'px-6 py-2'} rounded-lg font-semibold transition-colors backdrop-blur-sm`}
                >
                  ✕ {!isMobile && 'Stop'}
                </button>
              </div>

              {/* YouTube Player */}
              <div className="aspect-video rounded-lg overflow-hidden shadow-xl">
                <iframe
                  width="100%"
                  height="100%"
                  src={selectedGenre.url}
                  title={selectedGenre.name}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-6">
              <h4 className="font-bold text-gray-800 mb-2">💡 Study Tips:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Keep volume at 30-50% for optimal focus</li>
                <li>• Use headphones for better immersion</li>
                <li>• Take breaks every 25-45 minutes</li>
                <li>• Instrumental music works best for reading/writing</li>
              </ul>
            </div>

            <button
              onClick={() => setIsPlaying(false)}
              className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              ← Choose Different Music
            </button>
          </motion.div>
        ) : (
          <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}`}>
            {musicGenres.map((genre) => (
              <motion.button
                key={genre.id}
                whileHover={!isMobile ? { scale: 1.05, y: -5 } : {}}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePlay(genre)}
                className={`bg-gradient-to-br ${genre.color} text-white rounded-lg ${isMobile ? 'p-3' : 'p-6'} text-left shadow-lg hover:shadow-xl transition-all`}
              >
                <div className={isMobile ? 'text-4xl mb-2' : 'text-5xl mb-3'}>{genre.icon}</div>
                <h3 className={`font-bold ${isMobile ? 'text-base mb-1' : 'text-xl mb-2'}`}>{genre.name}</h3>
                {!isMobile && <p className="text-white/90 text-sm mb-4">{genre.description}</p>}
                <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'} font-semibold`}>
                  <span>▶</span>
                  <span>{isMobile ? 'Play' : 'Play Now'}</span>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
