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
  productId: string;
  name: string;
  data: string;
  costPrice: number;
  price: number; // Retail price with 12.5% profit margin
  validity: string;
  popular?: boolean;
}

export const PROFIT_MARGIN_PERCENT = 12.5;

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
    { id: 'mtn-1', productId: '17490299-29e5-4e73-bcae-85be8ed68972', name: '1 GB Non-Expiry', data: '1 GB', costPrice: 4.0, price: 4.50, validity: 'No Expiry' },
    { id: 'mtn-2', productId: '15f90b99-ae56-41d1-bc86-0770ba7d8d74', name: '2 GB Non-Expiry', data: '2 GB', costPrice: 8.5, price: 9.56, validity: 'No Expiry' },
    { id: 'mtn-3', productId: 'cb0f6cf3-efa5-4cc1-a1a9-27ac095130a0', name: '3 GB Non-Expiry', data: '3 GB', costPrice: 12.5, price: 14.06, validity: 'No Expiry' },
    { id: 'mtn-4', productId: 'd5898b8c-9979-4a09-bc52-f08430157498', name: '4 GB Non-Expiry', data: '4 GB', costPrice: 16.7, price: 18.79, validity: 'No Expiry' },
    { id: 'mtn-5', productId: 'ca208754-ed35-4f7a-af14-f103691947c8', name: '5 GB Non-Expiry', data: '5 GB', costPrice: 21.0, price: 23.63, validity: 'No Expiry', popular: true },
    { id: 'mtn-6', productId: 'f6a726a5-f3cb-43fb-afa1-bd273337057d', name: '6 GB Non-Expiry', data: '6 GB', costPrice: 24.0, price: 27.00, validity: 'No Expiry' },
    { id: 'mtn-8', productId: 'c6625d9d-722b-4f33-bf20-9a7eba9a3d6a', name: '8 GB Non-Expiry', data: '8 GB', costPrice: 33.0, price: 37.13, validity: 'No Expiry' },
    { id: 'mtn-10', productId: '16527bc5-9832-476d-913f-1f1abc7e79e8', name: '10 GB Non-Expiry', data: '10 GB', costPrice: 39.8, price: 44.78, validity: 'No Expiry', popular: true },
    { id: 'mtn-15', productId: '3c78af77-a372-4bf8-9a5b-23dc7c45a134', name: '15 GB Non-Expiry', data: '15 GB', costPrice: 59.0, price: 66.38, validity: 'No Expiry' },
    { id: 'mtn-20', productId: 'b6cdc71b-7701-46fa-b773-9fd92a241c1f', name: '20 GB Non-Expiry', data: '20 GB', costPrice: 78.0, price: 87.75, validity: 'No Expiry' },
    { id: 'mtn-25', productId: '61cf3850-edb2-48c7-8ccd-15a6a7ce7737', name: '25 GB Non-Expiry', data: '25 GB', costPrice: 98.0, price: 110.25, validity: 'No Expiry' },
    { id: 'mtn-30', productId: '90dde8e8-320c-4580-98ec-cabdc77a00ee', name: '30 GB Non-Expiry', data: '30 GB', costPrice: 119.0, price: 133.88, validity: 'No Expiry' },
    { id: 'mtn-40', productId: 'a6709756-6b41-4adf-b4d1-516f5598bd44', name: '40 GB Non-Expiry', data: '40 GB', costPrice: 160.0, price: 180.00, validity: 'No Expiry' },
    { id: 'mtn-50', productId: 'c63cbabb-6c29-4667-bedd-f63f5d31feeb', name: '50 GB Non-Expiry', data: '50 GB', costPrice: 195.0, price: 219.38, validity: 'No Expiry' },
  ],
  telecel: [
    { id: 'telecel-10', productId: 'a1ac61e5-1f4b-4a91-b72d-f30d8496992e', name: '10 GB Non-Expiry', data: '10 GB', costPrice: 36.5, price: 41.06, validity: 'No Expiry', popular: true },
    { id: 'telecel-15', productId: '2f2b2754-a739-4f7f-9db7-e0e2f6cb32de', name: '15 GB Non-Expiry', data: '15 GB', costPrice: 55.0, price: 61.88, validity: 'No Expiry' },
    { id: 'telecel-20', productId: '49324be2-be6d-4d64-848d-550973b38c3d', name: '20 GB Non-Expiry', data: '20 GB', costPrice: 72.5, price: 81.56, validity: 'No Expiry' },
    { id: 'telecel-30', productId: 'ca75855c-39ce-46ca-a82f-0a8c1d087577', name: '30 GB Non-Expiry', data: '30 GB', costPrice: 108.0, price: 121.50, validity: 'No Expiry' },
    { id: 'telecel-40', productId: '98038da4-a235-4d0f-bf7f-e9c675df8059', name: '40 GB Non-Expiry', data: '40 GB', costPrice: 143.5, price: 161.44, validity: 'No Expiry' },
    { id: 'telecel-50', productId: '07265392-0c48-41f2-b035-3d2b0ff349ec', name: '50 GB Non-Expiry', data: '50 GB', costPrice: 178.0, price: 200.25, validity: 'No Expiry' },
  ],
  airteltigo: [
    { id: 'at-1', productId: '8a62ede0-2bad-4ab3-9737-d4758d218bdc', name: '1 GB Big Time', data: '1 GB', costPrice: 3.8, price: 4.27, validity: 'No Expiry' },
    { id: 'at-2', productId: '911241cb-16ba-4b30-b0d4-b481286a6565', name: '2 GB Big Time', data: '2 GB', costPrice: 7.8, price: 8.78, validity: 'No Expiry' },
    { id: 'at-5', productId: '95f93d5f-b3f2-495c-8705-6bcbb73cd30e', name: '5 GB Big Time', data: '5 GB', costPrice: 19.3, price: 21.71, validity: 'No Expiry', popular: true },
    { id: 'at-10', productId: 'd8fdb94b-9300-4740-a8eb-6c070f500819', name: '10 GB Big Time', data: '10 GB', costPrice: 37.5, price: 42.19, validity: 'No Expiry', popular: true },
    { id: 'at-20', productId: '85444aa0-3af9-4fc9-86c3-c91f2a975c2e', name: '20 GB Big Time', data: '20 GB', costPrice: 75.0, price: 84.38, validity: 'No Expiry' },
    { id: 'at-30', productId: '21294632-ad60-4fb8-9a84-192f17295573', name: '30 GB Big Time', data: '30 GB', costPrice: 111.5, price: 125.44, validity: 'No Expiry' },
    { id: 'at-50', productId: '6e2237df-aaf6-4aa1-93b8-0b5ccad3eed8', name: '50 GB Big Time', data: '50 GB', costPrice: 184.5, price: 207.56, validity: 'No Expiry' },
  ],
};
