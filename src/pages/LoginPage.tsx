import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const mockUser = {
        id: '1',
        email: email,
        name: 'Admin User',
        role: 'Administrator',
      };
      const mockToken = 'mock-jwt-token';
      
      login(mockUser, mockToken);
      toast.success('Welcome back!');
      navigate('/');
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 shadow-2xl gradient-border">
          <div className="flex items-center justify-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="relative"
            >
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="text-white" size={32} />
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 blur-xl opacity-50 animate-pulse" />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Sign in to access Mirai Admin
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-muted/50 border border-border outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-lg bg-muted/50 border border-border outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg transition-all hover:opacity-90 focus:ring-2 focus:ring-accent/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-6 text-center text-sm text-muted-foreground"
          >
            Demo credentials: Use any email and password
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}