import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
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
import { Users, Mail, UserCheck, Building2, Plus, Edit, Trash2 } from 'lucide-react';
import AgentForm from '@/components/forms/AgentForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DeleteConfirmationModal from '@/components/modals/DeleteConfirmationModal'; // Import the delete modal

export interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateHired: string;
  status: 'Active' | 'Inactive';
  clients: string[];
  properties: string[];
  notes: string;
}

const Agents = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  // Notes modal
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [currentNotes, setCurrentNotes] = useState('');

  // Clients/Properties modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsTitle, setDetailsTitle] = useState('');
  const [detailsList, setDetailsList] = useState<string[]>([]);

  // ✅ Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState<Agent | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // -----------------------------
  // Fetch agents from API
  // -----------------------------
  const fetchAgents = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/agents`);
      const data = await res.json();
      const mapped = data.map((a: any) => ({ ...a, id: a._id }));
      setAgents(mapped);
    } catch (err) {
      console.error("Failed to fetch agents:", err);
      toast({ title: "Error", description: "Failed to load agents" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.role !== 'manager') {
      navigate('/dashboard/clients');
    } else {
      fetchAgents();
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || user?.role !== 'manager') return null;

  // -----------------------------
  // CRUD Handlers
  // -----------------------------
  const handleEditAgent = (agent?: Agent) => {
    setEditingAgent(agent || null);
    setShowForm(true);
  };

  // ✅ Updated delete handler to open confirmation modal
  const handleDeleteAgent = (agent: Agent) => {
    setAgentToDelete(agent);
    setDeleteModalOpen(true);
  };

  // ✅ Actual delete function that runs after confirmation
  const confirmDeleteAgent = async () => {
    if (!agentToDelete) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/agents/${agentToDelete.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error("Failed to delete agent");
      
      setAgents((prev) => prev.filter((a) => a.id !== agentToDelete.id));
      toast({ 
        title: "Agent Deleted", 
        description: `${agentToDelete.name} has been removed from the system.` 
      });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to delete agent" });
    } finally {
      setDeleteLoading(false);
      setDeleteModalOpen(false);
      setAgentToDelete(null);
    }
  };

  // ✅ Close delete modal handler
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setAgentToDelete(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingAgent(null);
    fetchAgents();
  };

  const handleShowNotes = (notes: string) => {
    setCurrentNotes(notes);
    setNotesModalOpen(true);
  };

  // -----------------------------
  // Fetch client/property details
  // -----------------------------
  const fetchDetails = async (type: 'client' | 'property', ids: string[]) => {
    try {
      const promises = ids.map((id) =>
        fetch(`http://localhost:5000/api/${type}/${id}`).then(res => res.json())
      );
      const results = await Promise.all(promises);
      const names = results.map(r => r.name || r.fullName || r.title || 'Unknown');
      setDetailsList(names);
      setDetailsTitle(type === 'client' ? 'Clients' : 'Properties');
      setDetailsModalOpen(true);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: `Failed to fetch ${type} details.` });
    }
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Agents</h1>
            <p className="text-muted-foreground">
              Manage your real estate team and track their performance!
            </p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-sm text-muted-foreground">
              Total Agents: <span className="font-medium text-foreground">{agents.length}</span>
            </div>
            <Button
              onClick={() => handleEditAgent()}
              className="bg-gradient-primary hover:opacity-90 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Agent</span>
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="shadow-card hover:shadow-elevated transition-shadow animate-fade-in">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
              <div className="mt-4 text-2xl font-bold">{agents.length}</div>
              <p className="text-sm text-muted-foreground">Total Agents</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-shadow animate-fade-in">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <UserCheck className="h-6 w-6 text-success" />
              <div className="mt-4 text-2xl font-bold">
                {(() => {
                  const uniqueClients = new Set(
                    agents.flatMap(agent => agent.clients) // already an array of IDs
                  );
                  return uniqueClients.size;
                })()}
              </div>
              <p className="text-sm text-muted-foreground">Total Clients</p>
            </CardContent>
          </Card>


          <Card className="shadow-card hover:shadow-elevated transition-shadow animate-fade-in">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Building2 className="h-6 w-6 text-warning" />
              <div className="mt-4 text-2xl font-bold">
                {agents.reduce((sum, a) => sum + a.properties.length, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Total Properties</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elevated transition-shadow animate-fade-in">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <Mail className="h-6 w-6 text-accent" />
              <div className="mt-4 text-2xl font-bold">
                {agents.length > 0
                  ? Math.round(agents.reduce((sum, a) => sum + a.clients.length, 0) / agents.length)
                  : 0}
              </div>
              <p className="text-sm text-muted-foreground">Avg Clients/Agent</p>
            </CardContent>
          </Card>
        </div>

        {/* Agents Table */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              Agent Directory
              <Users className="ml-2 h-5 w-5 text-primary" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-4 text-muted-foreground">Loading agents...</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Date Hired</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Clients</TableHead>
                      <TableHead className="text-center">Properties</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell>{agent.name}</TableCell>
                        <TableCell className="text-muted-foreground">{agent.email}</TableCell>
                        <TableCell className="text-sm">{agent.phone}</TableCell>
                        <TableCell>{agent.dateHired}</TableCell>
                        <TableCell>
                          <Badge
                            className={agent.status === 'Active' ? 'bg-success text-white' : 'bg-destructive text-white'}
                          >
                            {agent.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchDetails('client', agent.clients)}
                          >
                            {agent.clients.length}
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => fetchDetails('property', agent.properties)}
                          >
                            {agent.properties.length}
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShowNotes(agent.notes)}
                          >
                            ...
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditAgent(agent)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteAgent(agent)} className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agent Form */}
      <AgentForm agent={editingAgent} open={showForm} onClose={handleCloseForm} />

      {/* Notes Modal */}
      <Dialog open={notesModalOpen} onOpenChange={() => setNotesModalOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agent Notes</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-foreground break-words">
            {currentNotes || 'No notes available.'}
          </div>
        </DialogContent>
      </Dialog>

      {/* Clients/Properties Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={() => setDetailsModalOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{detailsTitle}</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-foreground space-y-1">
            {detailsList.length > 0 ? detailsList.map((name, idx) => (
              <div key={idx} className="border-b border-muted-foreground/20 py-1">{name}</div>
            )) : (
              <div>No {detailsTitle.toLowerCase()} found.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={confirmDeleteAgent}
        title={`Are you sure you want to delete "${agentToDelete?.name}"?`}
        message="This will permanently remove the agent from your system. All associated client assignments and data will be affected."
        loading={deleteLoading}
      />
    </DashboardLayout>
  );
};

export default Agents;