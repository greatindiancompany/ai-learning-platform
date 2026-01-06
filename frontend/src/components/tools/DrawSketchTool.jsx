import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function DrawSketchTool() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState('pen'); // 'pen' or 'eraser'
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `sketch-${Date.now()}.png`;
    link.href = dataURL;
    link.click();
  };

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#008000', '#FFC0CB', '#A52A2A'
  ];

  return (
    <div className="h-full overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        {/* Toolbar */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200 rounded-lg p-3">
          <div className={`${isMobile ? 'space-y-3' : 'flex flex-wrap items-center gap-4'}`}>
            {/* Tool selector */}
            <div className="flex gap-2">
              <button
                onClick={() => setTool('pen')}
                className={`flex-1 px-3 py-2 rounded-lg font-semibold transition-all text-sm ${
                  tool === 'pen'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                ✏️ Pen
              </button>
              <button
                onClick={() => setTool('eraser')}
                className={`flex-1 px-3 py-2 rounded-lg font-semibold transition-all text-sm ${
                  tool === 'eraser'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                🧹 Eraser
              </button>
            </div>

            {/* Color picker */}
            {tool === 'pen' && (
              <div className={`flex ${isMobile ? 'gap-1.5' : 'gap-2'} items-center ${isMobile ? 'justify-center' : ''}`}>
                {!isMobile && <span className="text-sm font-semibold text-gray-700">Color:</span>}
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`${isMobile ? 'w-7 h-7' : 'w-8 h-8'} rounded-full border-2 transition-all ${
                      color === c ? 'border-blue-500 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}

            {/* Brush size */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Size:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className={`${isMobile ? 'flex-1' : 'w-32'} accent-blue-500`}
              />
              <span className="text-sm text-gray-600 w-8">{brushSize}px</span>
            </div>

            {/* Actions */}
            <div className={`flex gap-2 ${isMobile ? 'w-full' : 'ml-auto'}`}>
              <button
                onClick={clearCanvas}
                className={`${isMobile ? 'flex-1' : ''} px-3 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors text-sm`}
              >
                🗑️ {isMobile ? '' : 'Clear'}
              </button>
              <button
                onClick={saveDrawing}
                className={`${isMobile ? 'flex-1' : ''} px-3 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors text-sm`}
              >
                💾 {isMobile ? '' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-2 shadow-lg">
          <canvas
            ref={canvasRef}
            width={isMobile ? 400 : 800}
            height={isMobile ? 400 : 600}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
              });
              startDrawing(mouseEvent);
            }}
            onTouchMove={(e) => {
              e.preventDefault();
              const touch = e.touches[0];
              const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
              });
              draw(mouseEvent);
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              stopDrawing();
            }}
            className="border-2 border-gray-300 rounded-lg cursor-crosshair w-full"
            style={{ touchAction: 'none' }}
          />
        </div>

        {/* Tips - Compact on mobile */}
        {!isMobile && (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-3">
            <h4 className="font-bold text-gray-800 mb-2 text-sm">💡 Tips:</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• Use different colors to highlight concepts</li>
              <li>• Draw diagrams, flowcharts, and mind maps</li>
              <li>• Save your work frequently</li>
            </ul>
          </div>
        )}
      </motion.div>
    </div>
  );
}
