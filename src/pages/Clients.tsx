import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import ClientForm from '@/components/forms/ClientForm';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, Flame, ThermometerSun, Snowflake, Plus, Edit, Trash2 } from 'lucide-react';
import { Client } from '@/data/mockData';

const Clients = () => {
  const { isAuthenticated, user } = useAuth();
  const { clients, deleteClient } = useData();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

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
    ? clients 
    : clients.filter(client => client.assignedAgent === user?.name);

  const leadStats = {
    hot: visibleClients.filter(client => client.leadTier === 'Hot').length,
    warm: visibleClients.filter(client => client.leadTier === 'Warm').length,
    cold: visibleClients.filter(client => client.leadTier === 'Cold').length,
    total: visibleClients.length
  };

  const handleEditClient = (client?: Client) => {
    setEditingClient(client || null);
    setShowForm(true);
  };

  const handleDeleteClient = (client: Client) => {
    if (confirm(`Are you sure you want to delete ${client.name}?`)) {
      deleteClient(client.id);
      toast({
        title: "Client Deleted",
        description: `${client.name} has been removed from client list.`,
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingClient(null);
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
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              {user?.role === 'manager' ? 'All Clients' : 'Your Clients'}: <span className="font-medium text-foreground">{visibleClients.length}</span>
            </div>
            {user?.role === 'manager' && (
              <Button 
                onClick={() => handleEditClient()}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            )}
          </div>
        </div>

        {/* Lead Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-card hover:shadow-elevated transition-shadow animate-fade-in">
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

          <Card className="shadow-card hover:shadow-elevated transition-shadow animate-fade-in">
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

          <Card className="shadow-card hover:shadow-elevated transition-shadow animate-fade-in">
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

          <Card className="shadow-card hover:shadow-elevated transition-shadow animate-fade-in">
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
        <Card className="shadow-card animate-fade-in">
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
                    {user?.role === 'manager' && <TableHead className="text-center">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleClients.map((client) => (
                    <TableRow key={client.id} className="hover:bg-secondary/50 transition-colors">
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
                      {user?.role === 'manager' && (
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClient(client)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClient(client)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {visibleClients.length === 0 && (
              <div className="p-12 text-center">
                <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Clients Found</h3>
                <p className="text-muted-foreground mb-4">
                  {user?.role === 'manager' 
                    ? 'Get started by adding your first client.'
                    : 'No clients have been assigned to you yet.'
                  }
                </p>
                {user?.role === 'manager' && (
                  <Button 
                    onClick={() => handleEditClient()}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Client Form */}
      <ClientForm
        client={editingClient}
        open={showForm}
        onClose={handleCloseForm}
      />
    </DashboardLayout>
  );
};

export default Clients;