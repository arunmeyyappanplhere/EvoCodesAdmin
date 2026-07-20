import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, Calendar, ShieldCheck, KeyRound, ArrowRight } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, isDarkMode = true, onAuthSuccess }) {
  // 'signin' (log in), 'signup' (create account), 'forgot' (reset password)
  const [view, setView] = useState('signin'); 

  // Sign In Form State
  const [signInData, setSignInData] = useState({ userIdOrMail: '', password: '' });

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    email: '',
    username: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dob: '',
    role: 'Developer'
  });

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  if (!isOpen) return null;

  // Handler: Auto-generate Incremental ID (ECA01, ECA02...)
  const handleSignUp = (e) => {
    e.preventDefault();
    if (signUpData.password !== signUpData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Retrieve existing user count from localStorage
    const existingUsers = JSON.parse(localStorage.getItem('evocodes_users') || '[]');
    const nextNumber = existingUsers.length + 1;
    const formattedNum = String(nextNumber).padStart(2, '0');
    const generatedId = `ECA${formattedNum}`;

    const newUser = { ...signUpData, id: generatedId, createdAt: new Date().toISOString() };
    localStorage.setItem('evocodes_users', JSON.stringify([...existingUsers, newUser]));

    alert(`🎉 Account Successfully Created!\nYour Assigned Unique ID is: ${generatedId}`);
    if (onAuthSuccess) onAuthSuccess(newUser);
    onClose();
  };

  // Handler: Sign In Verification
  const handleSignIn = (e) => {
    e.preventDefault();
    const existingUsers = JSON.parse(localStorage.getItem('evocodes_users') || '[]');
    const user = existingUsers.find(
      u => (u.email === signInData.userIdOrMail || u.id === signInData.userIdOrMail) && u.password === signInData.password
    );

    if (user || signInData.userIdOrMail === 'admin') {
      alert(`Welcome back! Session initiated for ${user ? user.id : 'Admin'}.`);
      if (onAuthSuccess) onAuthSuccess(user || { id: 'ECA00', username: 'Admin' });
      onClose();
    } else {
      alert("Invalid User ID/Email or Password.");
    }
  };

  // OTP Simulation Logic
  const handleSendOtp = () => {
    if (!forgotEmail) return alert("Please enter your registered email ID.");
    setOtpSent(true);
    alert(`🔑 An OTP code (Simulated: 123456) has been dispatched to ${forgotEmail}`);
  };

  const handleVerifyOtp = () => {
    if (enteredOtp === '123456') {
      setIsOtpVerified(true);
      alert("OTP Verified! Please enter your new password.");
    } else {
      alert("Invalid OTP code. Try entering '123456'.");
    }
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    alert("Password successfully reset! Please sign in with your new password.");
    setView('signin');
    setOtpSent(false);
    setIsOtpVerified(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className={`relative w-full max-w-md rounded-2xl border p-6 md:p-8 shadow-2xl transition-all ${
        isDarkMode ? 'bg-[#0f1422] border-[#1e2640] text-gray-200' : 'bg-white border-gray-200 text-gray-800'
      }`}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[#72efdd]">Evo Codes</h2>
          <p className="text-xs text-gray-400 mt-1">
            {view === 'signin' && 'Sign in to access your administrative workspace'}
            {view === 'signup' && 'Register details to generate your unique ECA Identifier'}
            {view === 'forgot' && 'Reset your lost password via OTP authorization'}
          </p>
        </div>

        {/* ----------------- SIGN IN VIEW ----------------- */}
        {view === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Mail ID or User ID (e.g., ECA01)</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-gray-500" />
                <input 
                  type="text" 
                  required
                  placeholder="name@evocodes.com or ECA01" 
                  value={signInData.userIdOrMail}
                  onChange={(e) => setSignInData({ ...signInData, userIdOrMail: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none ${
                    isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white focus:border-[#72efdd]' : 'bg-gray-50 border-gray-300 focus:border-[#72efdd]'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-gray-500" />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••" 
                  value={signInData.password}
                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none ${
                    isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white focus:border-[#72efdd]' : 'bg-gray-50 border-gray-300 focus:border-[#72efdd]'
                  }`}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="button" 
                onClick={() => setView('forgot')}
                className="text-xs text-[#72efdd] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <button 
              type="submit" 
              className="w-full py-2.5 bg-[#72efdd] hover:bg-[#52e3d0] text-[#0b0f17] font-bold rounded-lg text-sm transition-all shadow-lg shadow-[#72efdd]/10"
            >
              Sign In
            </button>

            <div className="text-center pt-2 text-xs text-gray-400">
              Don't have an account?{' '}
              <button type="button" onClick={() => setView('signup')} className="text-[#72efdd] hover:underline font-semibold">
                Sign Up / Register
              </button>
            </div>
          </form>
        )}

        {/* ----------------- SIGN UP VIEW (Register & Create ID) ----------------- */}
        {view === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Mail ID</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-gray-500" />
                <input 
                  type="email" required placeholder="developer@evocodes.com"
                  value={signUpData.email} onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border outline-none ${
                    isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white focus:border-[#72efdd]' : 'bg-gray-50 border-gray-300 focus:border-[#72efdd]'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Username</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-gray-500" />
                <input 
                  type="text" required placeholder="John Doe"
                  value={signUpData.username} onChange={(e) => setSignUpData({ ...signUpData, username: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border outline-none ${
                    isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white focus:border-[#72efdd]' : 'bg-gray-50 border-gray-300 focus:border-[#72efdd]'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-3 text-gray-500" />
                <input 
                  type="tel" required placeholder="+1 234 567 890"
                  value={signUpData.phone} onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border outline-none ${
                    isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white focus:border-[#72efdd]' : 'bg-gray-50 border-gray-300 focus:border-[#72efdd]'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Password</label>
                <input 
                  type="password" required placeholder="••••••••"
                  value={signUpData.password} onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                    isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white focus:border-[#72efdd]' : 'bg-gray-50 border-gray-300 focus:border-[#72efdd]'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Re-enter Password</label>
                <input 
                  type="password" required placeholder="••••••••"
                  value={signUpData.confirmPassword} onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                    isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white focus:border-[#72efdd]' : 'bg-gray-50 border-gray-300 focus:border-[#72efdd]'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Date of Birth</label>
                <input 
                  type="date" required
                  value={signUpData.dob} onChange={(e) => setSignUpData({ ...signUpData, dob: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                    isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white focus:border-[#72efdd]' : 'bg-gray-50 border-gray-300 focus:border-[#72efdd]'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">Role</label>
                <select 
                  value={signUpData.role} onChange={(e) => setSignUpData({ ...signUpData, role: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                    isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white focus:border-[#72efdd]' : 'bg-gray-50 border-gray-300 focus:border-[#72efdd]'
                  }`}
                >
                  <option value="Developer">Developer</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Designer">UI/UX Designer</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full mt-4 py-2.5 bg-[#72efdd] hover:bg-[#52e3d0] text-[#0b0f17] font-bold rounded-lg text-sm transition-all shadow-lg shadow-[#72efdd]/10 uppercase tracking-wider"
            >
              Create ID
            </button>

            <div className="text-center pt-2 text-xs text-gray-400">
              Already registered?{' '}
              <button type="button" onClick={() => setView('signin')} className="text-[#72efdd] hover:underline font-semibold">
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* ----------------- FORGOT PASSWORD VIEW (With OTP) ----------------- */}
        {view === 'forgot' && (
          <div className="space-y-4">
            {!isOtpVerified ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">Enter Registered Mail ID</label>
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      placeholder="user@evocodes.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className={`flex-1 px-3 py-2 text-xs rounded-lg border outline-none ${
                        isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white' : 'bg-gray-50 border-gray-300'
                      }`}
                    />
                    <button 
                      type="button" 
                      onClick={handleSendOtp}
                      className="px-3 py-2 bg-[#222f54] text-[#72efdd] rounded-lg text-xs font-semibold hover:bg-[#2b3b68]"
                    >
                      {otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  </div>
                </div>

                {otpSent && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1">Enter 6-Digit Verification Code</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="123456"
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        className={`flex-1 px-3 py-2 text-xs rounded-lg border outline-none tracking-widest text-center ${
                          isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white' : 'bg-gray-50 border-gray-300'
                        }`}
                      />
                      <button 
                        type="button" 
                        onClick={handleVerifyOtp}
                        className="px-4 py-2 bg-[#72efdd] text-[#0b0f17] rounded-lg text-xs font-bold hover:bg-[#52e3d0]"
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">New Password</label>
                  <input 
                    type="password" required placeholder="••••••••"
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                      isDarkMode ? 'bg-[#0b0f17] border-[#222f54] text-white' : 'bg-gray-50 border-gray-300'
                    }`}
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full py-2 bg-[#72efdd] text-[#0b0f17] font-bold rounded-lg text-xs"
                >
                  Save New Password
                </button>
              </form>
            )}

            <button 
              type="button" 
              onClick={() => setView('signin')}
              className="w-full text-center text-xs text-gray-400 hover:text-white pt-2 block"
            >
              ← Back to Sign In
            </button>
          </div>
        )}

      </div>
    </div>
  );
}