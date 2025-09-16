import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockMetrics } from '@/data/mockData';
import { 
  Users, 
  Flame, 
  ThermometerSun, 
  Snowflake, 
  Calendar,
  TrendingUp,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.role !== 'manager') {
      navigate('/dashboard/clients');
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.role !== 'manager') {
    return null;
  }

  const metrics = [
    {
      title: 'Total Leads',
      value: mockMetrics.totalLeads,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      change: '+12%',
      trend: 'up'
    },
    {
      title: 'Hot Leads',
      value: mockMetrics.hotLeads,
      icon: Flame,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      change: '+8%',
      trend: 'up'
    },
    {
      title: 'Warm Leads',
      value: mockMetrics.warmLeads,
      icon: ThermometerSun,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      change: '+5%',
      trend: 'up'
    },
    {
      title: 'Cold Leads',
      value: mockMetrics.coldLeads,
      icon: Snowflake,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      change: '-3%',
      trend: 'down'
    },
    {
      title: 'Upcoming Viewings',
      value: mockMetrics.upcomingViewings,
      icon: Calendar,
      color: 'text-success',
      bgColor: 'bg-green-50',
      change: '+15%',
      trend: 'up'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. Here's your business overview.
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const TrendIcon = metric.trend === 'up' ? ArrowUp : ArrowDown;
            
            return (
              <Card key={index} className="shadow-card hover:shadow-elevated transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${metric.bgColor}`}>
                      <Icon className={`h-6 w-6 ${metric.color}`} />
                    </div>
                    <div className={`flex items-center text-sm ${
                      metric.trend === 'up' ? 'text-success' : 'text-destructive'
                    }`}>
                      <TrendIcon className="h-3 w-3 mr-1" />
                      {metric.change}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-2xl font-bold text-foreground">
                      {metric.value}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {metric.title}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-1 gap-6">
          {/*<Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                Lead Generation Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-secondary/50 rounded-lg">
                <p className="text-muted-foreground">Chart placeholder - Lead trends over time</p>
              </div>
            </CardContent>
          </Card> */}

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-10 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg">
                  <div className="h-2 w-2 bg-success rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">New lead: John Smith</p>
                    <p className="text-xs text-muted-foreground">Interested in downtown condo</p>
                  </div>
                  <span className="text-xs text-muted-foreground">2h ago</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg">
                  <div className="h-2 w-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Viewing scheduled</p>
                    <p className="text-xs text-muted-foreground">Luxury Waterfront Villa - Tomorrow 2 PM</p>
                  </div>
                  <span className="text-xs text-muted-foreground">4h ago</span>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg">
                  <div className="h-2 w-2 bg-warning rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Property status changed</p>
                    <p className="text-xs text-muted-foreground">Suburban Family Home now pending</p>
                  </div>
                  <span className="text-xs text-muted-foreground">6h ago</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;