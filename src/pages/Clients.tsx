import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockClients } from '@/data/mockData';
import { UserCheck, Flame, ThermometerSun, Snowflake } from 'lucide-react';

const Clients = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  // Filter clients based on user role
  const visibleClients = user?.role === 'manager' 
    ? mockClients 
    : mockClients.filter(client => client.assignedAgent === user?.name);

  const leadStats = {
    hot: visibleClients.filter(client => client.leadTier === 'Hot').length,
    warm: visibleClients.filter(client => client.leadTier === 'Warm').length,
    cold: visibleClients.filter(client => client.leadTier === 'Cold').length,
    total: visibleClients.length
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clients</h1>
            <p className="text-muted-foreground">
              {user?.role === 'manager' 
                ? 'Manage all client relationships and lead tiers' 
                : 'Manage your assigned clients and lead pipeline'
              }
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {user?.role === 'manager' ? 'All Clients' : 'Your Clients'}: <span className="font-medium text-foreground">{visibleClients.length}</span>
          </div>
        </div>

        {/* Lead Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-foreground">
                  {leadStats.total}
                </div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <Flame className="h-6 w-6 text-red-500" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-foreground">
                  {leadStats.hot}
                </div>
                <p className="text-sm text-muted-foreground">Hot Leads</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 bg-orange-50 rounded-lg flex items-center justify-center">
                  <ThermometerSun className="h-6 w-6 text-orange-500" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-foreground">
                  {leadStats.warm}
                </div>
                <p className="text-sm text-muted-foreground">Warm Leads</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Snowflake className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-foreground">
                  {leadStats.cold}
                </div>
                <p className="text-sm text-muted-foreground">Cold Leads</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clients Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="mr-2 h-5 w-5 text-primary" />
              Client Directory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    {user?.role === 'manager' && <TableHead>Assigned Agent</TableHead>}
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Lead Tier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-mono text-sm">
                        #{client.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {client.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div>
                          <div className="text-sm">{client.email}</div>
                          <div className="text-sm">{client.phone}</div>
                        </div>
                      </TableCell>
                      {user?.role === 'manager' && (
                        <TableCell className="text-muted-foreground">
                          {client.assignedAgent}
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge 
                          variant={client.status === 'Active' ? 'default' : 'secondary'}
                          className={client.status === 'Active' ? 'bg-success text-success-foreground' : ''}
                        >
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant="outline"
                          className={
                            client.leadTier === 'Hot' ? 'border-red-500 text-red-700 bg-red-50' :
                            client.leadTier === 'Warm' ? 'border-orange-500 text-orange-700 bg-orange-50' :
                            'border-blue-500 text-blue-700 bg-blue-50'
                          }
                        >
                          <span className="flex items-center">
                            {client.leadTier === 'Hot' && <Flame className="h-3 w-3 mr-1" />}
                            {client.leadTier === 'Warm' && <ThermometerSun className="h-3 w-3 mr-1" />}
                            {client.leadTier === 'Cold' && <Snowflake className="h-3 w-3 mr-1" />}
                            {client.leadTier}
                          </span>
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Clients;