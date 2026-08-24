export interface Network {
  id: 'mtn' | 'telecel' | 'airteltigo';
  name: string;
  displayName: string;
  badgeColor?: string;
  color: string;
  phonePrefixes: string[];
}

export interface BundleOption {
  id: string;
  name: string;
  data: string;
  price: number;
  validity: string;
  popular?: boolean;
}

export const NETWORKS: Network[] = [
  {
    id: 'mtn',
    name: 'MTN',
    displayName: 'MTN',
    color: '#FFCC00',
    phonePrefixes: ['024', '054', '055', '059', '025'],
  },
  {
    id: 'telecel',
    name: 'Telecel',
    displayName: 'Telecel',
    color: '#E60000',
    phonePrefixes: ['020', '050'],
  },
  {
    id: 'airteltigo',
    name: 'AirtelTigo',
    displayName: 'AirtelTigo',
    color: '#003399',
    phonePrefixes: ['027', '057', '026', '056'],
  },
];

export const NETWORK_BUNDLES: Record<string, BundleOption[]> = {
  mtn: [
    { id: 'mtn-1', name: '1 GB Non-Expiry', data: '1 GB', price: 6.0, validity: 'No Expiry' },
    { id: 'mtn-2', name: '2 GB Non-Expiry', data: '2 GB', price: 11.5, validity: 'No Expiry' },
    { id: 'mtn-3', name: '3 GB Non-Expiry', data: '3 GB', price: 16.5, validity: 'No Expiry' },
    { id: 'mtn-4', name: '4 GB Non-Expiry', data: '4 GB', price: 21.0, validity: 'No Expiry' },
    { id: 'mtn-5', name: '5 GB Non-Expiry', data: '5 GB', price: 26.0, validity: 'No Expiry', popular: true },
    { id: 'mtn-6', name: '6 GB Non-Expiry', data: '6 GB', price: 31.0, validity: 'No Expiry' },
    { id: 'mtn-8', name: '8 GB Non-Expiry', data: '8 GB', price: 40.0, validity: 'No Expiry' },
    { id: 'mtn-10', name: '10 GB Non-Expiry', data: '10 GB', price: 49.0, validity: 'No Expiry', popular: true },
    { id: 'mtn-15', name: '15 GB Non-Expiry', data: '15 GB', price: 73.0, validity: 'No Expiry' },
    { id: 'mtn-20', name: '20 GB Non-Expiry', data: '20 GB', price: 95.0, validity: 'No Expiry' },
    { id: 'mtn-30', name: '30 GB Non-Expiry', data: '30 GB', price: 140.0, validity: 'No Expiry' },
    { id: 'mtn-50', name: '50 GB Non-Expiry', data: '50 GB', price: 220.0, validity: 'No Expiry' },
    { id: 'mtn-100', name: '100 GB Non-Expiry', data: '100 GB', price: 390.0, validity: 'No Expiry' },
  ],
  telecel: [
    { id: 'telecel-1', name: '1 GB Non-Expiry', data: '1 GB', price: 6.0, validity: 'No Expiry' },
    { id: 'telecel-2', name: '2 GB Non-Expiry', data: '2 GB', price: 11.0, validity: 'No Expiry' },
    { id: 'telecel-4', name: '4 GB Non-Expiry', data: '4 GB', price: 20.0, validity: 'No Expiry' },
    { id: 'telecel-5', name: '5 GB Non-Expiry', data: '5 GB', price: 25.0, validity: 'No Expiry', popular: true },
    { id: 'telecel-10', name: '10 GB Non-Expiry', data: '10 GB', price: 48.0, validity: 'No Expiry', popular: true },
    { id: 'telecel-15', name: '15 GB Non-Expiry', data: '15 GB', price: 70.0, validity: 'No Expiry' },
    { id: 'telecel-20', name: '20 GB Non-Expiry', data: '20 GB', price: 90.0, validity: 'No Expiry' },
    { id: 'telecel-50', name: '50 GB Non-Expiry', data: '50 GB', price: 210.0, validity: 'No Expiry' },
  ],
  airteltigo: [
    { id: 'at-1', name: '1 GB Big Time', data: '1 GB', price: 5.5, validity: 'No Expiry' },
    { id: 'at-2.5', name: '2.5 GB Big Time', data: '2.5 GB', price: 12.0, validity: 'No Expiry' },
    { id: 'at-5', name: '5 GB Big Time', data: '5 GB', price: 24.0, validity: 'No Expiry', popular: true },
    { id: 'at-10', name: '10 GB Big Time', data: '10 GB', price: 46.0, validity: 'No Expiry', popular: true },
    { id: 'at-20', name: '20 GB Big Time', data: '20 GB', price: 88.0, validity: 'No Expiry' },
    { id: 'at-50', name: '50 GB Big Time', data: '50 GB', price: 195.0, validity: 'No Expiry' },
  ],
};
