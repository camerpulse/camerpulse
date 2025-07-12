// Mock data for CamerPulse platform

export const mockPulses = [
  {
    id: '1',
    user: {
      name: 'Amina Mbarga',
      username: 'amina_yaoundé',
      avatar: '',
      verified: false,
      isDiaspora: false,
      location: 'Yaoundé, Centre'
    },
    content: 'The new infrastructure projects in Yaoundé are finally showing results! Road construction on Avenue Kennedy is making our daily commute much easier. 🇨🇲 #YaoundéDevelopment #Infrastructure',
    timestamp: '2h ago',
    likes: 45,
    comments: 12,
    shares: 8,
    sentiment: 'positive' as const,
    hashtags: ['YaoundéDevelopment', 'Infrastructure'],
    isLiked: false
  },
  {
    id: '2',
    user: {
      name: 'Jean-Pierre Fouda',
      username: 'jp_diaspora_canada',
      avatar: '',
      verified: false,
      isDiaspora: true,
      location: 'Montreal, Canada'
    },
    content: 'Watching from Montreal and feeling proud of Cameroon\'s progress in digital governance. The eID system implementation is exactly what we need for transparent elections. Keep pushing forward! 🇨🇲💪 #DigitalCameroon #DiasporaVoice',
    timestamp: '4h ago',
    likes: 78,
    comments: 23,
    shares: 15,
    sentiment: 'positive' as const,
    hashtags: ['DigitalCameroon', 'DiasporaVoice'],
    isLiked: true
  },
  {
    id: '3',
    user: {
      name: 'Dr. Sarah Mbeki',
      username: 'dr_sarah_health',
      avatar: '',
      verified: true,
      isDiaspora: false,
      location: 'Douala, Littoral'
    },
    content: 'Healthcare accessibility in rural areas still needs urgent attention. We need more mobile clinics and telemedicine initiatives. Every Cameroonian deserves quality healthcare regardless of location. #HealthcareForAll #RuralDevelopment',
    timestamp: '6h ago',
    likes: 156,
    comments: 45,
    shares: 32,
    sentiment: 'neutral' as const,
    hashtags: ['HealthcareForAll', 'RuralDevelopment'],
    isLiked: false
  },
  {
    id: '4',
    user: {
      name: 'Emmanuel Bassong',
      username: 'bassong_entrepreneur',
      avatar: '',
      verified: false,
      isDiaspora: false,
      location: 'Bamenda, Northwest'
    },
    content: 'Small businesses are struggling with high taxation and bureaucracy. We need streamlined processes and better support for local entrepreneurs. Our economy depends on it! #SmallBusiness #EntrepreneurshipCM',
    timestamp: '8h ago',
    likes: 89,
    comments: 34,
    shares: 21,
    sentiment: 'negative' as const,
    hashtags: ['SmallBusiness', 'EntrepreneurshipCM'],
    isLiked: false
  },
  {
    id: '5',
    user: {
      name: 'Marie-Claire Ngono',
      username: 'marie_education',
      avatar: '',
      verified: false,
      isDiaspora: false,
      location: 'Bafoussam, West'
    },
    content: 'Proud to see more girls enrolling in STEM programs in our region! Education is the key to Cameroon\'s future. Let\'s continue supporting our youth in all fields. 🌟📚 #STEMEducation #GirlsInSTEM #CameroonFuture',
    timestamp: '12h ago',
    likes: 203,
    comments: 67,
    shares: 44,
    sentiment: 'positive' as const,
    hashtags: ['STEMEducation', 'GirlsInSTEM', 'CameroonFuture'],
    isLiked: true
  }
];

export const mockPoliticians = [
  {
    id: '1',
    name: 'Dr. Augustin Tamba',
    role: 'Minister of Digital Economy',
    party: 'RDPC',
    region: 'Centre',
    avatar: '',
    approvalRating: 74,
    sentimentTrend: 'up' as const,
    civicScore: 82,
    promisesKept: 12,
    totalPromises: 16,
    isVerified: true,
    lastActive: '2 days ago',
    bio: 'Leading Cameroon\'s digital transformation initiatives. Focused on eGovernment, digital infrastructure, and tech education for youth.'
  },
  {
    id: '2',
    name: 'Hon. Beatrice Mendomo',
    role: 'Mayor of Yaoundé',
    party: 'RDPC',
    region: 'Centre',
    avatar: '',
    approvalRating: 58,
    sentimentTrend: 'stable' as const,
    civicScore: 65,
    promisesKept: 8,
    totalPromises: 15,
    isVerified: true,
    lastActive: '1 week ago',
    bio: 'Committed to urban development and improving the quality of life for Yaoundé residents. Focus on infrastructure and waste management.'
  },
  {
    id: '3',
    name: 'Prof. Martin Yemele',
    role: 'Senator - Littoral',
    party: 'SDF',
    region: 'Littoral',
    avatar: '',
    approvalRating: 43,
    sentimentTrend: 'down' as const,
    civicScore: 51,
    promisesKept: 5,
    totalPromises: 18,
    isVerified: false,
    lastActive: '3 weeks ago',
    bio: 'Advocate for economic reform and transparency in government. Focus on anti-corruption measures and business development.'
  }
];

