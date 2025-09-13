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
import { mockProperties } from '@/data/mockData';
import { Building2, DollarSign, MapPin, Clock } from 'lucide-react';

const Properties = () => {
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

  // Filter properties based on user role
  const visibleProperties = user?.role === 'manager' 
    ? mockProperties 
    : mockProperties.filter(property => property.assignedAgent === user?.name);

  const propertyStats = {
    available: visibleProperties.filter(prop => prop.status === 'Available').length,
    pending: visibleProperties.filter(prop => prop.status === 'Pending').length,
    sold: visibleProperties.filter(prop => prop.status === 'Sold').length,
    total: visibleProperties.length
  };

  const totalValue = visibleProperties.reduce((sum, prop) => {
    const value = parseInt(prop.price.replace(/[$,]/g, ''));
    return sum + value;
  }, 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Properties</h1>
            <p className="text-muted-foreground">
              {user?.role === 'manager' 
                ? 'Manage all property listings and inventory' 
                : 'Manage your assigned property portfolio'
              }
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {user?.role === 'manager' ? 'All Properties' : 'Your Properties'}: <span className="font-medium text-foreground">{visibleProperties.length}</span>
          </div>
        </div>

        {/* Property Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-foreground">
                  {propertyStats.total}
                </div>
                <p className="text-sm text-muted-foreground">Total Properties</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-success" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-foreground">
                  {propertyStats.available}
                </div>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-foreground">
                  {propertyStats.pending}
                </div>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-foreground">
                  ${(totalValue / 1000000).toFixed(1)}M
                </div>
                <p className="text-sm text-muted-foreground">Total Value</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="mr-2 h-5 w-5 text-primary" />
              Property Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    {user?.role === 'manager' && <TableHead>Assigned Agent</TableHead>}
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleProperties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-mono text-sm">
                        #{property.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {property.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {property.location}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {property.price}
                      </TableCell>
                      {user?.role === 'manager' && (
                        <TableCell className="text-muted-foreground">
                          {property.assignedAgent}
                        </TableCell>
                      )}
                      <TableCell className="text-center">
                        <Badge 
                          variant={
                            property.status === 'Available' ? 'default' :
                            property.status === 'Pending' ? 'secondary' :
                            'outline'
                          }
                          className={
                            property.status === 'Available' ? 'bg-success text-success-foreground' :
                            property.status === 'Pending' ? 'bg-warning text-warning-foreground' :
                            'bg-muted text-muted-foreground'
                          }
                        >
                          {property.status}
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

export default Properties;