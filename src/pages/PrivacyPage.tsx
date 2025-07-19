import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Server, ArrowLeft } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  const sections = [
    {
      title: 'Information We Collect',
      icon: Eye,
      content: 'We collect information you provide directly to us, such as when you create an account, use our services, or contact us. This includes your name, email address, and any content you generate or input into our AI systems.'
    },
    {
      title: 'How We Use Your Information',
      icon: Server,
      content: 'We use your information to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.'
    },
    {
      title: 'Data Security',
      icon: Lock,
      content: 'We implement robust security measures including encryption, access controls, and regular security audits to protect your personal information from unauthorized access, alteration, disclosure, or destruction.'
    },
    {
      title: 'Your Privacy Rights',
      icon: Shield,
      content: 'You have the right to access, update, or delete your personal information. You can also opt out of certain communications and control how your data is used through your account settings.'
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
            <div className="w-16 h-16 bg-gradient-to-br from-white to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-black" />
            </div>
            <h2 className="text-4xl md:text-6xl font-orbitron font-bold mb-6 text-white">
              Privacy Policy
            </h2>
            <p className="text-xl text-gray-300 mb-8 font-inter">
              Your privacy is our priority. Learn how we collect, use, and protect your information.
            </p>
            <p className="text-sm text-gray-400">Last updated: January 2025</p>
          </motion.div>

          {/* Introduction */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/20 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8">
              <p className="text-gray-300 text-lg leading-relaxed">
                At Tela.ai, we are committed to protecting your privacy and ensuring the security of your personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
                artificial intelligence platform and services.
              </p>
            </div>
          </motion.section>

          {/* Main Sections */}
          <div className="space-y-8 mb-12">
            {sections.map((section, index) => (
              <motion.section
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-white/10 rounded-lg p-3 flex-shrink-0">
                    <section.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-white">{section.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{section.content}</p>
                  </div>
                </div>
              </motion.section>
            ))}
          </div>

          {/* Additional Sections */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/20 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8">
              <h3 className="text-2xl font-orbitron font-bold mb-6 text-white">Data Retention</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                We retain your personal information only for as long as necessary to provide you with our services and 
                as described in this Privacy Policy. We will also retain and use your information to the extent necessary 
                to comply with our legal obligations, resolve disputes, and enforce our agreements.
              </p>
              
              <h3 className="text-2xl font-orbitron font-bold mb-6 text-white">International Data Transfers</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                Your information may be transferred to and maintained on computers located outside of your state, province, 
                country, or other governmental jurisdiction where the data protection laws may differ from those in your jurisdiction.
              </p>

              <h3 className="text-2xl font-orbitron font-bold mb-6 text-white">Changes to This Policy</h3>
              <p className="text-gray-300 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
                Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy 
                Policy periodically for any changes.
              </p>
            </div>
          </motion.section>

          {/* Contact */}
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h3 className="text-3xl font-orbitron font-bold mb-6 text-white">Questions About Privacy?</h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              If you have any questions about this Privacy Policy or our data practices, please don't hesitate to contact us.
            </p>
            <button className="bg-white hover:bg-gray-200 text-black px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105">
              Contact Privacy Team
            </button>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
