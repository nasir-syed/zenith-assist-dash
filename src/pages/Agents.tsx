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
import { mockAgents } from '@/data/mockData';
import { Users, Mail, UserCheck, Building2 } from 'lucide-react';

const Agents = () => {
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agents</h1>
            <p className="text-muted-foreground">
              Manage your real estate team and track performance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Total Agents: <span className="font-medium text-foreground">{mockAgents.length}</span>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-foreground">
                  {mockAgents.length}
                </div>
                <p className="text-sm text-muted-foreground">Total Agents</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-success" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-foreground">
                  {mockAgents.reduce((sum, agent) => sum + agent.assignedClients, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Total Clients</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-warning" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-foreground">
                  {mockAgents.reduce((sum, agent) => sum + agent.assignedProperties, 0)}
                </div>
                <p className="text-sm text-muted-foreground">Total Properties</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Mail className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-foreground">
                  {Math.round(mockAgents.reduce((sum, agent) => sum + agent.assignedClients, 0) / mockAgents.length)}
                </div>
                <p className="text-sm text-muted-foreground">Avg Clients/Agent</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agents Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" />
              Agent Directory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Assigned Clients</TableHead>
                    <TableHead className="text-center">Assigned Properties</TableHead>
                    <TableHead className="text-center">Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAgents.map((agent) => {
                    const performanceLevel = agent.assignedClients >= 12 ? 'high' : agent.assignedClients >= 8 ? 'medium' : 'low';
                    const performanceColor = performanceLevel === 'high' ? 'success' : performanceLevel === 'medium' ? 'warning' : 'destructive';
                    const performanceText = performanceLevel === 'high' ? 'High' : performanceLevel === 'medium' ? 'Medium' : 'Low';
                    
                    return (
                      <TableRow key={agent.id}>
                        <TableCell className="font-mono text-sm">
                          #{agent.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {agent.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {agent.email}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            {agent.assignedClients}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">
                            {agent.assignedProperties}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={performanceColor === 'success' ? 'default' : 'secondary'}
                            className={
                              performanceColor === 'success' ? 'bg-success text-success-foreground' :
                              performanceColor === 'warning' ? 'bg-warning text-warning-foreground' :
                              'bg-destructive text-destructive-foreground'
                            }
                          >
                            {performanceText}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Agents;