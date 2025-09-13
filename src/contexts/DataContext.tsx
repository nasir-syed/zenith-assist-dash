import React, { createContext, useContext, useState, useEffect } from 'react';
import { Agent, Client, Property } from '@/data/mockData';
import property1 from '@/assets/property-1.jpg';
import property2 from '@/assets/property-2.jpg';
import property3 from '@/assets/property-3.jpg';
import property4 from '@/assets/property-4.jpg';
import property5 from '@/assets/property-5.jpg';

// Updated mock data with images and extended properties
const initialAgents: Agent[] = [
  { id: '1', name: 'Sarah Agent', email: 'agent@realtyco.com', assignedClients: 12, assignedProperties: 8 },
  { id: '2', name: 'Mike Johnson', email: 'mike@realtyco.com', assignedClients: 9, assignedProperties: 6 },
  { id: '3', name: 'Lisa Chen', email: 'lisa@realtyco.com', assignedClients: 15, assignedProperties: 10 }
];

const initialClients: Client[] = [
  { id: '1', name: 'John Smith', email: 'john@email.com', phone: '555-0101', assignedAgent: 'Sarah Agent', status: 'Active', leadTier: 'Hot' },
  { id: '2', name: 'Emma Davis', email: 'emma@email.com', phone: '555-0102', assignedAgent: 'Sarah Agent', status: 'Active', leadTier: 'Warm' },
  { id: '3', name: 'Robert Wilson', email: 'robert@email.com', phone: '555-0103', assignedAgent: 'Mike Johnson', status: 'Pending', leadTier: 'Cold' },
  { id: '4', name: 'Maria Garcia', email: 'maria@email.com', phone: '555-0104', assignedAgent: 'Lisa Chen', status: 'Active', leadTier: 'Hot' },
  { id: '5', name: 'David Brown', email: 'david@email.com', phone: '555-0105', assignedAgent: 'Sarah Agent', status: 'Active', leadTier: 'Warm' }
];

const initialProperties: (Property & { 
  image: string; 
  description: string; 
  bedrooms: number; 
  bathrooms: number; 
  sqft: number; 
})[] = [
  { 
    id: '1', 
    title: 'Modern Downtown Condo', 
    location: 'Downtown District', 
    price: '$450,000', 
    status: 'Available', 
    assignedAgent: 'Sarah Agent',
    image: property1,
    description: 'Stunning modern condominium in the heart of downtown with panoramic city views, high-end finishes, and premium amenities.',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200
  },
  { 
    id: '2', 
    title: 'Suburban Family Home', 
    location: 'Maple Heights', 
    price: '$625,000', 
    status: 'Pending', 
    assignedAgent: 'Sarah Agent',
    image: property2,
    description: 'Beautiful family home in quiet suburban neighborhood with large backyard, modern kitchen, and excellent school district.',
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2400
  },
  { 
    id: '3', 
    title: 'Luxury Waterfront Villa', 
    location: 'Lakeside', 
    price: '$1,200,000', 
    status: 'Available', 
    assignedAgent: 'Mike Johnson',
    image: property3,
    description: 'Exclusive waterfront villa with private beach access, luxury finishes, and breathtaking lake views from every room.',
    bedrooms: 5,
    bathrooms: 4,
    sqft: 4200
  },
  { 
    id: '4', 
    title: 'Cozy Townhouse', 
    location: 'Oak Park', 
    price: '$380,000', 
    status: 'Sold', 
    assignedAgent: 'Lisa Chen',
    image: property4,
    description: 'Charming townhouse with modern updates, private patio, and convenient location near parks and shopping.',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1600
  },
  { 
    id: '5', 
    title: 'Executive Penthouse', 
    location: 'Business District', 
    price: '$850,000', 
    status: 'Available', 
    assignedAgent: 'Lisa Chen',
    image: property5,
    description: 'Luxurious penthouse with 360-degree city views, premium finishes, and exclusive rooftop terrace.',
    bedrooms: 3,
    bathrooms: 3,
    sqft: 2800
  }
];

