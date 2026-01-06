import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScienceLabTool() {
  const [selectedExperiment, setSelectedExperiment] = useState(null);
  const [experimentData, setExperimentData] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const experiments = [
    {
      id: 'ph-test',
      title: 'pH Testing',
      icon: '🧪',
      subject: 'Chemistry',
      color: 'from-green-400 to-emerald-500',
      description: 'Test the acidity or alkalinity of substances',
      steps: [
        'Select a substance to test',
        'Add pH indicator',
        'Observe color change',
        'Record pH value'
      ],
      substances: ['Lemon Juice', 'Water', 'Baking Soda', 'Vinegar', 'Milk'],
      results: {
        'Lemon Juice': { ph: 2, color: 'bg-red-400', label: 'Acidic' },
        'Water': { ph: 7, color: 'bg-green-400', label: 'Neutral' },
        'Baking Soda': { ph: 9, color: 'bg-blue-400', label: 'Alkaline' },
        'Vinegar': { ph: 3, color: 'bg-orange-400', label: 'Acidic' },
        'Milk': { ph: 6.5, color: 'bg-yellow-400', label: 'Slightly Acidic' }
      }
    },
    {
      id: 'plant-growth',
      title: 'Plant Growth',
      icon: '🌱',
      subject: 'Biology',
      color: 'from-green-500 to-lime-500',
      description: 'Study factors affecting plant growth',
      steps: [
        'Choose growth conditions',
        'Observe growth over time',
        'Record measurements',
        'Analyze results'
      ],
      conditions: ['Sunlight', 'Partial Shade', 'No Light', 'Extra Water', 'No Water'],
      results: {
        'Sunlight': { growth: '10cm', health: 'Excellent', color: 'bg-green-500' },
        'Partial Shade': { growth: '7cm', health: 'Good', color: 'bg-green-400' },
        'No Light': { growth: '2cm', health: 'Poor', color: 'bg-yellow-400' },
        'Extra Water': { growth: '5cm', health: 'Fair', color: 'bg-blue-400' },
        'No Water': { growth: '1cm', health: 'Very Poor', color: 'bg-red-400' }
      }
    },
    {
      id: 'density',
      title: 'Density Comparison',
      icon: '⚖️',
      subject: 'Physics',
      color: 'from-blue-400 to-indigo-500',
      description: 'Compare densities of different liquids',
      steps: [
        'Select liquids to test',
        'Pour into container',
        'Observe layering',
        'Calculate densities'
      ],
      liquids: ['Water', 'Oil', 'Honey', 'Alcohol', 'Dish Soap'],
      results: {
        'Honey': { density: 1.42, layer: 5, color: 'bg-amber-600' },
        'Dish Soap': { density: 1.06, layer: 4, color: 'bg-blue-300' },
        'Water': { density: 1.00, layer: 3, color: 'bg-blue-400' },
        'Oil': { density: 0.92, layer: 2, color: 'bg-yellow-300' },
        'Alcohol': { density: 0.79, layer: 1, color: 'bg-gray-300' }
      }
    },
    {
      id: 'circuit',
      title: 'Electric Circuit',
      icon: '💡',
      subject: 'Physics',
      color: 'from-yellow-400 to-orange-500',
      description: 'Build and test simple electrical circuits',
      steps: [
        'Connect battery to circuit',
        'Add components',
        'Close the circuit',
        'Observe results'
      ],
      components: ['LED', 'Resistor', 'Switch', 'Motor', 'Buzzer'],
      results: {
        'LED': { works: true, brightness: 'Bright', current: '20mA' },
        'Resistor': { works: true, brightness: 'Dim', current: '10mA' },
        'Switch': { works: true, brightness: 'Variable', current: '0-20mA' },
        'Motor': { works: true, brightness: 'N/A', current: '50mA' },
        'Buzzer': { works: true, brightness: 'N/A', current: '30mA' }
      }
    }
  ];

  const runExperiment = (substance) => {
    setExperimentData({
      substance,
      result: selectedExperiment.results[substance],
      timestamp: new Date().toLocaleTimeString()
    });
  };

  return (
    <div className="h-full overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={isMobile ? 'space-y-3' : 'space-y-6'}
      >
        {!selectedExperiment && (
          <div className="mb-3">
            <h2 className={`font-bold text-gray-800 ${isMobile ? 'text-xl mb-1' : 'text-2xl mb-2'}`}>
              Science Lab
            </h2>
            {!isMobile && <p className="text-gray-600 text-sm">Interactive virtual experiments and simulations</p>}
          </div>
        )}

        {!selectedExperiment ? (
          <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-2 gap-4'}`}>
            {experiments.map((exp) => (
              <motion.button
                key={exp.id}
                whileHover={!isMobile ? { scale: 1.03, y: -5 } : {}}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedExperiment(exp)}
                className={`bg-gradient-to-br ${exp.color} text-white rounded-lg ${isMobile ? 'p-4' : 'p-6'} text-left shadow-lg hover:shadow-xl transition-all`}
              >
                <div className={isMobile ? 'text-4xl mb-2' : 'text-5xl mb-3'}>{exp.icon}</div>
                <h3 className={`font-bold ${isMobile ? 'text-lg mb-1' : 'text-xl mb-2'}`}>{exp.title}</h3>
                <p className="text-xs bg-white/20 inline-block px-2 py-1 rounded-full mb-2">
                  {exp.subject}
                </p>
                <p className={`text-white/90 ${isMobile ? 'text-xs mb-2' : 'text-sm mb-4'}`}>{exp.description}</p>
                <div className="text-sm font-semibold">Start Experiment →</div>
              </motion.button>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedExperiment.icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{selectedExperiment.title}</h3>
                    <p className="text-sm text-gray-600">{selectedExperiment.subject}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedExperiment(null);
                    setExperimentData({});
                  }}
                  className="text-gray-500 hover:text-gray-700 font-semibold"
                >
                  ← Back
                </button>
              </div>

              {/* Steps */}
              <div className={`bg-gradient-to-r ${selectedExperiment.color} text-white rounded-lg p-6`}>
                <h4 className="font-bold mb-3">Experiment Steps:</h4>
                <ol className="space-y-2">
                  {selectedExperiment.steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="font-bold">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Controls */}
              <div className={`bg-white border-2 border-gray-200 rounded-lg ${isMobile ? 'p-4' : 'p-6'}`}>
                <h4 className={`font-bold text-gray-800 ${isMobile ? 'text-sm mb-3' : 'mb-4'}`}>
                  Select {selectedExperiment.substances ? 'Substance' : selectedExperiment.conditions ? 'Condition' : selectedExperiment.liquids ? 'Liquid' : 'Component'}:
                </h4>
                <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-2 md:grid-cols-3 gap-3'}`}>
                  {(selectedExperiment.substances || selectedExperiment.conditions || selectedExperiment.liquids || selectedExperiment.components).map((item) => (
                    <button
                      key={item}
                      onClick={() => runExperiment(item)}
                      className={`${isMobile ? 'py-2 px-3 text-sm' : 'py-3 px-4'} rounded-lg font-semibold transition-all ${
                        experimentData.substance === item
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results */}
              {experimentData.result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl">✓</span>
                    <h4 className="font-bold text-gray-800">Results: {experimentData.substance}</h4>
                  </div>
                  <div className="space-y-3">
                    {Object.entries(experimentData.result).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="font-semibold text-gray-700 capitalize">{key}:</span>
                        {key === 'color' || key === 'layer' ? (
                          <div className={`${value} w-32 h-8 rounded-lg border-2 border-gray-300`} />
                        ) : (
                          <span className="text-gray-800">{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
                        )}
                      </div>
                    ))}
                    <div className="text-xs text-gray-500 mt-4">
                      Recorded at: {experimentData.timestamp}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Educational Note */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>💡 Note:</strong> This is a simplified simulation. Real laboratory experiments require proper equipment, safety measures, and supervision.
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
