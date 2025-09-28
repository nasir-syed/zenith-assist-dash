import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal'; // Import the new modal
import { Client } from '@/data/mockData';

const Clients = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsTitle, setDetailsTitle] = useState('');
  const [detailsData, setDetailsData] = useState<Client | null>(null);

  // ✅ New state for resolved names
  const [agentNames, setAgentNames] = useState<string[]>([]);
  const [propertyNames, setPropertyNames] = useState<string[]>([]);

  // ✅ Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch clients
  const fetchClients = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/clients');
      const data = await res.json();
      const mapped: Client[] = data.map((c: any) => ({
        id: c._id.$oid || c._id,
        date: c.date,
        fullName: c.fullName,
        email: c.email,
        phoneNumber: c.phoneNumber,
        preferredContactMethod: c.preferredContactMethod,
        preferredLanguage: c.preferredLanguage,
        budgetRange: c.budgetRange,
        locationEmirate: c.locationEmirate,
        locationArea: c.locationArea,
        purpose: c.purpose,
        timeSpan: c.timeSpan,
        preApprovalStatus: c.preApprovalStatus,
        specificRequirements: c.specificRequirements || [],
        tier: c.tier,
        assignedAgents: c.assignedAgents || [],
        interestedProperties: c.interestedProperties || []
      }));
      setClients(mapped);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to fetch clients.' });
    }
  };

  // ✅ Fetch agent + property names when a client is selected
  const fetchDetailsData = async (client: Client) => {
    try {
      // Fetch agents
      const agentResponses = await Promise.all(
        client.assignedAgents.map((id) =>
          fetch(`http://localhost:5000/api/agents/${id}`).then((res) => res.json())
        )
      );
      setAgentNames(agentResponses.map((a) => a.name || 'Unknown Agent'));

      // Fetch properties
      const propertyResponses = await Promise.all(
        client.interestedProperties.map((id) =>
          fetch(`http://localhost:5000/api/property/${id}`).then((res) => res.json())
        )
      );
      setPropertyNames(propertyResponses.map((p) => p.name || p.title || 'Unknown Property'));
    } catch (err) {
      console.error('Error fetching details:', err);
      setAgentNames([]);
      setPropertyNames([]);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchClients();
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  const visibleClients = user?.role === 'manager'
    ? clients
    : clients.filter(client => client.assignedAgents?.includes(user?.id || ''));

  const leadStats = {
    hot: visibleClients.filter(client => client.tier === 'Hot').length,
    warm: visibleClients.filter(client => client.tier === 'Warm').length,
    cold: visibleClients.filter(client => client.tier === 'Cold').length,
    total: visibleClients.length
  };

  const handleEditClient = (client?: Client) => {
    setEditingClient(client || null);
    setShowForm(true);
  };

  // ✅ Updated delete handler to open confirmation modal
  const handleDeleteClient = (client: Client) => {
    setClientToDelete(client);
    setDeleteModalOpen(true);
  };

  // ✅ Actual delete function that runs after confirmation
  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;

    setDeleteLoading(true);
    try {
      await fetch(`http://localhost:5000/api/clients/${clientToDelete.id}`, { method: 'DELETE' });
      setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
      toast({
        title: "Client Deleted",
        description: `${clientToDelete.fullName} has been removed from client list.`,
      });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to delete client.' });
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setClientToDelete(null);
    }
  };

  // ✅ Close delete modal handler
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setClientToDelete(null);
  };

  const handleShowDetails = (client: Client) => {
    setDetailsTitle(client.fullName);
    setDetailsData(client);
    setDetailsModalOpen(true);

    // ✅ fetch extra info
    fetchDetailsData(client);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingClient(null);
    fetchClients();
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
          {['total','hot','warm','cold'].map((leadTier) => (
            <Card key={leadTier} className="shadow-card hover:shadow-elevated transition-shadow animate-fade-in">
              <CardContent className="p-6 flex flex-col items-center">
                {leadTier === 'total' && <UserCheck className="h-6 w-6 text-primary" />}
                {leadTier === 'hot' && <Flame className="h-6 w-6 text-red-500" />}
                {leadTier === 'warm' && <ThermometerSun className="h-6 w-6 text-orange-500" />}
                {leadTier === 'cold' && <Snowflake className="h-6 w-6 text-blue-500" />}
                <div className="mt-4 text-2xl font-bold">{leadStats[leadTier as keyof typeof leadStats]}</div>
                <p className="text-sm text-muted-foreground">
                  {leadTier === 'total' ? 'Total Clients' : `${leadTier.charAt(0).toUpperCase() + leadTier.slice(1)} Leads`}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Clients Table */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center">
              Client Directory
              <UserCheck className="ml-2 h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead className="text-center">Tier</TableHead>
                    {user?.role === 'manager' && <TableHead className="text-center">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleClients.map(client => (
                    <TableRow key={client.id} className="hover:bg-secondary/50 transition-colors">
                      <TableCell>{client.fullName}</TableCell>
                      <TableCell>
                        <div>{client.email}</div>
                        <div>{client.phoneNumber}</div>
                        <div className="text-xs text-muted-foreground">{client.preferredLanguage}</div>
                      </TableCell>
                      <TableCell>{client.locationEmirate}, {client.locationArea}</TableCell>
                      <TableCell>{client.budgetRange}</TableCell>
                      <TableCell>{client.purpose}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={
                            client.tier === 'Hot' ? 'border-red-500 text-red-700 bg-red-50' :
                            client.tier === 'Warm' ? 'border-orange-500 text-orange-700 bg-orange-50' :
                            'border-blue-500 text-blue-700 bg-blue-50'
                          }
                        >
                          {client.tier}
                        </Badge>
                      </TableCell>
                      {user?.role === 'manager' && (
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditClient(client)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteClient(client)} className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleShowDetails(client)}>
                              ...
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Form */}
      <ClientForm
        client={editingClient}
        open={showForm}
        onClose={handleCloseForm}
      />

      {/* Client Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={() => setDetailsModalOpen(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{detailsTitle} Details</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-foreground space-y-2">
            {detailsData && (
              <>
                <div className="flex justify-between border-b border-muted-foreground/20 py-1">
                  <span className="font-medium">Full Name</span>
                  <span>{detailsData.fullName || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-muted-foreground/20 py-1">
                  <span className="font-medium">Email</span>
                  <span>{detailsData.email || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-muted-foreground/20 py-1">
                  <span className="font-medium">Phone Number</span>
                  <span>{detailsData.phoneNumber || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-muted-foreground/20 py-1">
                  <span className="font-medium">Preferred Contact Method</span>
                  <span>{detailsData.preferredContactMethod || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-muted-foreground/20 py-1">
                  <span className="font-medium">Preferred Language</span>
                  <span>{detailsData.preferredLanguage || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-muted-foreground/20 py-1">
                  <span className="font-medium">Budget Range</span>
                  <span>{detailsData.budgetRange || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-muted-foreground/20 py-1">
                  <span className="font-medium">Location</span>
                  <span>{detailsData.locationEmirate || '-'}, {detailsData.locationArea || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-muted-foreground/20 py-1">
                  <span className="font-medium">Purpose</span>
                  <span>{detailsData.purpose || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-muted-foreground/20 py-1">
                  <span className="font-medium">Time Span</span>
                  <span>{detailsData.timeSpan || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-muted-foreground/20 py-1">
                  <span className="font-medium">Pre-Approval Status</span>
                  <span>{detailsData.preApprovalStatus || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-muted-foreground/20 py-1">
                  <span className="font-medium">Specific Requirements</span>
                  <span>{detailsData.specificRequirements?.length ? detailsData.specificRequirements.join(', ') : '-'}</span>
                </div>
                <div className="flex justify-between border-b border-muted-foreground/20 py-1">
                  <span className="font-medium">Tier</span>
                  <span>{detailsData.tier || '-'}</span>
                </div>
                <div className="flex justify-between border-b border-muted-foreground/20 py-1">
                  <span className="font-medium">Assigned Agents</span>
                  <span>{agentNames.length > 0 ? agentNames.join(', ') : '-'}</span>
                </div>
                <div className="flex justify-between border-b border-muted-foreground/20 py-1">
                  <span className="font-medium">Interested Properties</span>
                  <span>{propertyNames.length > 0 ? propertyNames.join(', ') : '-'}</span>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={confirmDeleteClient}
        title={`Are you sure you want to delete "${clientToDelete?.fullName}"?`}
        message="This will permanently remove the client from your system. All associated data will be lost."
        loading={deleteLoading}
      />
    </DashboardLayout>
  );
};

export default Clients;