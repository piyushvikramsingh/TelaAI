import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Code, Palette, MessageCircle, Play, Star, Github, Twitter, Instagram, HelpCircle } from 'lucide-react';
import RealtimeDemo from '../components/RealtimeDemo';

// --- VIDEO LINK ---
// Replace the placeholder URL below with the link to your demo video.
const demoVideoUrl = 'https://www.youtube.com/watch?v=your_video_id_here'; // <-- PUT YOUR VIDEO LINK HERE

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: MessageCircle,
      title: 'Neural Conversations',
      description: 'Advanced AI powered by cutting-edge language models for seamless human-machine interaction'
    },
    {
      icon: Palette,
      title: 'Design Automation',
      description: 'Generate stunning interfaces and visual designs with unprecedented speed and precision'
    },
    {
      icon: Brain,
      title: 'Persistent Intelligence',
      description: 'Your AI remembers, learns, and evolves with every interaction for maximum efficiency'
    },
    {
      icon: Code,
      title: 'Code Generation',
      description: 'Write, debug, and optimize code across multiple programming languages instantly'
    }
  ];

  const testimonials = [
    {
      role: 'Software Engineer',
      name: 'Alex Chen',
      text: 'Tela.ai accelerated our development cycle by 10x. What used to take weeks now takes hours.',
      rating: 5
    },
    {
      role: 'Product Designer',
      name: 'Sarah Kim',
      text: 'Revolutionary design capabilities. It understands design principles better than most humans.',
      rating: 5
    },
    {
      role: 'Startup Founder',
      name: 'Marcus Johnson',
      text: 'The efficiency gains are extraordinary. Tela.ai is like having a team of experts at your fingertips.',
      rating: 5
    }
  ];

  // Social media links - easy to customize
  const socialLinks = {
    instagram: 'https://instagram.com/your-username', // Replace with your Instagram URL
    twitter: 'https://twitter.com/your-username',     // Replace with your Twitter/X URL
    github: 'https://github.com/your-username'        // Replace with your GitHub URL
  };

  return (
    <div className="relative z-10">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-orbitron font-bold text-white">
                Tela.ai
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/faq"
                className="text-gray-300 hover:text-white transition-colors flex items-center gap-1"
              >
                <HelpCircle className="h-4 w-4" />
                FAQ
              </Link>
              <Link
                to="/login"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Account
              </Link>
              <Link
                to="/app"
                className="bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-lg transition-colors font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <h2 className="text-5xl md:text-7xl font-orbitron font-bold mb-6 text-white">
              Accelerate Everything
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 font-inter">
              The future of AI assistance. Built for creators, engineers, and visionaries.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              to="/app"
              className="bg-white hover:bg-gray-200 text-black px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 shadow-lg shadow-white/25"
            >
              Experience Tela.ai
            </Link>
            <a 
              href={demoVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black px-8 py-4 rounded-xl text-lg font-semibold transition-all flex items-center gap-2"
            >
              <Play className="h-5 w-5" />
              Watch Demo
            </a>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-orbitron font-bold mb-4 text-white">
              Next-Generation Capabilities
            </h3>
            <p className="text-gray-400 text-lg">
              Engineered for maximum performance. Designed for the future.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 transition-all duration-300 hover:border-white/50 hover:shadow-xl hover:shadow-white/10">
                  <div className="bg-white/10 rounded-lg p-3 w-fit mb-4 group-hover:bg-white/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-white group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2 text-white">{feature.title}</h4>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Real-Time Performance Demo Section */}
      <section id="demo-section" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h3 className="text-4xl font-orbitron font-bold mb-4 text-white">
              Real-Time Performance Demo
            </h3>
            <p className="text-gray-400 text-lg">
              Witness the precision and power of advanced AI assistance. Click 'Run Demo' to see it in action.
            </p>
          </motion.div>

          <RealtimeDemo />
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-orbitron font-bold mb-4 text-white">
              Built by Innovators, For Innovators
            </h3>
            <p className="text-gray-400 text-lg">
              Trusted by industry leaders and breakthrough creators
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/20 backdrop-blur-sm border border-gray-700/30 rounded-xl p-8 h-full">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-300 rounded-full flex items-center justify-center mr-4">
                      <span className="text-black font-bold text-lg">{testimonial.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{testimonial.name}</p>
                      <p className="text-gray-400 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-gray-200 italic leading-relaxed">"{testimonial.text}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/80 border-t border-white/20 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-2xl font-orbitron font-bold mb-4 text-white">
                Tela.ai
              </h4>
              <p className="text-gray-400">
                Advanced AI assistance engineered for maximum efficiency and innovation
              </p>
            </div>
            
            <div>
              <h5 className="text-white font-semibold mb-4">Platform</h5>
              <div className="space-y-2">
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors block">
                  About
                </Link>
                <Link to="/careers" className="text-gray-400 hover:text-white transition-colors block">
                  Careers
                </Link>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors block">
                  Privacy
                </Link>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors block">
                  FAQ
                </Link>
              </div>
            </div>

            <div>
              <h5 className="text-white font-semibold mb-4">Connect</h5>
              <div className="flex space-x-4">
                <a 
                  href={socialLinks.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Instagram className="h-6 w-6" />
                </a>
                <a 
                  href={socialLinks.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Twitter className="h-6 w-6" />
                </a>
                <a 
                  href={socialLinks.github} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Github className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Tela.ai. Engineered for the future.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
