import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { imagesApi } from '../../utils/toolsApi';

export default function ImageAnalysisTool() {
  const [view, setView] = useState('list'); // 'list', 'upload', 'result'
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [subject, setSubject] = useState('general');
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const response = await imagesApi.getAll();
      if (response.data.success) {
        setAnalyses(response.data.analyses || []);
      }
    } catch (err) {
      console.error('Error fetching analyses:', err);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!imageFile) return;

    setLoading(true);
    setError(null);

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;

        try {
          const response = await imagesApi.analyze({
            image_url: base64Image,
            subject
          });

          if (response.data.success) {
            setCurrentAnalysis(response.data.analysis);
            setView('result');
            setImageFile(null);
            setImagePreview(null);
          } else {
            setError(response.data.error || 'Failed to analyze image');
          }
        } catch (err) {
          setError(err.response?.data?.error || 'Network error. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(imageFile);
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  const renderListView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Image Analysis</h2>
        <button
          onClick={() => setView('upload')}
          className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          + Upload Image
        </button>
      </div>

      {analyses.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No analyses yet</h3>
          <p className="text-gray-500 mb-6">Upload an image for AI-powered analysis and homework help</p>
          <button
            onClick={() => setView('upload')}
            className="bg-gradient-to-r from-blue-400 to-cyan-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Upload Image
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {analyses.map((analysis) => (
            <motion.div
              key={analysis.id}
              whileHover={{ scale: 1.01 }}
              className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-cyan-400 transition-all cursor-pointer"
              onClick={() => {
                setCurrentAnalysis(analysis);
                setView('result');
              }}
            >
              <div className="flex items-start gap-4">
                {analysis.image_url && (
                  <img
                    src={analysis.image_url}
                    alt="Analyzed"
                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-semibold capitalize">
                      {analysis.subject}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(analysis.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {analysis.analysis_result || 'Analysis pending...'}
                  </p>
                </div>
                <button className="bg-cyan-100 text-cyan-700 px-4 py-2 rounded-lg font-semibold hover:bg-cyan-200 transition-colors">
                  View →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  const renderUploadView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Upload Image</h2>
        <button
          onClick={() => setView('list')}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleAnalyze} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-dashed border-blue-300 rounded-lg p-8 text-center">
          {imagePreview ? (
            <div className="space-y-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                Change Image
              </button>
            </div>
          ) : (
            <label className="cursor-pointer">
              <div className="text-6xl mb-4">📸</div>
              <div className="text-lg font-semibold text-gray-700 mb-2">
                Click to upload or drag and drop
              </div>
              <div className="text-sm text-gray-500 mb-4">
                PNG, JPG, GIF up to 10MB
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <div className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                Select Image
              </div>
            </label>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Subject Area
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['general', 'math', 'science', 'language', 'history', 'other'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSubject(s)}
                className={`py-3 px-4 rounded-lg font-semibold capitalize transition-all ${
                  subject === s
                    ? 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !imageFile}
          className="w-full bg-gradient-to-r from-blue-400 to-cyan-500 text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Analyzing with AI...
            </span>
          ) : (
            '🔍 Analyze Image'
          )}
        </button>
      </form>
    </motion.div>
  );

  const renderResultView = () => {
    if (!currentAnalysis) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Analysis Result</h2>
          <button
            onClick={() => { setView('list'); fetchAnalyses(); }}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back
          </button>
        </div>

        {currentAnalysis.image_url && (
          <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
            <img
              src={currentAnalysis.image_url}
              alt="Analyzed"
              className="max-w-full max-h-96 mx-auto rounded-lg"
            />
          </div>
        )}

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🔍</span>
            <h3 className="text-lg font-bold text-gray-800">Analysis</h3>
            <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-semibold capitalize ml-auto">
              {currentAnalysis.subject}
            </span>
          </div>
          <div className="text-gray-800 whitespace-pre-wrap">
            {currentAnalysis.analysis_result}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setView('upload')}
            className="flex-1 bg-gradient-to-r from-blue-400 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Analyze Another Image
          </button>
          <button
            onClick={() => { setView('list'); fetchAnalyses(); }}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            View All Analyses
          </button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <AnimatePresence mode="wait">
        {view === 'list' && renderListView()}
        {view === 'upload' && renderUploadView()}
        {view === 'result' && renderResultView()}
      </AnimatePresence>
    </div>
  );
}
