import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PropertyModal from '@/components/modals/PropertyModal';
import PropertyForm from '@/components/forms/PropertyForm';
import { 
  Building2, 
  DollarSign, 
  MapPin, 
  Clock, 
  Plus, 
  Bed, 
  Bath, 
  Square,
  User
} from 'lucide-react';

const Properties = () => {
  const { isAuthenticated, user } = useAuth();
  const { properties } = useData();
  const navigate = useNavigate();
  
  const [selectedProperty, setSelectedProperty] = useState<typeof properties[0] | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<typeof properties[0] | null>(null);

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
    ? properties 
    : properties.filter(property => property.assignedAgent === user?.name);

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

  const handlePropertyClick = (property: typeof properties[0]) => {
    setSelectedProperty(property);
    setShowModal(true);
  };

  const handleEditProperty = (property?: typeof properties[0]) => {
    setEditingProperty(property || null);
    setShowForm(true);
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedProperty(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProperty(null);
  };

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
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              {user?.role === 'manager' ? 'All Properties' : 'Your Properties'}: <span className="font-medium text-foreground">{visibleProperties.length}</span>
            </div>
            {user?.role === 'manager' && (
              <Button 
                onClick={() => handleEditProperty()}
                className="bg-gradient-primary hover:opacity-90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            )}
          </div>
        </div>

        {/* Property Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-card hover:shadow-elevated transition-shadow animate-fade-in">
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

          <Card className="shadow-card hover:shadow-elevated transition-shadow animate-fade-in">
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

          <Card className="shadow-card hover:shadow-elevated transition-shadow animate-fade-in">
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

          <Card className="shadow-card hover:shadow-elevated transition-shadow animate-fade-in">
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

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleProperties.map((property) => (
            <Card 
              key={property.id} 
              className="shadow-card hover:shadow-elevated transition-all cursor-pointer group animate-fade-in hover-scale"
              onClick={() => handlePropertyClick(property)}
            >
              <div className="relative">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-3 right-3">
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
                </div>
              </div>
              
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {property.title}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">{property.location}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span className="text-lg font-bold text-foreground">{property.price}</span>
                  </div>
                  {user?.role === 'manager' && (
                    <div className="flex items-center text-muted-foreground">
                      <User className="h-4 w-4 mr-2" />
                      <span className="text-sm">{property.assignedAgent}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    <span>{property.bedrooms}</span>
                  </div>
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    <span>{property.bathrooms}</span>
                  </div>
                  <div className="flex items-center">
                    <Square className="h-4 w-4 mr-1" />
                    <span>{property.sqft.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {visibleProperties.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Properties Found</h3>
              <p className="text-muted-foreground">
                {user?.role === 'manager' 
                  ? 'Get started by adding your first property listing.'
                  : 'No properties have been assigned to you yet.'
                }
              </p>
              {user?.role === 'manager' && (
                <Button 
                  className="mt-4 bg-gradient-primary hover:opacity-90"
                  onClick={() => handleEditProperty()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Property Modal */}
      <PropertyModal
        property={selectedProperty}
        open={showModal}
        onClose={handleCloseModal}
        onEdit={() => handleEditProperty(selectedProperty)}
      />

      {/* Property Form */}
      <PropertyForm
        property={editingProperty}
        open={showForm}
        onClose={handleCloseForm}
      />
    </DashboardLayout>
  );
};

export default Properties;