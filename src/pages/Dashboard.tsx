import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Flame,
  ThermometerSun,
  Snowflake,
  Calendar,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

type ActivityItem = {
  _id?: string;
  actorId?: string;
  actorRole?: string;
  actorEmail?: string;
  action: 'created' | 'updated' | 'deleted' | string;
  entity: 'Client' | 'Property' | 'Agent' | string;
  entityId?: string;
  message?: string;
  diff?: Record<string, unknown>;
  createdAt?: string;
};

function timeAgo(dateLike: string | number | Date) {
  const d = new Date(dateLike);
  const s = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Build query string for prototype auth-less calls
  const query = useMemo(() => {
    if (!user) return '';
    const params = new URLSearchParams();
    params.set('role', user.role); // 'manager' | 'agent'
    if (user.role === 'agent') {
      params.set('agentId', user.id); // send raw id
    }
    return `?${params.toString()}`;
  }, [user]);

  const [metricsData, setMetricsData] = useState({
    totalLeads: 0,
    hotLeads: 0,
    warmLeads: 0,
    coldLeads: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState<string | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Fetch metrics (role/agentId via query params)
  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_BASE}/api/clients/metrics${query}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`.trim());
        }

        const data = await res.json();
        setMetricsData({
          totalLeads: data.totalLeads ?? 0,
          hotLeads: data.hotLeads ?? 0,
          warmLeads: data.warmLeads ?? 0,
          coldLeads: data.coldLeads ?? 0,
        });
      } catch (err: any) {
        console.error('Failed to load metrics:', err);
        setError(err?.message || 'Failed to load metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [user, query]);

  // Fetch Recent Activity (7-day window) + poll every 60s (role/agentId via query)
  useEffect(() => {
    let interval: number | undefined;

    const fetchActivity = async () => {
      if (!user) return;
      try {
        setActivityLoading(true);
        setActivityError(null);

        const res = await fetch(`${API_BASE}/api/activity?days=7${query ? `&${query.slice(1)}` : ''}`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status} ${res.statusText} ${text}`.trim());
        }

        const data: ActivityItem[] = await res.json();
        setActivity(data);
      } catch (e: any) {
        console.error('Failed to load activity:', e);
        setActivityError(e?.message || 'Failed to load activity');
      } finally {
        setActivityLoading(false);
      }
    };

    fetchActivity();
    interval = window.setInterval(fetchActivity, 60_000);
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [user, query]);

  if (!isAuthenticated || !user) return null;

  const metrics = [
    {
      title: 'Total Leads',
      value: metricsData.totalLeads,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Hot Leads',
      value: metricsData.hotLeads,
      icon: Flame,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Warm Leads',
      value: metricsData.warmLeads,
      icon: ThermometerSun,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Cold Leads',
      value: metricsData.coldLeads,
      icon: Snowflake,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. Here's your overview.
          </p>
        </div>

        {/* Manager view */}
        {user.role === 'manager' ? (
          <>
            {/* Loading / Error states for metrics */}
            {loading && (
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <p className="text-muted-foreground">Loading metrics…</p>
                </CardContent>
              </Card>
            )}
            {error && (
              <Card className="shadow-card border-destructive/40">
                <CardContent className="p-6">
                  <p className="text-destructive text-sm">
                    Failed to load metrics: {error}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Manager Metrics Cards */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {metrics.map((metric, index) => {
                  const Icon = metric.icon;
                  return (
                    <Card key={index} className="shadow-card hover:shadow-elevated transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${metric.bgColor}`}>
                            <Icon className={`h-6 w-6 ${metric.color}`} />
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
            )}

            {/* Recent Activity (live, 7-day window) */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-10 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activityLoading && (
                  <p className="text-muted-foreground">Loading recent activity…</p>
                )}
                {activityError && (
                  <p className="text-destructive text-sm">Failed: {activityError}</p>
                )}
                {!activityLoading && !activityError && activity.length === 0 && (
                  <p className="text-muted-foreground text-sm">No changes in the last 7 days.</p>
                )}
                {!activityLoading && !activityError && activity.length > 0 && (
                  <div className="space-y-4">
                    {activity.map((evt, i) => {
                      const dotColor =
                        evt.action === 'created'
                          ? 'bg-success'
                          : evt.action === 'updated'
                          ? 'bg-primary'
                          : 'bg-warning';
                      return (
                        <div
                          key={evt._id || i}
                          className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg"
                        >
                          <div className={`h-2 w-2 rounded-full ${dotColor}`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {evt.message || `${evt.action} ${evt.entity} ${evt.entityId ?? ''}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(evt.actorEmail || evt.actorRole || '').toString()} • {evt.entity}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {evt.createdAt ? timeAgo(evt.createdAt) : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          // Agent view (same metrics + Recent Activity; backend scopes using agentId)
          <>
            {loading && (
              <Card className="shadow-card">
                <CardContent className="p-6">
                  <p className="text-muted-foreground">Loading metrics…</p>
                </CardContent>
              </Card>
            )}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {metrics.map((metric, index) => {
                  const Icon = metric.icon;
                  return (
                    <Card key={index} className="shadow-card hover:shadow-elevated transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${metric.bgColor}`}>
                            <Icon className={`h-6 w-6 ${metric.color}`} />
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
            )}

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-10 w-5 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activityLoading && (
                  <p className="text-muted-foreground">Loading recent activity…</p>
                )}
                {activityError && (
                  <p className="text-destructive text-sm">Failed: {activityError}</p>
                )}
                {!activityLoading && !activityError && activity.length === 0 && (
                  <p className="text-muted-foreground text-sm">No changes in the last 7 days.</p>
                )}
                {!activityLoading && !activityError && activity.length > 0 && (
                  <div className="space-y-4">
                    {activity.map((evt, i) => {
                      const dotColor =
                        evt.action === 'created'
                          ? 'bg-success'
                          : evt.action === 'updated'
                          ? 'bg-primary'
                          : 'bg-warning';
                      return (
                        <div
                          key={evt._id || i}
                          className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg"
                        >
                          <div className={`h-2 w-2 rounded-full ${dotColor}`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {evt.message || `${evt.action} ${evt.entity} ${evt.entityId ?? ''}`}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(evt.actorEmail || evt.actorRole || '').toString()} • {evt.entity}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {evt.createdAt ? timeAgo(evt.createdAt) : ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
