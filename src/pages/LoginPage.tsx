import React, { useState } from 'react';
import PhoneInput from 'react-phone-number-input';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { MessageSquare, Shield, Check, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import 'react-phone-number-input/style.css';

const LoginPage = () => {
  const [phone, setPhone] = useState<string>('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'phone' | 'otp' | 'profile'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    if (!phone || !isValidPhoneNumber(phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    
    // Simulate OTP sending
    setTimeout(() => {
      toast.success('OTP sent to your phone number');
      setStep('otp');
      setIsLoading(false);
    }, 2000);
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);

    // Simulate OTP verification (in production, verify with backend)
    setTimeout(() => {
      if (otp === '123456') {
        // Check if user exists (simulate)
        const existingUser = localStorage.getItem(`user_${phone}`);
        if (existingUser) {
          const userData = JSON.parse(existingUser);
          setUser(userData);
          toast.success('Welcome back!');
          navigate('/chat');
        } else {
          setStep('profile');
        }
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleCreateProfile = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const userData = {
        id: `user_${Date.now()}`,
        name: name.trim(),
        phone,
        avatar: getRandomAvatar(),
        status: 'Hey there! I am using Chattyy.',
        isOnline: true
      };

      // Save user data (in production, save to backend)
      localStorage.setItem(`user_${phone}`, JSON.stringify(userData));
      
      setUser(userData);
      toast.success('Profile created successfully!');
      navigate('/chat');
      setIsLoading(false);
    }, 1500);
  };

  const getRandomAvatar = () => {
    const avatars = ['👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '👨‍🔬', '👩‍🔬', '👨‍⚕️', '👩‍⚕️'];
    return avatars[Math.floor(Math.random() * avatars.length)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-green-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Chattyy</h1>
          <p className="text-gray-600">Connect with friends and family</p>
        </div>

        {/* Phone Number Step */}
        {step === 'phone' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="phone-input-container">
                <PhoneInput
                  international
                  countryCallingCodeEditable={false}
                  defaultCountry="US"
                  value={phone}
                  onChange={(value) => setPhone(value || '')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Your number is safe with us and will be verified via SMS</span>
            </div>

            <button
              onClick={handleSendOTP}
              disabled={isLoading || !phone || !isValidPhoneNumber(phone || '')}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* OTP Verification Step */}
        {step === 'otp' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Verify your number</h2>
              <p className="text-gray-600 mb-4">
                We've sent a 6-digit code to {phone}
              </p>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg tracking-wider"
                maxLength={6}
              />
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Didn't receive the code?{' '}
                <button
                  onClick={() => setStep('phone')}
                  className="text-green-600 font-medium hover:underline"
                >
                  Try again
                </button>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Use code: <strong>123456</strong> for demo
              </p>
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Profile Setup Step */}
        {step === 'profile' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Create your profile</h2>
              <p className="text-gray-600 mb-4">
                Tell us your name to get started
              </p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                maxLength={50}
              />
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Your profile information is encrypted and secure</span>
            </div>

            <button
              onClick={handleCreateProfile}
              disabled={isLoading || !name.trim()}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Profile</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>
            By continuing, you agree to our{' '}
            <a href="#" className="text-green-600 hover:underline">Terms</a> and{' '}
            <a href="#" className="text-green-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
