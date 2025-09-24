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
  assignedClients: string[]; // array of client IDs
  assignedProperties: string[]; // array of property IDs
}

export interface Client {
  id: string; // corresponds to _id.$oid
  date: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  preferredContactMethod: string;
  preferredLanguage: string;
  budgetRange: string;
  locationEmirate: string;
  locationArea: string;
  purpose: string;
  timeSpan: string;
  preApprovalStatus: string;
  specificRequirements: string[];
  tier: 'Hot' | 'Warm' | 'Cold';
  assignedAgents: string[]; // array of agent IDs
  interestedProperties: string[]; // array of property IDs
}


export interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  status: 'Available' | 'Sold' | 'Pending';
  assignedAgent: string; // agent ID
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
    clients: ['68cbf1e110c1c8e506fafba8'], // John Smith
    properties: ['1','2'],
    assignedClients: ['68cbf1e110c1c8e506fafba8'],
    assignedProperties: ['1','2'],
  },
  {
    id: '68b7e8ed4733bdecf974e697',
    name: 'Sarah Agent',
    email: 'sarah.agent@realtyco.com',
    phone: '(555) 987-6543',
    dateHired: '2022-07-15',
    status: 'Active',
    notes: 'Top-performing downtown specialist',
    username: 'sarah.agent',
    password: 'pass5678',
    clients: ['68cbf1e110c1c8e506fafba9'],
    properties: ['3'],
    assignedClients: ['68cbf1e110c1c8e506fafba9'],
    assignedProperties: ['3'],
  },
];

export const mockProperties: Property[] = [
  { id: '1', title: 'Modern Downtown Condo', location: 'Downtown Dubai', price: 'AED 4,500,000', status: 'Available', assignedAgent: '68b7e872cc983f4a48a44c8b' },
  { id: '2', title: 'Suburban Family Home', location: 'Al Barsha', price: 'AED 6,250,000', status: 'Pending', assignedAgent: '68b7e872cc983f4a48a44c8b' },
  { id: '3', title: 'Luxury Waterfront Villa', location: 'Abu Dhabi Corniche', price: 'AED 12,000,000', status: 'Available', assignedAgent: '68b7e8ed4733bdecf974e697' },
];

export const mockMetrics = {
  totalLeads: 156,
  hotLeads: 42,
  warmLeads: 67,
  coldLeads: 47,
  upcomingViewings: 23,
};
