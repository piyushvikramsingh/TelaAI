import React, { useState, useEffect } from 'react';
import { Plus, Brain, BookOpen, TrendingUp, Save, X, CheckCircle } from 'lucide-react';
import { jarvy } from '../services/jarvy';
import { AdvancedJarvyUtils } from '../services/advancedJarvy';
import toast from 'react-hot-toast';

interface TrainingData {
  concept: string;
  facts: string[];
  examples: string[];
}

interface ConversationTraining {
  query: string;
  response: string;
  rating: number;
}

const JarvyTraining: React.FC<{ darkMode?: boolean; onClose: () => void }> = ({ 
  darkMode = false, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'knowledge' | 'conversations' | 'metrics'>('knowledge');
  const [trainingData, setTrainingData] = useState<TrainingData>({
    concept: '',
    facts: [''],
    examples: ['']
  });
  const [conversationData, setConversationData] = useState<ConversationTraining[]>([
    { query: '', response: '', rating: 5 }
  ]);
  const [domain, setDomain] = useState('');
  const [isTraining, setIsTraining] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = () => {
    try {
      const aiMetrics = (jarvy as any).getPerformanceMetrics();
      setMetrics(aiMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const addFactField = () => {
    setTrainingData(prev => ({
      ...prev,
      facts: [...prev.facts, '']
    }));
  };

  const addExampleField = () => {
    setTrainingData(prev => ({
      ...prev,
      examples: [...prev.examples, '']
    }));
  };

  const updateFact = (index: number, value: string) => {
    setTrainingData(prev => ({
      ...prev,
      facts: prev.facts.map((fact, i) => i === index ? value : fact)
    }));
  };

  const updateExample = (index: number, value: string) => {
    setTrainingData(prev => ({
      ...prev,
      examples: prev.examples.map((example, i) => i === index ? value : example)
    }));
  };

  const removeFact = (index: number) => {
    setTrainingData(prev => ({
      ...prev,
      facts: prev.facts.filter((_, i) => i !== index)
    }));
  };

  const removeExample = (index: number) => {
    setTrainingData(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index)
    }));
  };

  const addConversation = () => {
    setConversationData(prev => [
      ...prev,
      { query: '', response: '', rating: 5 }
    ]);
  };

  const updateConversation = (index: number, field: keyof ConversationTraining, value: string | number) => {
    setConversationData(prev => 
      prev.map((conv, i) => i === index ? { ...conv, [field]: value } : conv)
    );
  };

  const removeConversation = (index: number) => {
    setConversationData(prev => prev.filter((_, i) => i !== index));
  };

  const trainKnowledge = async () => {
    if (!trainingData.concept.trim() || !domain.trim()) {
      toast.error('Please provide concept and domain');
      return;
    }

    const validFacts = trainingData.facts.filter(fact => fact.trim());
    const validExamples = trainingData.examples.filter(example => example.trim());

    if (validFacts.length === 0) {
      toast.error('Please provide at least one fact');
      return;
    }

    setIsTraining(true);
    try {
      (jarvy as any).addDomainKnowledge(domain, [{
        concept: trainingData.concept,
        facts: validFacts,
        examples: validExamples
      }]);

      toast.success(`Added knowledge about ${trainingData.concept}`);
      
      // Reset form
      setTrainingData({
        concept: '',
        facts: [''],
        examples: ['']
      });
      setDomain('');
      
      // Reload metrics
      loadMetrics();
    } catch (error) {
      toast.error('Failed to add knowledge');
      console.error('Training error:', error);
    } finally {
      setIsTraining(false);
    }
  };

  const trainConversations = async () => {
    const validConversations = conversationData.filter(
      conv => conv.query.trim() && conv.response.trim()
    );

    if (validConversations.length === 0) {
      toast.error('Please provide at least one valid conversation');
      return;
    }

    setIsTraining(true);
    try {
      await (jarvy as any).trainWithAdvancedData(validConversations);
      toast.success(`Trained with ${validConversations.length} conversations`);
      
      // Reset form
      setConversationData([{ query: '', response: '', rating: 5 }]);
      
      // Reload metrics
      loadMetrics();
    } catch (error) {
      toast.error('Failed to train conversations');
      console.error('Training error:', error);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-4xl max-h-[90vh] rounded-lg overflow-hidden ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Jarvy AI Training Center
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Enhance Jarvy's knowledge and capabilities
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex">
            {[
              { id: 'knowledge', label: 'Domain Knowledge', icon: BookOpen },
              { id: 'conversations', label: 'Conversations', icon: Brain },
              { id: 'metrics', label: 'AI Metrics', icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 border-b-2 font-medium ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : darkMode
                      ? 'border-transparent text-gray-400 hover:text-gray-300'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'knowledge' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Domain
                  </label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="e.g., technology, science, business"
                    className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Concept
                  </label>
                  <input
                    type="text"
                    value={trainingData.concept}
                    onChange={(e) => setTrainingData(prev => ({ ...prev, concept: e.target.value }))}
                    placeholder="e.g., Machine Learning"
                    className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Facts
                  </label>
                  <button
                    onClick={addFactField}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Fact</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {trainingData.facts.map((fact, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={fact}
                        onChange={(e) => updateFact(index, e.target.value)}
                        placeholder="Enter a fact about this concept"
                        className={`flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                        }`}
                      />
                      {trainingData.facts.length > 1 && (
                        <button
                          onClick={() => removeFact(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Examples
                  </label>
                  <button
                    onClick={addExampleField}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Example</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {trainingData.examples.map((example, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={example}
                        onChange={(e) => updateExample(index, e.target.value)}
                        placeholder="Enter an example (optional)"
                        className={`flex-1 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100'
                        }`}
                      />
                      {trainingData.examples.length > 1 && (
                        <button
                          onClick={() => removeExample(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={trainKnowledge}
                disabled={isTraining}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isTraining ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Training...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Add Knowledge</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'conversations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Training Conversations
                </h3>
                <button
                  onClick={addConversation}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Conversation</span>
                </button>
              </div>

              <div className="space-y-4">
                {conversationData.map((conv, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="space-y-3">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          User Query
                        </label>
                        <input
                          type="text"
                          value={conv.query}
                          onChange={(e) => updateConversation(index, 'query', e.target.value)}
                          placeholder="What the user might ask..."
                          className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode ? 'bg-gray-700 text-white' : 'bg-white'
                          }`}
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Expected Response
                        </label>
                        <textarea
                          value={conv.response}
                          onChange={(e) => updateConversation(index, 'response', e.target.value)}
                          placeholder="How Jarvy should respond..."
                          rows={3}
                          className={`w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode ? 'bg-gray-700 text-white' : 'bg-white'
                          }`}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Quality Rating:
                          </label>
                          <select
                            value={conv.rating}
                            onChange={(e) => updateConversation(index, 'rating', parseInt(e.target.value))}
                            className={`px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              darkMode ? 'bg-gray-700 text-white' : 'bg-white'
                            }`}
                          >
                            {[1, 2, 3, 4, 5].map(rating => (
                              <option key={rating} value={rating}>{rating} Star{rating !== 1 ? 's' : ''}</option>
                            ))}
                          </select>
                        </div>
                        
                        {conversationData.length > 1 && (
                          <button
                            onClick={() => removeConversation(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={trainConversations}
                disabled={isTraining}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isTraining ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Training...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    <span>Train Conversations</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'metrics' && (
            <div className="space-y-6">
              <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                AI Performance Metrics
              </h3>
              
              {metrics ? (
                <div className="grid grid-cols-2 gap-6">
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-750' : 'bg-blue-50'}`}>
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-8 h-8 text-blue-600" />
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{metrics.totalConcepts}</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Concepts</div>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-750' : 'bg-green-50'}`}>
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                      <div>
                        <div className="text-2xl font-bold text-green-600">
                          {Math.round(metrics.averageConfidence * 100)}%
                        </div>
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Avg Confidence</div>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-750' : 'bg-purple-50'}`}>
                    <div className="flex items-center space-x-3">
                      <Brain className="w-8 h-8 text-purple-600" />
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{metrics.totalRelations}</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Knowledge Links</div>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-750' : 'bg-orange-50'}`}>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-8 h-8 text-orange-600" />
                      <div>
                        <div className="text-2xl font-bold text-orange-600">{metrics.categories.length}</div>
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Categories</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Loading metrics...</p>
                </div>
              )}

              {metrics?.categories && (
                <div>
                  <h4 className={`text-md font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    Knowledge Categories
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {metrics.categories.map((category: string, index: number) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm ${
                          darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JarvyTraining;