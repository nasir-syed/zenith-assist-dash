import React, { useState, useEffect } from 'react';
import { Agent } from '@/data/mockData';
import { useData } from '@/contexts/DataContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface AgentFormProps {
  agent?: Agent | null;
  open: boolean;
  onClose: () => void;
}

const AgentForm: React.FC<AgentFormProps> = ({ agent, open, onClose }) => {
  const { addAgent, updateAgent } = useData();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        email: agent.email
      });
    } else {
      setFormData({
        name: '',
        email: ''
      });
    }
  }, [agent, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (agent) {
      updateAgent(agent.id, formData);
      toast({
        title: "Agent Updated",
        description: `${formData.name} has been updated successfully.`,
      });
    } else {
      addAgent(formData);
      toast({
        title: "Agent Added",
        description: `${formData.name} has been added to the team.`,
      });
    }
    
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {agent ? 'Edit Agent' : 'Add New Agent'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-primary hover:opacity-90">
              {agent ? 'Update Agent' : 'Add Agent'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AgentForm;