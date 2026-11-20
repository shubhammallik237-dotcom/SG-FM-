import React, { useState } from 'react';
import { X, Phone, CheckCircle, ShieldCheck, UserCheck, Sparkles, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    isLoggedIn,
    user,
    login,
    logout
  } = useApp();

  // Phone OTP State
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  if (activeModal !== 'auth') return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) return;
    
    setIsSendingOtp(true);
    setTimeout(() => {
      setIsSendingOtp(false);
      setOtpSent(true);
      setOtpCode('889900'); // pre-fill test OTP for instantaneous test flow
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) return;

    login('phone', {
      phone: phoneNumber,
      name: phoneNumber === '+91 98765 43210' ? 'Aryan Sharma' : 'New User'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6">
        {/* Close Button */}
        <button
          onClick={closeModal}
          aria-label="Close authentication modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isLoggedIn ? (
          /* Profile / Already Signed In Screen */
          <div className="space-y-6 text-center pt-2">
            <div className="relative inline-block">
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full mx-auto border-2 border-amber-500 bg-slate-800 shadow-xl"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-slate-900">
                <ShieldCheck className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div>
              <h3 className="font-display font-extrabold text-xl text-white">{user.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{user.phone || user.email}</p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mt-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{user.coinBalance} Available Coins</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={() => {
                  logout();
                  setOtpSent(false);
                  setOtpCode('');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-700"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of SGFM</span>
              </button>
            </div>
          </div>
        ) : (
          /* Authentication Screen */
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <div className="flex justify-center mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-amber-500/20">
                  S
                </div>
              </div>
              <h3 className="font-display font-extrabold text-2xl text-white">
                Welcome to SGFM
              </h3>
              <p className="text-xs text-slate-400">
                Stream the best audio novels. Sign in with your phone number to continue.
              </p>
            </div>

            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Mobile Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
                  >
                    {isSendingOtp ? 'Sending 6-Digit OTP...' : 'Send Verification OTP'}
                  </button>
                  
                  <p className="text-[10px] text-slate-500 text-center px-4 leading-relaxed">
                    By continuing, you agree to SGFM's Terms of Service and Privacy Policy.
                  </p>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>OTP sent to {phoneNumber}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="underline font-bold hover:text-white"
                    >
                      Change
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">
                      Enter 6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="· · · · · ·"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] text-amber-400 outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={otpCode.length !== 6}
                    className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 ${
                      otpCode.length === 6 
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Verify & Login</span>
                  </button>
                  
                  <div className="text-center">
                    <button 
                      type="button" 
                      className="text-[11px] text-slate-400 hover:text-amber-400 font-medium transition-colors"
                      onClick={handleSendOtp}
                    >
                      Didn't receive code? Resend
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Quick Demo Sign-in */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <span className="text-[10px] text-slate-500 font-bold block text-center uppercase tracking-widest">
                Quick Test Access
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setPhoneNumber('+91 98765 43210');
                    setOtpSent(true);
                    setOtpCode('889900');
                  }}
                  className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-left transition-colors group"
                >
                  <strong className="block text-amber-400 group-hover:text-amber-300">VIP Listener</strong>
                  <span className="text-[9px] text-slate-500">Auto-fills Demo OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhoneNumber('+91 11223 34455');
                    setOtpSent(true);
                    setOtpCode('889900');
                  }}
                  className="p-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-left transition-colors group"
                >
                  <strong className="block text-orange-400 group-hover:text-orange-300">New Account</strong>
                  <span className="text-[9px] text-slate-500">Sign up as Creator</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
