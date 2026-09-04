export type ServiceType = 'data_bundles' | 'mtn_flexa';

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
  price: number;
  validity: string;
  popular?: boolean;
  serviceType?: ServiceType;
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
    { id: 'mtn-1',  productId: 'e5825a25-f365-4926-b78e-8a5b7d2a1c40', name: '1 GB',  data: '1 GB',  costPrice: 3.95,  price: 4.30,   validity: '90 Days', serviceType: 'mtn_flexa' },
    { id: 'mtn-2',  productId: 'b285a7da-adea-4bdd-be49-8dd54ad2663f', name: '2 GB',  data: '2 GB',  costPrice: 8.00,  price: 8.70,   validity: '90 Days', serviceType: 'mtn_flexa' },
    { id: 'mtn-3',  productId: '211647ff-747a-4c00-99d1-f793ced9755c', name: '3 GB',  data: '3 GB',  costPrice: 12.00, price: 13.00,  validity: '90 Days', serviceType: 'mtn_flexa' },
    { id: 'mtn-4',  productId: 'd56621a9-875a-496d-b216-cc21cb5bae02', name: '4 GB',  data: '4 GB',  costPrice: 16.00, price: 17.30,  validity: '90 Days', serviceType: 'mtn_flexa' },
    { id: 'mtn-5',  productId: '440262fb-f6fe-4c43-89f3-b6c470f24fea', name: '5 GB',  data: '5 GB',  costPrice: 20.00, price: 21.50,  validity: '90 Days', popular: true, serviceType: 'mtn_flexa' },
    { id: 'mtn-6',  productId: '81cc78fc-3e21-45f0-ac54-1fafa3f01923', name: '6 GB',  data: '6 GB',  costPrice: 24.00, price: 25.80,  validity: '90 Days', serviceType: 'mtn_flexa' },
    { id: 'mtn-8',  productId: '45caa58f-397c-41d2-a4f1-48ad8d6e1b23', name: '8 GB',  data: '8 GB',  costPrice: 33.00, price: 35.50,  validity: '90 Days', serviceType: 'mtn_flexa' },
    { id: 'mtn-10', productId: '56456480-f69d-4cb2-8d0f-fd90e5a3e7b7', name: '10 GB', data: '10 GB', costPrice: 40.00, price: 43.00,  validity: '90 Days', popular: true, serviceType: 'mtn_flexa' },
    { id: 'mtn-15', productId: 'c5418c3a-83fb-461b-ba61-59c1583d5699', name: '15 GB', data: '15 GB', costPrice: 60.00, price: 64.50,  validity: '90 Days', serviceType: 'mtn_flexa' },
    { id: 'mtn-20', productId: '02c2d960-3676-4e34-b96e-3791b8c2b16c', name: '20 GB', data: '20 GB', costPrice: 78.00, price: 83.50,  validity: '90 Days', serviceType: 'mtn_flexa' },
    { id: 'mtn-25', productId: '6912f2a7-8c03-4ef3-9be3-292e1ba407ed', name: '25 GB', data: '25 GB', costPrice: 98.00, price: 104.50, validity: '90 Days', serviceType: 'mtn_flexa' },
    { id: 'mtn-30', productId: 'a18f4d14-fac2-4277-901e-d8732b3cfa8e', name: '30 GB', data: '30 GB', costPrice: 119.00, price: 127.00, validity: '90 Days', serviceType: 'mtn_flexa' },
    { id: 'mtn-40', productId: '6be0cb96-ba7e-4bb1-a993-82cbc4adca62', name: '40 GB', data: '40 GB', costPrice: 160.00, price: 170.00, validity: '90 Days', serviceType: 'mtn_flexa' },
    { id: 'mtn-50', productId: '4545d0f0-1181-40e0-83b0-f78a8984824f', name: '50 GB', data: '50 GB', costPrice: 195.00, price: 207.00, validity: '90 Days', serviceType: 'mtn_flexa' },
  ],
  telecel: [
    { id: 'telecel-5',  productId: 'cc6ac2e0-7711-4ad4-af14-1098fc3addc5', name: '5 GB',  data: '5 GB',  costPrice: 20.0,  price: 21.50,  validity: 'No Expiry' },
    { id: 'telecel-10', productId: 'a1ac61e5-1f4b-4a91-b72d-f30d8496992e', name: '10 GB', data: '10 GB', costPrice: 36.5,  price: 40.00,  validity: 'No Expiry', popular: true },
    { id: 'telecel-15', productId: '2f2b2754-a739-4f7f-9db7-e0e2f6cb32de', name: '15 GB', data: '15 GB', costPrice: 55.0,  price: 60.00,  validity: 'No Expiry' },
    { id: 'telecel-20', productId: '49324be2-be6d-4d64-848d-550973b38c3d', name: '20 GB', data: '20 GB', costPrice: 72.5,  price: 80.00,  validity: 'No Expiry' },
    { id: 'telecel-30', productId: 'ca75855c-39ce-46ca-a82f-0a8c1d087577', name: '30 GB', data: '30 GB', costPrice: 108.0, price: 120.00, validity: 'No Expiry' },
    { id: 'telecel-40', productId: '98038da4-a235-4d0f-bf7f-e9c675df8059', name: '40 GB', data: '40 GB', costPrice: 143.5, price: 158.00, validity: 'No Expiry' },
    { id: 'telecel-50', productId: '07265392-0c48-41f2-b035-3d2b0ff349ec', name: '50 GB', data: '50 GB', costPrice: 178.0, price: 195.00, validity: 'No Expiry' },
  ],
  airteltigo: [
    { id: 'at-1',  productId: '8a62ede0-2bad-4ab3-9737-d4758d218bdc', name: '1 GB',  data: '1 GB',  costPrice: 3.8,   price: 4.30,   validity: 'No Expiry' },
    { id: 'at-2',  productId: '911241cb-16ba-4b30-b0d4-b481286a6565', name: '2 GB',  data: '2 GB',  costPrice: 7.8,   price: 8.70,   validity: 'No Expiry' },
    { id: 'at-5',  productId: '95f93d5f-b3f2-495c-8705-6bcbb73cd30e', name: '5 GB',  data: '5 GB',  costPrice: 19.3,  price: 21.50,  validity: 'No Expiry', popular: true },
    { id: 'at-10', productId: 'd8fdb94b-9300-4740-a8eb-6c070f500819', name: '10 GB', data: '10 GB', costPrice: 37.5,  price: 42.00,  validity: 'No Expiry', popular: true },
    { id: 'at-20', productId: '85444aa0-3af9-4fc9-86c3-c91f2a975c2e', name: '20 GB', data: '20 GB', costPrice: 75.0,  price: 83.00,  validity: 'No Expiry' },
    { id: 'at-30', productId: '21294632-ad60-4fb8-9a84-192f17295573', name: '30 GB', data: '30 GB', costPrice: 111.5, price: 125.00, validity: 'No Expiry' },
    { id: 'at-50', productId: '6e2237df-aaf6-4aa1-93b8-0b5ccad3eed8', name: '50 GB', data: '50 GB', costPrice: 184.5, price: 205.00, validity: 'No Expiry' },
  ],
};

export const MTN_FLEXA_BUNDLES = NETWORK_BUNDLES.mtn;
