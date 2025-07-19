import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Code, Palette, Users, ArrowLeft, MapPin, Clock, DollarSign } from 'lucide-react';

const CareersPage: React.FC = () => {
  const positions = [
    {
      title: 'Senior AI Engineer',
      department: 'Engineering',
      location: 'San Francisco / Remote',
      type: 'Full-time',
      salary: '$180k - $250k',
      icon: Brain,
      description: 'Build and optimize large language models and neural architectures that power our AI platform.'
    },
    {
      title: 'Full-Stack Developer',
      department: 'Engineering',
      location: 'New York / Remote',
      type: 'Full-time',
      salary: '$140k - $200k',
      icon: Code,
      description: 'Develop scalable web applications and APIs that deliver AI capabilities to millions of users.'
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'Los Angeles / Remote',
      type: 'Full-time',
      salary: '$120k - $180k',
      icon: Palette,
      description: 'Design intuitive interfaces that make complex AI interactions feel natural and delightful.'
    },
    {
      title: 'AI Research Scientist',
      department: 'Research',
      location: 'Boston / Remote',
      type: 'Full-time',
      salary: '$200k - $300k',
      icon: Brain,
      description: 'Push the boundaries of AI research and develop next-generation machine learning algorithms.'
    }
  ];

  const benefits = [
    'Competitive equity package',
    'Comprehensive health coverage',
    'Unlimited PTO policy',
    'Remote-first culture',
    'Learning & development budget',
    'Top-tier equipment & tools'
  ];

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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-orbitron font-bold mb-6 text-white">
              Join the AI Revolution
            </h2>
            <p className="text-xl text-gray-300 mb-8 font-inter max-w-3xl mx-auto">
              Help us build the future of artificial intelligence. Work with world-class talent on cutting-edge technology that impacts millions of users.
            </p>
          </motion.div>

          {/* Why Join Us */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/20 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8">
              <h3 className="text-3xl font-orbitron font-bold mb-6 text-white">Why Tela.ai?</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xl font-semibold mb-3 text-white">Cutting-Edge Technology</h4>
                  <p className="text-gray-400">Work on the latest AI breakthroughs and shape the future of human-computer interaction.</p>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-3 text-white">Global Impact</h4>
                  <p className="text-gray-400">Your work will reach millions of users and accelerate innovation across industries.</p>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-3 text-white">World-Class Team</h4>
                  <p className="text-gray-400">Collaborate with top engineers and researchers from leading tech companies.</p>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-3 text-white">Growth Opportunity</h4>
                  <p className="text-gray-400">Rapid career advancement in one of the fastest-growing sectors in technology.</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Open Positions */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <h3 className="text-3xl font-orbitron font-bold mb-12 text-white text-center">Open Positions</h3>
            <div className="space-y-6">
              {positions.map((position, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-white/30 transition-colors group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex items-start gap-4 mb-4 md:mb-0">
                      <div className="bg-white/10 rounded-lg p-3 group-hover:bg-white/20 transition-colors">
                        <position.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold text-white mb-2">{position.title}</h4>
                        <p className="text-gray-400 mb-3">{position.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {position.department}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {position.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {position.type}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {position.salary}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="bg-white hover:bg-gray-200 text-black px-6 py-3 rounded-lg font-semibold transition-colors">
                      Apply Now
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Benefits */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/20 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8">
              <h3 className="text-3xl font-orbitron font-bold mb-6 text-white text-center">Benefits & Perks</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* CTA */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h3 className="text-3xl font-orbitron font-bold mb-6 text-white">Don't See a Perfect Match?</h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              We're always looking for exceptional talent. Send us your resume and tell us how you'd like to contribute to the AI revolution.
            </p>
            <button className="bg-white hover:bg-gray-200 text-black px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105">
              Send General Application
            </button>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default CareersPage;