interface DataContextType {
  // Agents
  agents: Agent[];
  addAgent: (agent: Omit<Agent, 'id' | 'assignedClients' | 'assignedProperties'>) => void;
  updateAgent: (id: string, agent: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  
  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  // Properties
  properties: (Property & { image: string; description: string; bedrooms: number; bathrooms: number; sqft: number; })[];
  addProperty: (property: Omit<Property & { image: string; description: string; bedrooms: number; bathrooms: number; sqft: number; }, 'id'>) => void;
  updateProperty: (id: string, property: Partial<Property & { image: string; description: string; bedrooms: number; bathrooms: number; sqft: number; }>) => void;
  deleteProperty: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [agents, setAgents] = useState<Agent[]>(initialAgents);
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [properties, setProperties] = useState<(Property & { image: string; description: string; bedrooms: number; bathrooms: number; sqft: number; })[]>(initialProperties);

  // Load from localStorage on mount
  useEffect(() => {
    const savedAgents = localStorage.getItem('realty-agents');
    const savedClients = localStorage.getItem('realty-clients');
    const savedProperties = localStorage.getItem('realty-properties');

    if (savedAgents) setAgents(JSON.parse(savedAgents));
    if (savedClients) setClients(JSON.parse(savedClients));
    if (savedProperties) setProperties(JSON.parse(savedProperties));
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('realty-agents', JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    localStorage.setItem('realty-clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('realty-properties', JSON.stringify(properties));
  }, [properties]);

  // Agent CRUD operations
  const addAgent = (agent: Omit<Agent, 'id' | 'assignedClients' | 'assignedProperties'>) => {
    const newAgent = { ...agent, id: Date.now().toString(), assignedClients: 0, assignedProperties: 0 };
    setAgents(prev => [...prev, newAgent]);
  };

  const updateAgent = (id: string, updatedAgent: Partial<Agent>) => {
    setAgents(prev => prev.map(agent => agent.id === id ? { ...agent, ...updatedAgent } : agent));
  };

  const deleteAgent = (id: string) => {
    setAgents(prev => prev.filter(agent => agent.id !== id));
    // Also update clients and properties to remove agent assignment
    setClients(prev => prev.map(client => client.assignedAgent === agents.find(a => a.id === id)?.name ? { ...client, assignedAgent: '' } : client));
    setProperties(prev => prev.map(property => property.assignedAgent === agents.find(a => a.id === id)?.name ? { ...property, assignedAgent: '' } : property));
  };

  // Client CRUD operations
  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient = { ...client, id: Date.now().toString() };
    setClients(prev => [...prev, newClient]);
    // Update agent assigned client count
    updateAgentCounts();
  };

  const updateClient = (id: string, updatedClient: Partial<Client>) => {
    setClients(prev => prev.map(client => client.id === id ? { ...client, ...updatedClient } : client));
    updateAgentCounts();
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
    updateAgentCounts();
  };

  // Property CRUD operations
  const addProperty = (property: Omit<Property & { image: string; description: string; bedrooms: number; bathrooms: number; sqft: number; }, 'id'>) => {
    const newProperty = { ...property, id: Date.now().toString() };
    setProperties(prev => [...prev, newProperty]);
    updateAgentCounts();
  };

  const updateProperty = (id: string, updatedProperty: Partial<Property & { image: string; description: string; bedrooms: number; bathrooms: number; sqft: number; }>) => {
    setProperties(prev => prev.map(property => property.id === id ? { ...property, ...updatedProperty } : property));
    updateAgentCounts();
  };

  const deleteProperty = (id: string) => {
    setProperties(prev => prev.filter(property => property.id !== id));
    updateAgentCounts();
  };

  // Update agent counts based on assignments
  const updateAgentCounts = () => {
    setAgents(prevAgents => 
      prevAgents.map(agent => ({
        ...agent,
        assignedClients: clients.filter(client => client.assignedAgent === agent.name).length,
        assignedProperties: properties.filter(property => property.assignedAgent === agent.name).length
      }))
    );
  };

  return (
    <DataContext.Provider value={{
      agents,
      addAgent,
      updateAgent,
      deleteAgent,
      clients,
      addClient,
      updateClient,
      deleteClient,
      properties,
      addProperty,
      updateProperty,
      deleteProperty
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};