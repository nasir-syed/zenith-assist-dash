import React, { useState, useEffect } from 'react';
import { Agent } from '@/data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface AgentFormProps {
  agent?: Partial<Agent> | null;
  open: boolean;
  onClose: () => void;
}

const AgentForm: React.FC<AgentFormProps> = ({ agent, open, onClose }) => {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateHired: '',
    status: 'Active',
    notes: '',
    username: '',
    password: '',
  });

  // Populate form when editing
  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name || '',
        email: agent.email || '',
        phone: agent.phone || '',
        dateHired: agent.dateHired || '',
        status: agent.status || 'Active',
        notes: agent.notes || '',
        username: agent.username || '',
        password: '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        dateHired: '',
        status: 'Active',
        notes: '',
        username: '',
        password: '',
      });
    }
  }, [agent, open]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    // If editing, only send changed fields
    if (agent) {
      const payload: Partial<Omit<Agent, "id">> = {};

      if (formData.name !== agent.name) payload.name = formData.name;
      if (formData.email !== agent.email) payload.email = formData.email;
      if (formData.phone !== agent.phone) payload.phone = formData.phone;
      if (formData.dateHired !== agent.dateHired) payload.dateHired = formData.dateHired;
      if (formData.status !== agent.status) payload.status = formData.status as 'Active' | 'Inactive';
      if (formData.notes !== agent.notes) payload.notes = formData.notes;

      // Always preserve existing arrays
      payload.clients = agent.clients || [];
      payload.properties = agent.properties || [];

      if (Object.keys(payload).length > 0) {
        const res = await fetch(`http://localhost:5000/api/agents/${agent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to update agent");
        toast({ title: "Agent Updated", description: `${formData.name} updated successfully.` });
      } else {
        toast({ title: "No changes", description: "Nothing to update." });
      }
    } else {
      // Adding new agent
      const payload: Omit<Agent, "id"> = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dateHired: formData.dateHired,
        status: formData.status as 'Active' | 'Inactive',
        notes: formData.notes,
        username: formData.username,
        password: formData.password,
        clients: [],
        properties: [],
      };

      const res = await fetch(`http://localhost:5000/api/agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add agent");
      toast({ title: "Agent Added", description: `${formData.name} added to the team.` });
    }

    onClose();
  } catch (err) {
    console.error(err);
    toast({ title: "Error", description: (err as Error).message || "Something went wrong." });
  }
};




  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>{agent ? 'Edit Agent' : 'Add New Agent'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 grid grid-cols-2 gap-4">
          {/* Name */}
          <div className="space-y-2 col-span-1 mt-4">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required />
          </div>

          {/* Email */}
          <div className="space-y-2 col-span-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required />
          </div>

          {/* Phone */}
          <div className="space-y-2 col-span-1">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
          </div>

          {/* Date Hired */}
          <div className="space-y-2 col-span-1">
            <Label htmlFor="dateHired">Date Hired</Label>
            <Input id="dateHired" type="date" value={formData.dateHired} onChange={(e) => handleChange('dateHired', e.target.value)} />
          </div>

          {/* Status */}
          <div className="space-y-2 col-span-1">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Username & Password - Only when adding */}
          {!agent && (
            <>
              <div className="space-y-2 col-span-1">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={formData.username} onChange={(e) => handleChange('username', e.target.value)} required />
              </div>

              <div className="space-y-2 col-span-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={formData.password} onChange={(e) => handleChange('password', e.target.value)} required />
              </div>
            </>
          )}

          {/* Notes */}
          <div className="space-y-2 col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 col-span-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-gradient-primary hover:opacity-90">
              {agent ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AgentForm;