export const mockMarketplaceVendors = [
  {
    id: '1',
    user_id: '4',
    vendor_id: 'CM-1234567',
    business_name: 'TechHub Cameroon',
    description: 'Leading electronics and gadgets store in Central Africa',
    verification_status: 'verified',
    rating: 4.8,
    total_sales: 156,
    profile: {
      username: 'tech_guy',
      display_name: 'David Tcheutchoua',
      avatar_url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    id: '2',
    user_id: '5',
    vendor_id: 'CM-2345678',
    business_name: 'Mama Africa Crafts',
    description: 'Authentic African crafts and traditional items',
    verification_status: 'verified',
    rating: 4.6,
    total_sales: 89,
    profile: {
      username: 'mama_africa',
      display_name: 'Aminata Kone',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    id: '3',
    user_id: '3',
    vendor_id: 'CM-3456789',
    business_name: 'Green Valley Farms',
    description: 'Organic produce and agricultural products from Cameroon',
    verification_status: 'pending',
    rating: 4.2,
    total_sales: 34,
    profile: {
      username: 'marie_douala',
      display_name: 'Marie Nkomo',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b494?w=150&h=150&fit=crop&crop=face'
    }
  }
];

export const mockMarketplaceProducts = [
  {
    id: '1',
    vendor_id: '1',
    name: 'Professional Laptop',
    description: 'High-performance laptop perfect for developers and content creators',
    price: 750000,
    currency: 'XAF',
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=500&h=400&fit=crop'],
    stock_quantity: 15,
    in_stock: true,
    marketplace_vendors: mockMarketplaceVendors[0]
  },
  {
    id: '2',
    vendor_id: '1',
    name: 'Gaming Setup',
    description: 'Complete gaming setup with monitor and accessories',
    price: 1200000,
    currency: 'XAF',
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=500&h=400&fit=crop'],
    stock_quantity: 8,
    in_stock: true,
    marketplace_vendors: mockMarketplaceVendors[0]
  },
  {
    id: '3',
    vendor_id: '2',
    name: 'Traditional Kente Cloth',
    description: 'Handwoven Kente cloth with authentic African patterns',
    price: 85000,
    currency: 'XAF',
    category: 'Fashion',
    images: ['https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=500&h=400&fit=crop'],
    stock_quantity: 25,
    in_stock: true,
    marketplace_vendors: mockMarketplaceVendors[1]
  },
  {
    id: '4',
    vendor_id: '2',
    name: 'Wooden Sculpture',
    description: 'Beautiful handcrafted wooden sculpture by local artisans',
    price: 45000,
    currency: 'XAF',
    category: 'Art',
    images: ['https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=500&h=400&fit=crop'],
    stock_quantity: 12,
    in_stock: true,
    marketplace_vendors: mockMarketplaceVendors[1]
  },
  {
    id: '5',
    vendor_id: '3',
    name: 'Organic Coffee Beans',
    description: 'Premium Arabica coffee beans grown in the highlands of Cameroon',
    price: 12000,
    currency: 'XAF',
    category: 'Food',
    images: ['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&h=400&fit=crop'],
    stock_quantity: 100,
    in_stock: true,
    marketplace_vendors: mockMarketplaceVendors[2]
  }
];

export const mockVendors = [
  {
    id: '1',
    name: 'Fatima Oumarou',
    vendorId: 'CM-VEN0001',
    businessName: 'Savana Crafts & Textiles',
    category: 'Arts & Crafts',
    location: 'Maroua, Far North',
    rating: 4.8,
    totalReviews: 127,
    verified: true,
    avatar: '',
    description: 'Authentic Cameroonian textiles, traditional crafts, and handmade jewelry. Promoting Far North cultural heritage through quality artisanal products.',
    productsCount: 45,
    escrowActive: true,
    joinedDate: 'March 2024',
    lastActive: '2 hours ago'
  },
  {
    id: '2',
    name: 'Joseph Fru Ndi',
    vendorId: 'CM-VEN0002',
    businessName: 'Highland Coffee Co.',
    category: 'Food & Beverages',
    location: 'Bamenda, Northwest',
    rating: 4.6,
    totalReviews: 89,
    verified: true,
    avatar: '',
    description: 'Premium Arabica coffee from the mountains of Northwest Cameroon. Direct from farm to your cup, supporting local coffee farmers.',
    productsCount: 12,
    escrowActive: true,
    joinedDate: 'January 2024',
    lastActive: '1 day ago'
  },
  {
    id: '3',
    name: 'Grace Mballa',
    vendorId: 'CM-VEN0003',
    businessName: 'TechHub CM',
    category: 'Electronics & Tech',
    location: 'Douala, Littoral',
    rating: 4.9,
    totalReviews: 234,
    verified: true,
    avatar: '',
    description: 'Latest smartphones, laptops, and tech accessories. Authorized dealer with warranty support and technical services.',
    productsCount: 78,
    escrowActive: true,
    joinedDate: 'November 2023',
    lastActive: '4 hours ago'
  }
];

export const mockNews = [
  {
    id: '1',
    title: 'Cameroon Launches National Digital ID System',
    title_fr: 'Le Cameroun lance un système national d\'identité numérique',
    excerpt: 'The government announces the rollout of a comprehensive digital identity system aimed at improving public services and reducing bureaucracy.',
    source: 'Cameroon Tribune',
    timestamp: '3 hours ago',
    sentiment: 'positive' as const,
    url: '#'
  },
  {
    id: '2',
    title: 'Infrastructure Development Continues in Northern Regions',
    title_fr: 'Le développement des infrastructures se poursuit dans les régions du Nord',
    excerpt: 'Major road construction projects are underway to improve connectivity between the northern regions and the rest of the country.',
    source: 'Journal du Cameroun',
    timestamp: '1 day ago',
    sentiment: 'positive' as const,
    url: '#'
  }
];

export const mockStats = {
  totalUsers: 2547683,
  dailyPulses: 180234,
  verifiedVendors: 1247,
  diasporaUsers: 456789,
  activePoliticians: 156,
  sentimentScore: 72
};