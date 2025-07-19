import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Users, Target, Award, ArrowLeft } from 'lucide-react';

const AboutPage: React.FC = () => {
  const values = [
    {
      icon: Brain,
      title: 'Innovation First',
      description: 'Pushing the boundaries of artificial intelligence to create unprecedented solutions'
    },
    {
      icon: Users,
      title: 'Human-Centered',
      description: 'Designing AI that amplifies human creativity and intelligence, not replaces it'
    },
    {
      icon: Target,
      title: 'Precision Focus',
      description: 'Delivering accurate, reliable, and efficient AI assistance for every interaction'
    },
    {
      icon: Award,
      title: 'Excellence Standard',
      description: 'Maintaining the highest quality standards in AI development and user experience'
    }
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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-orbitron font-bold mb-6 text-white">
              About Tela.ai
            </h2>
            <p className="text-xl text-gray-300 mb-8 font-inter max-w-3xl mx-auto">
              We're building the future of artificial intelligence - creating tools that amplify human potential and accelerate innovation across every industry.
            </p>
          </motion.div>

          {/* Mission Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/20 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8">
              <h3 className="text-3xl font-orbitron font-bold mb-6 text-white">Our Mission</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                At Tela.ai, we believe artificial intelligence should be a force multiplier for human creativity and productivity. 
                Our mission is to democratize access to advanced AI capabilities, making powerful tools available to creators, 
                engineers, and visionaries worldwide. We're not just building software - we're crafting the intelligent 
                infrastructure that will power the next generation of human achievement.
              </p>
            </div>
          </motion.section>

          {/* Values Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <h3 className="text-3xl font-orbitron font-bold mb-12 text-white text-center">Our Values</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
                >
                  <div className="bg-white/10 rounded-lg p-3 w-fit mb-4">
                    <value.icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-3 text-white">{value.title}</h4>
                  <p className="text-gray-400">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Team Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-20"
          >
            <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/20 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8 text-center">
              <h3 className="text-3xl font-orbitron font-bold mb-6 text-white">Built by Innovators</h3>
              <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
                Our team consists of world-class engineers, researchers, and designers who have previously built 
                groundbreaking technology at leading AI companies. We're united by a shared vision of creating 
                AI that enhances human capabilities rather than replacing them.
              </p>
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h3 className="text-3xl font-orbitron font-bold mb-6 text-white">Ready to Experience the Future?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/app"
                className="bg-white hover:bg-gray-200 text-black px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105"
              >
                Try Tela.ai Now
              </Link>
              <Link
                to="/careers"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 rounded-xl text-lg font-semibold transition-all"
              >
                Join Our Team
              </Link>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
