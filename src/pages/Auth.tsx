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
        } catch (error: unknown) {
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
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Authentication failed";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-body selection:bg-gold/30">
            {/* Left Side - Inspiring Visual */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-black items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1599643478524-fb66f70a0066?q=80&w=2664&auto=format&fit=crop"
                        alt="Bridal Elegance"
                        className="w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-[20s] ease-in-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                </div>
                
                <div className="relative z-10 p-16 flex flex-col justify-end h-full w-full text-white pb-24">
                    <div className="max-w-xl">
                        <span className="text-gold text-sm tracking-[0.3em] uppercase font-semibold mb-4 block">
                            Bridal Elegance Studio
                        </span>
                        <h1 className="font-heading text-6xl font-medium tracking-wide mb-6 leading-[1.1] text-white">
                            Discover <br/>Your <span className="text-gold italic">Shine.</span>
                        </h1>
                        <p className="font-body text-lg text-gray-300 leading-relaxed max-w-md">
                            Join our exclusive collection of timeless bridal jewelry. Immerse yourself in elegance, crafted for the moments that matter most.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 sm:px-12 lg:px-24 py-20 bg-cream/10">
                <div className="max-w-md w-full space-y-10">
                    <div className="text-center lg:text-left pt-10 lg:pt-0">
                        <h2 className="text-4xl font-heading font-medium text-foreground tracking-wide mb-3">
                            {isLogin ? 'Welcome Back' : 'Join the Studio'}
                        </h2>
                        <p className="text-base text-muted-foreground font-body">
                            {isLogin ? 'Sign in to access your curated collection.' : 'Create an account to save your favorite pieces.'}
                        </p>
                    </div>

                    <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            {!isLogin && (
                                <div className="relative group">
                                    <User className="absolute left-4 top-3.5 text-muted-foreground group-focus-within:text-gold transition-colors" size={20} />
                                    <input
                                        type="text"
                                        required
                                        className="appearance-none block w-full pl-12 pr-4 py-3.5 border border-border placeholder-muted-foreground text-foreground rounded-lg focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold sm:text-sm bg-white shadow-sm transition-all"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                            )}
                            <div className="relative group">
                                <Mail className="absolute left-4 top-3.5 text-muted-foreground group-focus-within:text-gold transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    className="appearance-none block w-full pl-12 pr-4 py-3.5 border border-border placeholder-muted-foreground text-foreground rounded-lg focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold sm:text-sm bg-white shadow-sm transition-all"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-3.5 text-muted-foreground group-focus-within:text-gold transition-colors" size={20} />
                                <input
                                    type="password"
                                    required
                                    className="appearance-none block w-full pl-12 pr-4 py-3.5 border border-border placeholder-muted-foreground text-foreground rounded-lg focus:outline-none focus:ring-1 focus:ring-gold focus:border-gold sm:text-sm bg-white shadow-sm transition-all"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gold hover:bg-gold-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                                {!loading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase tracking-widest font-medium">
                                <span className="bg-[#fcfbf9] px-4 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-border rounded-lg bg-white hover:bg-cream/50 text-sm font-semibold text-foreground transition-all duration-200 shadow-sm hover:shadow"
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" alt="Google" className="w-5 h-5" />
                            Google Sign-In
                        </button>
                    </form>

                    <div className="text-center lg:text-left mt-8">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm font-medium text-muted-foreground hover:text-gold transition-colors"
                        >
                            {isLogin ? (
                                <>New to the studio? <span className="text-gold font-semibold underline decoration-transparent hover:decoration-gold transition-all">Create an account</span></>
                            ) : (
                                <>Already have an account? <span className="text-gold font-semibold underline decoration-transparent hover:decoration-gold transition-all">Sign In</span></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
