import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';

const PublicNavbar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 w-full bg-card border-b border-border z-50 shadow-card">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">RealtyCo</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-12 mr-12">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/assistant" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/assistant') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              AI Assistant
            </Link>
            <Link 
              to="/contact" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/contact') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Contact
            </Link>
          </div>

          {/* Login Button */}
          <Link to="/login">
            <Button variant="default" className="bg-gradient-primary hover:opacity-90">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;