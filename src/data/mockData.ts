export interface Agent {
  id: string;
  name: string;
  email: string;
  assignedClients: number;
  assignedProperties: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedAgent: string;
  status: string;
  leadTier: 'Hot' | 'Warm' | 'Cold';
}

export interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  status: 'Available' | 'Sold' | 'Pending';
  assignedAgent: string;
}

export const mockAgents: Agent[] = [
  { id: '1', name: 'Sarah Agent', email: 'agent@realtyco.com', assignedClients: 12, assignedProperties: 8 },
  { id: '2', name: 'Mike Johnson', email: 'mike@realtyco.com', assignedClients: 9, assignedProperties: 6 },
  { id: '3', name: 'Lisa Chen', email: 'lisa@realtyco.com', assignedClients: 15, assignedProperties: 10 }
];

export const mockClients: Client[] = [
  { id: '1', name: 'John Smith', email: 'john@email.com', phone: '555-0101', assignedAgent: 'Sarah Agent', status: 'Active', leadTier: 'Hot' },
  { id: '2', name: 'Emma Davis', email: 'emma@email.com', phone: '555-0102', assignedAgent: 'Sarah Agent', status: 'Active', leadTier: 'Warm' },
  { id: '3', name: 'Robert Wilson', email: 'robert@email.com', phone: '555-0103', assignedAgent: 'Mike Johnson', status: 'Pending', leadTier: 'Cold' },
  { id: '4', name: 'Maria Garcia', email: 'maria@email.com', phone: '555-0104', assignedAgent: 'Lisa Chen', status: 'Active', leadTier: 'Hot' },
  { id: '5', name: 'David Brown', email: 'david@email.com', phone: '555-0105', assignedAgent: 'Sarah Agent', status: 'Active', leadTier: 'Warm' }
];

export const mockProperties: Property[] = [
  { id: '1', title: 'Modern Downtown Condo', location: 'Downtown District', price: '$450,000', status: 'Available', assignedAgent: 'Sarah Agent' },
  { id: '2', title: 'Suburban Family Home', location: 'Maple Heights', price: '$625,000', status: 'Pending', assignedAgent: 'Sarah Agent' },
  { id: '3', title: 'Luxury Waterfront Villa', location: 'Lakeside', price: '$1,200,000', status: 'Available', assignedAgent: 'Mike Johnson' },
  { id: '4', title: 'Cozy Townhouse', location: 'Oak Park', price: '$380,000', status: 'Sold', assignedAgent: 'Lisa Chen' },
  { id: '5', title: 'Executive Penthouse', location: 'Business District', price: '$850,000', status: 'Available', assignedAgent: 'Lisa Chen' }
];

export const mockMetrics = {
  totalLeads: 156,
  hotLeads: 42,
  warmLeads: 67,
  coldLeads: 47,
  upcomingViewings: 23
};