import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';

const FAQPage: React.FC = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: 'What is Tela.ai and how does it work?',
      answer: 'Tela.ai is an advanced AI platform that combines multiple AI capabilities into a single, powerful interface. It uses cutting-edge language models and neural networks to assist with tasks like content generation, code development, design creation, and data analysis. Simply input your request, and our AI will provide intelligent, contextual responses.'
    },
    {
      question: 'Is my data secure and private?',
      answer: 'Yes, we take data security very seriously. All data is encrypted in transit and at rest using industry-standard encryption protocols. We don\'t sell your data to third parties, and you maintain full control over your information. You can delete your data at any time through your account settings.'
    },
    {
      question: 'What programming languages does Tela.ai support?',
      answer: 'Tela.ai supports virtually all major programming languages including Python, JavaScript, TypeScript, Java, C++, Go, Rust, Swift, and many others. Our AI can help with code generation, debugging, optimization, and explanation across these languages.'
    },
    {
      question: 'Can I use Tela.ai for commercial projects?',
      answer: 'Yes, Tela.ai can be used for commercial projects. We offer different pricing tiers to accommodate various use cases, from individual developers to enterprise teams. Check our pricing page for detailed information about commercial usage rights.'
    },
    {
      question: 'How accurate is the AI-generated content?',
      answer: 'Our AI models are highly sophisticated and generally produce accurate, high-quality content. However, we always recommend reviewing and validating AI-generated content before using it in critical applications. The accuracy can vary depending on the complexity and specificity of your request.'
    },
    {
      question: 'Does Tela.ai work offline?',
      answer: 'Currently, Tela.ai requires an internet connection to function as our AI models run on cloud infrastructure. This ensures you always have access to the latest models and capabilities. We\'re exploring offline capabilities for future releases.'
    },
    {
      question: 'How do I get started with Tela.ai?',
      answer: 'Getting started is simple! Click "Get Started" on our homepage to create your account. You can begin using Tela.ai immediately with our free tier, which includes access to core features. No technical setup or installation required.'
    },
    {
      question: 'What support options are available?',
      answer: 'We offer multiple support channels including email support, documentation, video tutorials, and community forums. Premium users get priority support with faster response times. Our support team is knowledgeable about both technical and non-technical issues.'
    },
    {
      question: 'Can I integrate Tela.ai with other tools?',
      answer: 'Yes, we offer API access and integrations with popular development tools, project management platforms, and productivity apps. Our API allows you to incorporate Tela.ai\'s capabilities directly into your existing workflows and applications.'
    },
    {
      question: 'What are the system requirements?',
      answer: 'Tela.ai is web-based and works on any modern device with an internet connection. It\'s optimized for desktop browsers (Chrome, Firefox, Safari, Edge) but also works well on tablets and mobile devices. No special software installation is required.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="relative z-10 min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
              <h1 className="text-2xl font-orbitron font-bold text-white">
                Tela.ai
              </h1>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-white to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="h-8 w-8 text-black" />
            </div>
            <h2 className="text-4xl md:text-6xl font-orbitron font-bold mb-6 text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-300 mb-8 font-inter max-w-2xl mx-auto">
              Get answers to common questions about Tela.ai's features, capabilities, and usage.
            </p>
          </motion.div>

          {/* FAQ Items */}
          <div className="space-y-4 mb-20">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-800/30 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-white pr-4">{faq.question}</h3>
                  {openFAQ === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {openFAQ === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6"
                  >
                    <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Contact Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/20 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8">
              <h3 className="text-3xl font-orbitron font-bold mb-6 text-white">Still Have Questions?</h3>
              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                Can't find the answer you're looking for? Our support team is here to help you get the most out of Tela.ai.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white hover:bg-gray-200 text-black px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105">
                  Contact Support
                </button>
                <Link
                  to="/app"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 rounded-xl text-lg font-semibold transition-all"
                >
                  Try Tela.ai Free
                </Link>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
