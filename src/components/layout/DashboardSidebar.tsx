import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  Building2, 
  LogOut,
  Search,
  Calendar,
  Home
} from 'lucide-react';

const DashboardSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const managerLinks = [
    { path: '/dashboard/agents', label: 'Agents', icon: Users },
    { path: '/dashboard/clients', label: 'Clients', icon: UserCheck },
    { path: '/dashboard/properties', label: 'Properties', icon: Building2 },
    { path: '/dashboard/search-leads', label: 'Search', icon: Search },
    { path: '/dashboard/campaigns', label: 'Campaign', icon: Calendar }
  ];

  const agentLinks = [
    { path: '/dashboard/clients', label: 'Clients', icon: UserCheck },
    { path: '/dashboard/properties', label: 'Properties', icon: Building2 },
    { path: '/dashboard/search-leads', label: 'Search', icon: Search },
    { path: '/dashboard/campaigns', label: 'Campaign', icon: Calendar }
  ];

  const links = user?.role === 'manager' ? managerLinks : agentLinks;

  const handleLogout = () => {
    logout();
    navigate('/')
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border shadow-elevated">
      <div className="p-6">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 mb-8">
          <Building2 className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-foreground">RealtyCo</span>
        </Link>

        {/* User Info */}
        <div className="mb-8 p-4 bg-secondary rounded-lg">
          <p className="text-sm font-medium text-foreground">{user?.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="mt-8 space-y-2">
          <Link to="/">
            <Button variant="outline" className="w-full justify-start">
              <Home className="h-4 w-4 mr-2" />
              Back to Site
            </Button>
          </Link>
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="w-full justify-start"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;