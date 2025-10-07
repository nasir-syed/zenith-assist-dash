import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PropertyModal from '@/components/modals/PropertyModal';
import PropertyForm from '@/components/forms/PropertyForm';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal';
import { 
  Building2, 
  DollarSign, 
  MapPin, 
  Clock, 
  Plus,
  User 
} from 'lucide-react';
import { Property } from '@/data/mockData';

interface Agent {
  id: string;
  name: string;
}

const Properties = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [properties, setProperties] = useState<Property[]>([]);
  const [agentsList, setAgentsList] = useState<Agent[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  // Fetch properties
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/properties');
      if (!res.ok) throw new Error('Failed to fetch properties');
      const data: Property[] = await res.json();
      setProperties(data);
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Fetch agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/agents');
        if (!res.ok) throw new Error('Failed to fetch agents');
        const data = await res.json();
        const mapped = data.map((a: any) => ({
          id: a._id,
          name: a.fullName || a.name || a.username,
        }));
        setAgentsList(mapped);
      } catch (err) {
        console.error('Error fetching agents:', err);
      }
    };
    fetchAgents();
  }, []);

  if (!isAuthenticated) return null;

  // Filter properties based on user role
  const visibleProperties = user?.role === 'manager'
    ? properties
    : properties.filter(p => p.assignedAgent === user?.id);

  // Stats
  const propertyStats = {
    available: visibleProperties.filter(p => p.status === 'Available').length,
    pending: visibleProperties.filter(p => p.status === 'Pending').length,
    sold: visibleProperties.filter(p => p.status === 'Sold').length,
    total: visibleProperties.length,
  };

  const totalValue = visibleProperties.reduce((sum, prop) => sum + (prop.price || 0), 0);

  const openForm = (property?: Property) => {
    setEditingProperty(property || null);
    setShowForm(true);
    setShowModal(false);
  };

  const openModal = (property: Property) => {
    setSelectedProperty(property);
    setShowModal(true);
  };

  const getAgentName = (id?: string) => {
    if (!id) return 'Unassigned';
    return agentsList.find(a => a.id === id)?.name || 'Unknown';
  };

  // Handle property save/update
  const handlePropertySaved = (savedProperty: Property, isEdit: boolean) => {
    setProperties(prev =>
      isEdit
        ? prev.map(p => (p.id === savedProperty.id ? savedProperty : p))
        : [...prev, savedProperty]
    );
    setShowForm(false);
    setEditingProperty(null);
    setShowModal(false);
    setSelectedProperty(null);
  };

  // Open delete confirmation modal
  const handleDeleteRequest = (property: Property) => {
    setPropertyToDelete(property);
    setShowDeleteModal(true);
    setShowModal(false); // Close property modal
  };

  // Confirm delete property
  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return;
    
    try {
      setDeleteLoading(true);
      const res = await fetch(`http://localhost:5000/api/properties/${propertyToDelete.id}`, { 
        method: 'DELETE' 
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete property');
      }
      
      setProperties(prev => prev.filter(p => p.id !== propertyToDelete.id));
      setShowDeleteModal(false);
      setPropertyToDelete(null);
      setSelectedProperty(null);
      setEditingProperty(null);
    } catch (err: any) {
      console.error('Error deleting property:', err);
      // You could show a toast notification here instead of alert
      alert(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Cancel delete
  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPropertyToDelete(null);
    // Reopen property modal if it was open
    if (selectedProperty) {
      setShowModal(true);
    }
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
                : 'Manage your assigned property portfolio'}
            </p>
          </div>
          <Button onClick={() => openForm()} className="bg-gradient-primary hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-card hover:shadow-elevated transition-shadow">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <div className="h-6 w-6 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="mt-4 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold">{propertyStats.total}</div>
                <p className="text-sm text-muted-foreground">Total Properties</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-shadow">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <div className="h-6 w-6 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-success" />
              </div>
              <div className="mt-4 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold">{propertyStats.available}</div>
                <p className="text-sm text-muted-foreground">Available</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-shadow">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <div className="h-6 w-6 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div className="mt-4 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold">{propertyStats.pending}</div>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-shadow">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <div className="h-6 w-6 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-accent" />
              </div>
              <div className="mt-4 flex flex-col items-center justify-center">
                <div className="text-2xl font-bold">AED {(totalValue / 1_000_000).toFixed(1)}M</div>
                <p className="text-sm text-muted-foreground items-center">Total Value</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading properties...</p>
            </div>
          </div>
        ) : visibleProperties.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
              <p className="text-muted-foreground">
                {user?.role === 'manager'
                  ? 'Get started by adding your first property listing.'
                  : 'No properties have been assigned to you yet.'}
              </p>
              {user?.role === 'manager' && (
                <Button className="mt-4 bg-gradient-primary" onClick={() => openForm()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleProperties.map(p => (
              <Card 
                key={p.id} 
                className="shadow-card hover:shadow-elevated transition-all cursor-pointer group"
                onClick={() => openModal(p)}
              >
                <div className="relative">
                  {p.cover_photo && (
                    <img
                      src={p.cover_photo}
                      alt={p.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                      onError={e => ((e.target as HTMLImageElement).style.display = 'none')}
                    />
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={p.status === 'Available' ? 'default' : p.status === 'Pending' ? 'secondary' : 'destructive'}
                    >
                      {p.status}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                    {p.title}
                  </h3>
                  <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{p.community}{p.subCommunity ? `, ${p.subCommunity}` : ''}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span className="font-bold text-foreground">AED {p.price.toLocaleString()}</span>
                    </div>
                    {user?.role === 'manager' && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>{getAgentName(p.assignedAgent)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Property Modal */}
      <PropertyModal
        property={selectedProperty}
        open={showModal}
        onClose={() => setShowModal(false)}
        onEdit={(prop) => prop && openForm(prop)}
        onDelete={(prop) => prop && handleDeleteRequest(prop)}
        agentsList={agentsList}
      />

      {/* Property Form */}
      <PropertyForm
        property={editingProperty}
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingProperty(null);
        }}
        onSaved={handlePropertySaved}
        agents={agentsList}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={showDeleteModal}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={`Are you sure you want to delete "${propertyToDelete?.title}"?`}
        message="This will permanently remove the property from the system. This action cannot be undone."
        loading={deleteLoading}
      />
    </DashboardLayout>
  );
};

export default Properties;