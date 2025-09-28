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
  community: string;
  subCommunity?: string;
  price: number;
  status: 'Available' | 'Sold' | 'Pending';
  assignedAgent: string; // agent ID
  cover_photo?: string;
  emirate?: string;
  amenities?: string[];
  type?: string;
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
  },
];

export const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Modern Downtown Condo',
    community: 'Downtown Dubai',
    subCommunity: 'Burj Khalifa District',
    price: 4500000,
    status: 'Available',
    assignedAgent: '68b7e872cc983f4a48a44c8b',
    cover_photo: 'https://res.cloudinary.com/db7yi9cio/image/upload/v1758017108/property-1.jpg',
    emirate: 'Dubai',
    amenities: ['Gym', 'Swimming Pool', '24/7 Security', 'Parking'],
    type: 'Residential Condo',
  },
  {
    id: '2',
    title: 'Suburban Family Home',
    community: 'Al Barsha',
    subCommunity: 'Al Barsha 3',
    price: 6250000,
    status: 'Pending',
    assignedAgent: '68b7e872cc983f4a48a44c8b',
    cover_photo: 'https://res.cloudinary.com/db7yi9cio/image/upload/v1758017108/property-2.jpg',
    emirate: 'Dubai',
    amenities: ['Garden', 'Garage', 'Private Pool', 'Security System'],
    type: 'Villa',
  },
  {
    id: '3',
    title: 'Luxury Waterfront Villa',
    community: 'Corniche',
    subCommunity: 'Abu Dhabi Corniche',
    price: 12000000,
    status: 'Available',
    assignedAgent: '68b7e8ed4733bdecf974e697',
    cover_photo: 'https://res.cloudinary.com/db7yi9cio/image/upload/v1758017108/property-3.jpg',
    emirate: 'Abu Dhabi',
    amenities: ['Private Beach', 'Infinity Pool', 'Gym', 'Home Theater'],
    type: 'Villa',
  },
  {
    id: '4',
    title: 'Cozy Starter Home',
    community: 'Mirdif',
    subCommunity: 'Ghoroob',
    price: 1800000,
    status: 'Available',
    assignedAgent: '68b7e872cc983f4a48a44c8b',
    cover_photo: 'https://res.cloudinary.com/db7yi9cio/image/upload/v1758017108/property-4_tykhdq.jpg',
    emirate: 'Dubai',
    amenities: ['Security Staff', 'CCTV Security', 'Freehold', 'Lobby in Building'],
    type: 'Commercial Office',
  },
  {
    id: '5',
    title: 'Elegant Penthouse Suite',
    community: 'Business Bay',
    subCommunity: 'Bay Avenue',
    price: 9500000,
    status: 'Available',
    assignedAgent: '68b7e8ed4733bdecf974e697',
    cover_photo: 'https://res.cloudinary.com/db7yi9cio/image/upload/v1758017108/property-5.jpg',
    emirate: 'Dubai',
    amenities: ['Rooftop Terrace', 'Private Elevator', 'Gym', 'Concierge Service'],
    type: 'Penthouse',
  },
];


export const mockMetrics = {
  totalLeads: 156,
  hotLeads: 42,
  warmLeads: 67,
  coldLeads: 47,
  upcomingViewings: 23,
};
