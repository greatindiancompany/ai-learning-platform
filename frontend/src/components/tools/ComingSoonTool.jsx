import { motion } from 'framer-motion';
import { Wrench } from 'lucide-react';

export default function ComingSoonTool({ toolName, toolIcon, toolDescription }) {
  return (
    <div className="p-12 max-w-2xl mx-auto text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="inline-block text-8xl mb-6"
      >
        {toolIcon}
      </motion.div>
      <h2 className="text-4xl font-bold text-gray-800 mb-3">{toolName}</h2>
      <p className="text-gray-600 text-lg mb-8">{toolDescription}</p>
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Wrench className="w-6 h-6 text-yellow-600" />
          <h3 className="font-bold text-lg text-yellow-800">Under Construction</h3>
        </div>
        <p className="text-yellow-700">
          This tool is being built! Check back soon for awesome features.
        </p>
      </div>
    </div>
  );
}
