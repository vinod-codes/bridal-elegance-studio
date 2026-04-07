import React, { useState } from 'react';
import { auth, db } from '../config/firebase';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    GoogleAuthProvider, 
    signInWithPopup 
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        setLoading(true);
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            
            // Register user in Firestore if they don't exist
            const userSnap = await getDoc(doc(db, 'users', user.uid));
            if (!userSnap.exists()) {
                await setDoc(doc(db, 'users', user.uid), {
                    email: user.email,
                    name: user.displayName || 'Guest User',
                    isAdmin: false, // DEFAULT: Only manual Firestore editing makes an admin
                    createdAt: serverTimestamp()
                });
            }
            toast.success('Signed in with Google!');
            navigate('/');
        } catch (error: any) {
            toast.error('Google Sign-In failed');
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
                
                // Create user document in Firestore (default as visitor, NOT admin)
                await setDoc(doc(db, 'users', user.uid), {
                    email: user.email,
                    name: name,
                    isAdmin: false,
                    createdAt: serverTimestamp()
                });
                toast.success('Account created successfully!');
                navigate('/');
            }
        } catch (error: any) {
            toast.error(error.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-20 mt-10">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gold/10">
                <div className="text-center">
                    <h2 className="text-4xl font-heading font-medium text-gold tracking-widest uppercase">
                        {isLogin ? 'Sign In' : 'Join Us'}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground font-body">
                        {isLogin ? 'Access your exclusive collection' : 'Become a part of Bridal Elegance'}
                    </p>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <div className="rounded-md space-y-4">
                        {!isLogin && (
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gold/60" size={20} />
                                <input
                                    type="text"
                                    required
                                    className="appearance-none relative block w-full px-12 py-3 border border-border placeholder-muted-foreground text-foreground rounded-lg focus:outline-none focus:ring-gold focus:border-gold focus:z-10 sm:text-sm bg-cream/30"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        )}
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-gold/60" size={20} />
                            <input
                                type="email"
                                required
                                className="appearance-none relative block w-full px-12 py-3 border border-border placeholder-muted-foreground text-foreground rounded-lg focus:outline-none focus:ring-gold focus:border-gold focus:z-10 sm:text-sm bg-cream/30"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gold/60" size={20} />
                            <input
                                type="password"
                                required
                                className="appearance-none relative block w-full px-12 py-3 border border-border placeholder-muted-foreground text-foreground rounded-lg focus:outline-none focus:ring-gold focus:border-gold focus:z-10 sm:text-sm bg-cream/30"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-gold hover:bg-gold-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold transition-all duration-300 btn-glow"
                        >
                            {loading ? 'Processing...' : (isLogin ? 'SIGN IN' : 'REGISTER')}
                        </button>
                    </div>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                        <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">Or continue with</span></div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-200 rounded-full bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-all duration-200"
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" alt="Google" className="w-5 h-5" />
                        Google Sign-In
                    </button>
                </form>

                <div className="text-center mt-4">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm font-medium text-gold hover:text-gold-dark transition-colors"
                    >
                        {isLogin ? "Don't have an account? Register" : "Already have an account? Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
