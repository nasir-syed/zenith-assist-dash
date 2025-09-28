import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import PublicNavbar from '@/components/layout/PublicNavbar';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [role, setRole] = useState<'agent' | 'manager' | ''>('');
  const { setAuth } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      const parsedUser = JSON.parse(user); // parse saved user object
      if (parsedUser.role === 'agent') {
        navigate('/dashboard/clients', { replace: true });
      } else {
        navigate('/dashboard/agents', { replace: true });
      }
    }
  }, [navigate]);
 


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) {
      toast({
        title: 'Role Required',
        description: 'Please select a role before logging in.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, email: formData.email, password: formData.password }),
      });

      const data = await res.json();

      if (res.ok) {
        setAuth(data.user, data.token); // 👈 updates context + localStorage

        toast({
          title: 'Login Successful',
          description: `Welcome back, ${data.user.name || data.user.email}!`,
        });

        if (role == 'agent') {
          navigate('/dashboard/clients', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
          toast({
            title: 'Login Failed',
            description: data.error || 'Invalid credentials.',
            variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Server Error',
        description: 'Could not connect to server. Please try again.',
        variant: 'destructive',
      });
      console.error(err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (value: 'manager' | 'agent' | '') => {
    setRole(value);
    setFormData({ email: '', password: '' }); // clear inputs when switching role
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
      <PublicNavbar />
      <div className="w-full max-w-md">
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center">
              Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <div className="relative">
                  <select
                    id="role"
                    value={role}
                    onChange={(e) =>
                      handleRoleChange(e.target.value as 'manager' | 'agent' | '')
                    }
                    className="w-full appearance-none rounded-md border border-input bg-background px-3 pr-8 h-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Select Role</option>
                    <option value="manager">Manager</option>
                    <option value="agent">Agent</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

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
                    type={showPassword ? 'text' : 'password'}
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
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-primary hover:opacity-90"
                size="lg"
              >
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
