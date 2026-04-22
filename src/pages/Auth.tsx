import React, { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    sendEmailVerification,
    sendPasswordResetEmail,
    applyActionCode,
    isSignInWithEmailLink,
    signInWithEmailLink,
    confirmPasswordReset
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ChevronRight, Sparkles, User, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5 mr-3" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335" />
    </svg>
);

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const [authMode, setAuthMode] = useState<string | null>(null);
    const [oobCode, setOobCode] = useState<string | null>(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const mode = queryParams.get('mode');
        const code = queryParams.get('oobCode');

        if (mode && code) {
            setAuthMode(mode);
            setOobCode(code);
            
            if (mode === 'verifyEmail') {
                handleVerifyEmail(code);
            }
        } else if (isSignInWithEmailLink(auth, window.location.href)) {
            setAuthMode('signIn');
            handleMagicLinkSignIn();
        }
    }, [location]);

    const handleVerifyEmail = async (code: string) => {
        setLoading(true);
        try {
            await applyActionCode(auth, code);
            toast.success('Email verified successfully!');
            navigate('/');
        } catch (error: any) {
            toast.error('Failed to verify email: ' + error.message);
        } finally {
            setLoading(false);
            setAuthMode(null);
        }
    };

    const handleMagicLinkSignIn = async () => {
        let emailForSignIn = window.localStorage.getItem('emailForSignIn');
        if (!emailForSignIn) {
            emailForSignIn = window.prompt('Please provide your email for confirmation');
        }
        if (emailForSignIn) {
            setLoading(true);
            try {
                const result = await signInWithEmailLink(auth, emailForSignIn, window.location.href);
                window.localStorage.removeItem('emailForSignIn');
                
                const userSnap = await getDoc(doc(db, 'users', result.user.uid));
                if (!userSnap.exists()) {
                    await setDoc(doc(db, 'users', result.user.uid), {
                        email: result.user.email,
                        name: result.user.displayName || 'Guest User',
                        isAdmin: false,
                        createdAt: serverTimestamp()
                    });
                }
                
                toast.success('Signed in with Magic Link!');
                navigate('/');
            } catch (error: any) {
                toast.error('Failed to sign in with link: ' + error.message);
            } finally {
                setLoading(false);
                setAuthMode(null);
            }
        } else {
            setAuthMode(null);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!oobCode || !password) return;
        setLoading(true);
        try {
            await confirmPasswordReset(auth, oobCode, password);
            toast.success('Password reset successfully!');
            navigate('/');
            setAuthMode(null);
        } catch (error: any) {
            toast.error('Failed to reset password: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            toast.error('Please enter your email first.');
            return;
        }
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email, { url: 'https://www.theujs.com/auth' });
            toast.success('Password reset email sent!');
        } catch (e: any) {
            toast.error('Error sending reset email: ' + e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            const userSnap = await getDoc(doc(db, 'users', user.uid));
            if (!userSnap.exists()) {
                await setDoc(doc(db, 'users', user.uid), {
                    email: user.email,
                    name: user.displayName || 'Guest User',
                    isAdmin: false,
                    createdAt: serverTimestamp()
                });
            }
            toast.success('Signed in with Google!');
            navigate('/');
        } catch (error: any) {
            console.error('Detailed Google Auth Error:', error);
            
            if (error.code === 'auth/unauthorized-domain') {
                 toast.error('Domain not authorized. Please add this URL in Firebase Console > Auth > Settings > Authorized Domains', { duration: 6000 });
            } else if (error.code === 'auth/popup-closed-by-user') {
                 toast.error('Sign-in window closed. Please try again.');
            } else if (error.code === 'auth/cancelled-popup-request') {
                 toast.error('Only one sign-in window is allowed at a time.');
            } else {
                 toast.error(`Google Sign-In failed: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                toast.success('Welcome back!');
                navigate('/');
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                await setDoc(doc(db, 'users', user.uid), {
                    email: user.email,
                    name: name,
                    isAdmin: false,
                    createdAt: serverTimestamp()
                });
                
                await sendEmailVerification(user, { url: 'https://www.theujs.com/auth' });
                toast.success('Account created! Please check your email to verify.');
                
                navigate('/');
            }
        } catch (error: any) {
            const message = error instanceof Error ? error.message : "Authentication failed";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (authMode === 'resetPassword') {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-gold/30">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="w-full max-w-md z-10">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-heading font-light tracking-tight mb-2">Reset Password</h2>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Enter Your New Password</p>
                    </div>
                    <div className="glass-card bg-white/[0.01] border border-white/5 p-8 rounded-[2rem] shadow-2xl relative group">
                        <form className="space-y-6" onSubmit={handleResetPassword}>
                            <div className="group relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors duration-300">
                                    <Lock size={18} strokeWidth={1.5} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-white/[0.03] border border-white/5 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-gold/30 focus:bg-white/[0.05] transition-all duration-300 placeholder:text-gray-700 text-sm font-light"
                                    placeholder="New Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(212,175,55,0.1)' }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gold hover:bg-gold-light text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-xl transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div> : "Reset Password"}
                            </motion.button>
                        </form>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-gold/30">
            {/* Minimalist Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-gold/5 rounded-full blur-[140px]"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-gold/3 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #D4AF37 1px, transparent 0)', backgroundSize: '60px 60px' }}></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-md z-10"
            >
                {/* Branding Section */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8"
                    >
                        <img
                            src={authLogo}
                            alt="Unique Jewelry Studio"
                            className="h-20 w-auto mx-auto object-contain"
                        />
                    </motion.div>
                    <h2 className="text-3xl font-heading font-light tracking-tight mb-2">
                        {isLogin ? 'Sign In' : 'Register'}
                    </h2>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">
                        {isLogin ? 'Secure Access' : 'Create Identity'}
                    </p>
                </div>

                <div className="glass-card bg-white/[0.01] border border-white/5 p-8 rounded-[2rem] shadow-2xl relative group">
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/4 h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent transition-all duration-700 group-hover:w-1/2"></div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'login' : 'signup'}
                                initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-5"
                            >
                                {!isLogin && (
                                    <div className="group relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors duration-300">
                                            <User size={18} strokeWidth={1.5} />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-white/[0.03] border border-white/5 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-gold/30 focus:bg-white/[0.05] transition-all duration-300 placeholder:text-gray-700 text-sm font-light"
                                            placeholder="Full Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                )}
                                <div className="group relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors duration-300">
                                        <Mail size={18} strokeWidth={1.5} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-white/[0.03] border border-white/5 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-gold/30 focus:bg-white/[0.05] transition-all duration-300 placeholder:text-gray-700 text-sm font-light"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="group relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-gold transition-colors duration-300">
                                        <Lock size={18} strokeWidth={1.5} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="w-full bg-white/[0.03] border border-white/5 text-white pl-12 pr-4 py-3.5 rounded-xl focus:outline-none focus:border-gold/30 focus:bg-white/[0.05] transition-all duration-300 placeholder:text-gray-700 text-sm font-light"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                
                                {isLogin && (
                                    <div className="flex justify-end mt-2">
                                        <button 
                                            type="button" 
                                            onClick={handleForgotPassword}
                                            className="text-[10px] text-gray-500 hover:text-gold transition-colors"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <motion.button
                            whileHover={{ scale: 1.01, boxShadow: '0 0 20px rgba(212,175,55,0.1)' }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gold hover:bg-gold-light text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-xl transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>{isLogin ? 'Access Studio' : 'Create Identity'}</span>
                                    <ChevronRight size={16} />
                                </>
                            )}
                        </motion.button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <div className="relative flex justify-center text-[9px] uppercase tracking-[0.4em] font-black">
                                <span className="bg-[#0f0f0f] px-4 text-gray-600">Verification</span>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(212,175,55,0.2)' }}
                            whileTap={{ scale: 0.99 }}
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full py-3.5 border border-white/5 rounded-xl flex items-center justify-center text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 text-gray-500 hover:text-white"
                        >
                            <GoogleIcon />
                            <span>Google Account</span>
                        </motion.button>
                    </form>

                    <div className="mt-10 text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-xs uppercase tracking-[0.2em] font-bold text-gray-600 hover:text-gold transition-colors duration-300 group"
                        >
                            {isLogin ? (
                                <span className="flex items-center justify-center gap-2">
                                    New Client? <span className="text-gold group-hover:underline underline-offset-8 transition-all">Begin Registration</span>
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                    Return to Sign In
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                <p className="text-center text-[9px] text-gray-700 mt-12 font-black uppercase tracking-[0.5em]">
                    &copy; {new Date().getFullYear()} Unique Jewelry Studio &bull; End-to-End Encryption
                </p>
            </motion.div>
        </div>
    );
};

export default Auth;
