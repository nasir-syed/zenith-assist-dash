export interface Agent {
  id: string; // Mongo-style _id
  name: string;
  email: string;
  phone: string;
  dateHired: string;
  status: string;
  notes: string;
  username?: string;
  password?: string;
  clients: string[]; // references to client IDs
  properties: string[]; // references to property IDs
  assignedClients: string[]; // now an array of client IDs
  assignedProperties: string[]; // now an array of property IDs
}


export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  assignedAgent: string; // could match Agent.name or Agent.id
  status: string;
  leadTier: 'Hot' | 'Warm' | 'Cold';
}

export interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  status: 'Available' | 'Sold' | 'Pending';
  assignedAgent: string; // could match Agent.name or Agent.id
}

export const mockAgents: Agent[] = [
  {
    id: '68b7e872cc983f4a48a44c8b',
    name: 'Mike Smith',
    email: 'mike.smith@eliteproperties.com',
    phone: '(555) 234-5678',
    dateHired: '2023-03-20',
    status: 'Active',
    notes: 'Expert in first-time homebuyer market',
    username: 'mike.smith',
    password: 'pass1234',
    clients: ['1', '2'],
    properties: ['1', '2'],
    assignedClients: [],
    assignedProperties: [],
  },
  {
    id: '2',
    name: 'Sarah Agent',
    email: 'agent@realtyco.com',
    phone: '(555) 987-6543',
    dateHired: '2022-07-15',
    status: 'Active',
    notes: 'Top-performing downtown specialist',
    username: 'sarah.agent',
    clients: ['3', '4'],
    properties: ['3'],
    assignedClients: [],
    assignedProperties: [],
  },
  {
    id: '3',
    name: 'Lisa Chen',
    email: 'lisa@realtyco.com',
    phone: '(555) 246-8101',
    dateHired: '2021-11-01',
    status: 'Active',
    notes: 'Strong in luxury villa sales',
    username: 'lisa.chen',
    clients: ['5'],
    properties: ['4', '5'],
    assignedClients: [],
    assignedProperties: [],
  },
];

export const mockClients: Client[] = [
  { id: '1', name: 'John Smith', email: 'john@email.com', phone: '555-0101', assignedAgent: '68b7e872cc983f4a48a44c8b', status: 'Active', leadTier: 'Hot' },
  { id: '2', name: 'Emma Davis', email: 'emma@email.com', phone: '555-0102', assignedAgent: '68b7e872cc983f4a48a44c8b', status: 'Active', leadTier: 'Warm' },
  { id: '3', name: 'Robert Wilson', email: 'robert@email.com', phone: '555-0103', assignedAgent: '2', status: 'Pending', leadTier: 'Cold' },
  { id: '4', name: 'Maria Garcia', email: 'maria@email.com', phone: '555-0104', assignedAgent: '2', status: 'Active', leadTier: 'Hot' },
  { id: '5', name: 'David Brown', email: 'david@email.com', phone: '555-0105', assignedAgent: '3', status: 'Active', leadTier: 'Warm' },
];

export const mockProperties: Property[] = [
  { id: '1', title: 'Modern Downtown Condo', location: 'Downtown District', price: '$450,000', status: 'Available', assignedAgent: '68b7e872cc983f4a48a44c8b' },
  { id: '2', title: 'Suburban Family Home', location: 'Maple Heights', price: '$625,000', status: 'Pending', assignedAgent: '68b7e872cc983f4a48a44c8b' },
  { id: '3', title: 'Luxury Waterfront Villa', location: 'Lakeside', price: '$1,200,000', status: 'Available', assignedAgent: '2' },
  { id: '4', title: 'Cozy Townhouse', location: 'Oak Park', price: '$380,000', status: 'Sold', assignedAgent: '3' },
  { id: '5', title: 'Executive Penthouse', location: 'Business District', price: '$850,000', status: 'Available', assignedAgent: '3' },
];

export const mockMetrics = {
  totalLeads: 156,
  hotLeads: 42,
  warmLeads: 67,
  coldLeads: 47,
  upcomingViewings: 23,
};
