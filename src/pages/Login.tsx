import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building2, LogIn, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (login(formData.email, formData.password)) {
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const fillDemoCredentials = (role: 'manager' | 'agent') => {
    if (role === 'manager') {
      setFormData({
        email: 'manager@realtyco.com',
        password: 'manager123'
      });
    } else {
      setFormData({
        email: 'agent@realtyco.com',
        password: 'agent123'
      });
    }
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2">
            <Building2 className="h-10 w-10 text-primary" />
            <span className="text-2xl font-bold text-foreground">RealtyCo</span>
          </Link>
        </div>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center">
              <LogIn className="mr-2 h-5 w-5 text-primary" />
              Agent Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="rounded-md"
                  placeholder="Enter your email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="rounded-md pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:opacity-90"
                size="lg"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Demo Credentials
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials('manager')}
                  className="text-xs"
                >
                  Manager Demo
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fillDemoCredentials('agent')}
                  className="text-xs"
                >
                  Agent Demo
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link 
                to="/" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                ← Back to Homepage
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;