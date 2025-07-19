import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Square } from 'lucide-react';

const codeSnippet = `import React from 'react';
import { motion } from 'framer-motion';

// AI-generated component for a dynamic UI element
const DynamicCard = () => {
  return (
    <motion.div
      className="bg-gradient-to-br from-white/20 to-white/5 p-6 rounded-xl shadow-lg border border-white/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <motion.h3 
        className="text-xl font-bold text-white mb-2 font-orbitron"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Analysis Complete
      </motion.h3>
      <motion.p 
        className="text-gray-300 font-inter"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        Tela.ai has processed the data stream.
        Ready for the next command.
      </motion.p>
    </motion.div>
  );
};

export default DynamicCard;
`;

const RealtimeDemo: React.FC = () => {
  const [displayedCode, setDisplayedCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleToggleDemo = () => {
    if (isRunning) {
      setIsRunning(false); // This will stop and reset via useEffect cleanup
    } else {
      setIsRunning(true);
    }
  };

  useEffect(() => {
    let typingInterval: NodeJS.Timeout;
    if (isRunning) {
      let i = 0;
      setDisplayedCode('');
      setIsComplete(false);
      typingInterval = setInterval(() => {
        setDisplayedCode(codeSnippet.substring(0, i));
        i++;
        if (i > codeSnippet.length) {
          clearInterval(typingInterval);
          setIsRunning(false);
          setIsComplete(true);
        }
      }, 15);
    } else {
      // If stopped manually, clear the code
      setDisplayedCode('');
    }
    return () => clearInterval(typingInterval);
  }, [isRunning]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 backdrop-blur-sm border-2 border-white/30 rounded-2xl p-2"
    >
      <div className="bg-black/50 rounded-xl aspect-video flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-700/50">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="text-gray-400 text-sm font-mono hidden sm:block">
            /src/components/AIGenerated.tsx
          </div>
          <button
            onClick={handleToggleDemo}
            className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-semibold transition-colors ${
              isRunning
                ? 'bg-red-500/80 hover:bg-red-500 text-white'
                : 'bg-green-500/80 hover:bg-green-500 text-white'
            }`}
          >
            {isRunning ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isRunning ? 'Stop' : isComplete ? 'Re-run Demo' : 'Run Demo'}
          </button>
        </div>

        {/* Code Area */}
        <div className="flex-1 p-4 overflow-auto font-mono text-sm text-gray-300 relative">
          <pre>
            <code>
              {displayedCode}
              {isRunning && <span className="inline-block w-2 h-4 bg-white animate-pulse ml-1"></span>}
            </code>
          </pre>
          {displayedCode.length === 0 && !isRunning && (
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-500 p-4">
                    <Play className="h-16 w-16 mx-auto mb-4 opacity-30"/>
                    <p className="font-semibold">Click 'Run Demo' to start the simulation</p>
                    <p className="text-sm mt-1">Watch Tela.ai generate code in real-time.</p>
                </div>
             </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RealtimeDemo;
