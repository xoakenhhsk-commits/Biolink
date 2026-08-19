import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  LogOut, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  CloudCheck
} from 'lucide-react';
import { 
  signInWithPopup, 
  signOut as fbSignOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  User 
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAuthSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
}) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      if (onAuthSuccess) onAuthSuccess();
      onClose();
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setError(err.message || 'Không thể đăng nhập bằng Google. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName && userCred.user) {
          await updateProfile(userCred.user, { displayName });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      if (onAuthSuccess) onAuthSuccess();
      onClose();
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      let msg = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Email hoặc mật khẩu không chính xác.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Email này đã được đăng ký tài khoản.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Mật khẩu phải có ít nhất 6 ký tự.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Định dạng email không hợp lệ.';
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await fbSignOut(auth);
      onClose();
    } catch (err) {
      console.error('Sign Out Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        
        {/* Header background accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Current Logged In View */}
        {currentUser ? (
          <div className="space-y-6 pt-2 text-center">
            <div className="w-16 h-16 mx-auto rounded-full ring-4 ring-blue-500/20 overflow-hidden bg-zinc-200 dark:bg-zinc-800">
              <img
                src={
                  currentUser.photoURL ||
                  `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`
                }
                alt="Avatar"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full mb-2 border border-emerald-500/20">
                <CheckCircle2 size={13} />
                <span>Đã kết nối Firebase Cloud</span>
              </div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100">
                {currentUser.displayName || 'Người dùng BioLink'}
              </h3>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                {currentUser.email}
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl p-4 text-xs text-zinc-600 dark:text-zinc-300 text-left space-y-2 border border-zinc-200 dark:border-zinc-700/60">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Database:</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">Firebase Firestore</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Tự động đồng bộ:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Realtime Bật ⚡</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">UID:</span>
                <span className="font-mono text-[10px] text-zinc-400 truncate max-w-[180px]">
                  {currentUser.uid}
                </span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full py-3 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>
        ) : (
          /* Login / Sign Up View */
          <div className="space-y-5 pt-2">
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/20 mb-3">
                <Sparkles size={22} />
              </div>
              <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
                {isSignUp ? 'Tạo Tài Khoản BioLink' : 'Đăng Nhập BioLink Studio'}
              </h3>
              <p className="text-xs text-zinc-500">
                Lưu trữ vĩnh viễn và đồng bộ realtime Bio của bạn vào Firebase Database.
              </p>
            </div>

            {/* Google Fast Login Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700/80 border border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-2xl font-bold text-xs shadow-sm flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-98"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Tiếp tục với Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
              <span className="text-[11px] text-zinc-400 font-semibold uppercase">Hoặc Email</span>
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Tên hiển thị
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Họ và tên của bạn"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <UserIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ít nhất 6 ký tự..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle size={15} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <LogIn size={16} />
                )}
                <span>{isSignUp ? 'Đăng Ký Tài Khoản' : 'Đăng Nhập Ngay'}</span>
              </button>
            </form>

            {/* Toggle Sign up / Sign in */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                {isSignUp
                  ? 'Đã có tài khoản? Đăng nhập tại đây'
                  : 'Chưa có tài khoản? Bấm để Đăng ký mới'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
