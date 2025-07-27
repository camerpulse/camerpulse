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
    location: 'Douala, Littoral',
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
    location: 'Yaoundé, Centre',
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
    verification_status: 'verified',
    rating: 4.2,
    total_sales: 34,
    location: 'Bamenda, Northwest',
    profile: {
      username: 'marie_douala',
      display_name: 'Marie Nkomo',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b494?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    id: '4',
    user_id: '6',
    vendor_id: 'CM-4567890',
    business_name: 'Urban Fashion House',
    description: 'Contemporary African fashion and streetwear',
    verification_status: 'verified',
    rating: 4.9,
    total_sales: 245,
    location: 'Douala, Littoral',
    profile: {
      username: 'urban_style',
      display_name: 'Pascal Nguemo',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    id: '5',
    user_id: '7',
    vendor_id: 'CM-5678901',
    business_name: 'Artisan Workshop',
    description: 'Handcrafted furniture and home decor',
    verification_status: 'verified',
    rating: 4.7,
    total_sales: 78,
    location: 'Bafoussam, West',
    profile: {
      username: 'artisan_master',
      display_name: 'Jean-Baptiste Foko',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    }
  },
  {
    id: '6',
    user_id: '8',
    vendor_id: 'CM-6789012',
    business_name: 'Wellness & Beauty',
    description: 'Natural skincare and wellness products',
    verification_status: 'verified',
    rating: 4.5,
    total_sales: 167,
    location: 'Yaoundé, Centre',
    profile: {
      username: 'wellness_queen',
      display_name: 'Grace Mballa',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face'
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
    marketplace_vendors: mockMarketplaceVendors[0],
    rating: 4.8,
    created_at: '2024-01-15T10:30:00Z'
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
    marketplace_vendors: mockMarketplaceVendors[0],
    rating: 4.9,
    created_at: '2024-01-20T14:20:00Z'
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
    marketplace_vendors: mockMarketplaceVendors[1],
    rating: 4.7,
    created_at: '2024-01-18T09:15:00Z'
  },
  {
    id: '4',
    vendor_id: '2',
    name: 'Wooden Sculpture',
    description: 'Beautiful handcrafted wooden sculpture by local artisans',
    price: 45000,
    currency: 'XAF',
    category: 'Art & Crafts',
    images: ['https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=500&h=400&fit=crop'],
    stock_quantity: 12,
    in_stock: true,
    marketplace_vendors: mockMarketplaceVendors[1],
    rating: 4.6,
    created_at: '2024-01-12T16:45:00Z'
  },
  {
    id: '5',
    vendor_id: '3',
    name: 'Organic Coffee Beans',
    description: 'Premium Arabica coffee beans grown in the highlands of Cameroon',
    price: 12000,
    currency: 'XAF',
    category: 'Food & Agriculture',
    images: ['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&h=400&fit=crop'],
    stock_quantity: 100,
    in_stock: true,
    marketplace_vendors: mockMarketplaceVendors[2],
    rating: 4.5,
    created_at: '2024-01-10T11:30:00Z'
  },
  {
    id: '6',
    vendor_id: '1',
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling wireless headphones with 30h battery life',
    price: 125000,
    currency: 'XAF',
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=400&fit=crop'],
    stock_quantity: 30,
    in_stock: true,
    marketplace_vendors: mockMarketplaceVendors[0],
    rating: 4.8,
    created_at: '2024-01-22T08:20:00Z'
  },
  {
    id: '7',
    vendor_id: '2',
    name: 'Bambara Dress',
    description: 'Traditional Bambara dress with modern fit and authentic patterns',
    price: 65000,
    currency: 'XAF',
    category: 'Fashion',
    images: ['https://images.unsplash.com/photo-1594736797933-d0a8b4ab7ec0?w=500&h=400&fit=crop'],
    stock_quantity: 18,
    in_stock: true,
    marketplace_vendors: mockMarketplaceVendors[1],
    rating: 4.9,
    created_at: '2024-01-25T13:10:00Z'
  },
  {
    id: '8',
    vendor_id: '3',
    name: 'Plantain Chips',
    description: 'Crispy plantain chips made from fresh Cameroon plantains',
    price: 3500,
    currency: 'XAF',
    category: 'Food & Agriculture',
    images: ['https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500&h=400&fit=crop'],
    stock_quantity: 200,
    in_stock: true,
    marketplace_vendors: mockMarketplaceVendors[2],
    rating: 4.4,
    created_at: '2024-01-14T15:45:00Z'
  },
  {
    id: '9',
    vendor_id: '2',
    name: 'African Mask Collection',
    description: 'Set of 3 traditional African masks for home decoration',
    price: 75000,
    currency: 'XAF',
    category: 'Art & Crafts',
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=400&fit=crop'],
    stock_quantity: 8,
    in_stock: true,
    marketplace_vendors: mockMarketplaceVendors[1],
    rating: 4.7,
    created_at: '2024-01-19T12:30:00Z'
  },
  {
    id: '10',
    vendor_id: '1',
    name: 'Smartphone',
    description: 'Latest Android smartphone with dual camera and 128GB storage',
    price: 285000,
    currency: 'XAF',
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=400&fit=crop'],
    stock_quantity: 22,
    in_stock: true,
    marketplace_vendors: mockMarketplaceVendors[0],
    rating: 4.6,
    created_at: '2024-01-21T17:00:00Z'
  },
  {
    id: '11',
    vendor_id: '4',
    name: 'Ankara Jacket',
    description: 'Stylish Ankara print jacket with modern tailoring',
    price: 45000,
    currency: 'XAF',
    category: 'Fashion',
    images: ['https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=500&h=400&fit=crop'],
    stock_quantity: 15,
    in_stock: true,
    marketplace_vendors: mockMarketplaceVendors[3],
    rating: 4.8,
    created_at: '2024-01-23T11:15:00Z'
  },
  {
    id: '12',
    vendor_id: '5',
    name: 'Wooden Coffee Table',
    description: 'Handcrafted wooden coffee table with traditional carvings',
    price: 125000,
    currency: 'XAF',
    category: 'Home & Garden',
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=400&fit=crop'],
    stock_quantity: 6,
    in_stock: true,
    marketplace_vendors: mockMarketplaceVendors[4],
    rating: 4.9,
    created_at: '2024-01-24T14:30:00Z'
  },
  {
    id: '13',
    vendor_id: '6',
    name: 'Shea Butter Skincare Set',
    description: 'Natural shea butter skincare collection for all skin types',
    price: 35000,
    currency: 'XAF',
    category: 'Health & Beauty',
    images: ['https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500&h=400&fit=crop'],
    stock_quantity: 40,
    in_stock: true,
    marketplace_vendors: mockMarketplaceVendors[5],
    rating: 4.7,
    created_at: '2024-01-26T09:45:00Z'
  },
  {
    id: '14',
    vendor_id: '3',
    name: 'Cameroon Pepper Mix',
    description: 'Authentic Cameroon pepper blend for traditional cooking',
    price: 8500,
    currency: 'XAF',
    category: 'Food & Agriculture',
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=400&fit=crop'],
    stock_quantity: 75,
    in_stock: true,
    marketplace_vendors: mockMarketplaceVendors[2],
    rating: 4.5,
    created_at: '2024-01-27T16:20:00Z'
  },
  {
    id: '15',
    vendor_id: '1',
    name: 'Tablet with Stylus',
    description: 'High-resolution tablet perfect for digital art and productivity',
    price: 425000,
    currency: 'XAF',
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=400&fit=crop'],
    stock_quantity: 12,
    in_stock: true,
    marketplace_vendors: mockMarketplaceVendors[0],
    rating: 4.7,
    created_at: '2024-01-28T13:10:00Z'
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
    excerpt: 'The government announces the rollout of a comprehensive digital identity system aimed at improving public services and reducing bureaucracy.',
    source: 'Cameroon Tribune',
    timestamp: '3 hours ago',
    sentiment: 'positive' as const,
    url: '#'
  },
  {
    id: '2',
    title: 'Infrastructure Development Continues in Northern Regions',
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

// Mock data for Diaspora features
export const mockDiasporaStats = {
  totalMembers: 456789,
  projectsFunded: 234,
  totalRaised: 12500000,
  totalProjects: 89
};

export const mockDiasporaProfiles = [
  {
    id: '1',
    user_id: 'user_1',
    full_name: 'Jean-Paul Mengue',
    country_of_residence: 'France',
    city_of_residence: 'Paris',
    home_village_town_city: 'Douala',
    skills_expertise: ['Software Development', 'Project Management'],
    years_in_diaspora: 8,
    willing_to_mentor: true,
    available_for_projects: true,
    verification_status: 'verified' as const,
    total_contributions_fcfa: 250000,
    total_projects_supported: 5,
    impact_score: 87,
    created_at: '2024-01-15',
    updated_at: '2024-01-20'
  },
  {
    id: '2',
    user_id: 'user_2',
    full_name: 'Marie-Claire Nkomo',
    country_of_residence: 'Canada',
    city_of_residence: 'Toronto',
    home_village_town_city: 'Yaoundé',
    skills_expertise: ['Healthcare', 'Public Health'],
    years_in_diaspora: 12,
    willing_to_mentor: true,
    available_for_projects: true,
    verification_status: 'verified' as const,
    total_contributions_fcfa: 500000,
    total_projects_supported: 8,
    impact_score: 92,
    created_at: '2023-11-10',
    updated_at: '2024-01-18'
  }
];

export const mockInvestmentProjects = [
  {
    id: '1',
    title: 'Solar Power Initiative - Northwest Region',
    description: 'Installing solar panels in rural communities to provide sustainable electricity access.',
    category: 'Energy',
    funding_goal_fcfa: 25000000,
    current_funding_fcfa: 18500000,
    status: 'fundraising' as const,
    verification_status: 'verified' as const,
    location: 'Northwest Region',
    expected_impact: '2,500 households will gain access to clean electricity',
    timeline_months: 18,
    project_lead: 'Ministry of Energy',
    images: [],
    created_at: '2024-01-10',
    deadline: '2024-06-30'
  },
  {
    id: '2',
    title: 'Digital Education Hub - Maroua',
    description: 'Building a modern computer center to provide digital literacy training for youth.',
    category: 'Education',
    funding_goal_fcfa: 15000000,
    current_funding_fcfa: 8200000,
    status: 'fundraising' as const,
    verification_status: 'verified' as const,
    location: 'Far North Region',
    expected_impact: '1,000 students trained annually in digital skills',
    timeline_months: 12,
    project_lead: 'Local Education Board',
    images: [],
    created_at: '2024-01-05',
    deadline: '2024-09-15'
  },
  {
    id: '3',
    title: 'Water Well Project - Adamawa',
    description: 'Drilling clean water wells in remote villages to improve access to safe drinking water.',
    category: 'Infrastructure',
    funding_goal_fcfa: 12000000,
    current_funding_fcfa: 12000000,
    status: 'completed' as const,
    verification_status: 'verified' as const,
    location: 'Adamawa Region',
    expected_impact: '5 villages with permanent clean water access',
    timeline_months: 6,
    project_lead: 'Rural Development Association',
    images: [],
    created_at: '2023-10-01',
    deadline: '2024-03-31'
  }
];

export const mockDiasporaEvents = [
  {
    id: '1',
    title: 'Virtual Town Hall: Education Reform Discussion',
    description: 'Join fellow Cameroonians to discuss proposed education reforms and share your input.',
    event_type: 'town_hall' as const,
    start_time: '2024-02-15T19:00:00Z',
    end_time: '2024-02-15T21:00:00Z',
    timezone: 'GMT',
    platform: 'Zoom',
    meeting_link: 'https://zoom.us/j/123456789',
    organizer: 'CamerPulse Team',
    max_participants: 500,
    current_participants: 247,
    is_recording: true,
    created_at: '2024-01-20'
  },
  {
    id: '2',
    title: 'Investment Opportunities Summit 2024',
    description: 'Discover high-impact investment opportunities in Cameroon\'s development sectors.',
    event_type: 'summit' as const,
    start_time: '2024-03-10T14:00:00Z',
    end_time: '2024-03-10T18:00:00Z',
    timezone: 'GMT',
    platform: 'Teams',
    meeting_link: 'https://teams.microsoft.com/meet/abc123',
    organizer: 'Diaspora Investment Group',
    max_participants: 1000,
    current_participants: 156,
    is_recording: true,
    created_at: '2024-01-25'
  }
];

export const mockDiasporaRecognition = [
  {
    id: '1',
    title: 'Top Contributor 2023',
    description: 'Jean-Paul Mengue donated 500,000 FCFA to education projects',
    recipient_name: 'Jean-Paul Mengue',
    recognition_type: 'financial_contribution' as const,
    amount_fcfa: 500000,
    project_supported: 'Digital Education Hub - Maroua',
    date_awarded: '2024-01-01',
    verified: true
  },
  {
    id: '2',
    title: 'Community Builder Award',
    description: 'Marie-Claire Nkomo organized 5 diaspora networking events',
    recipient_name: 'Marie-Claire Nkomo',
    recognition_type: 'community_building' as const,
    events_organized: 5,
    participants_reached: 250,
    date_awarded: '2024-01-10',
    verified: true
  },
  {
    id: '3',
    title: 'Innovation Champion',
    description: 'Paul Fotso contributed technical expertise to rural connectivity project',
    recipient_name: 'Paul Fotso',
    recognition_type: 'expertise_sharing' as const,
    skills_contributed: ['Network Engineering', 'Rural Connectivity'],
    project_supported: 'Rural Internet Access Initiative',
    date_awarded: '2024-01-15',
    verified: true
  }
];

// Mock data for Virtual Town Halls
export const mockVirtualTownhalls = [
  {
    id: '1',
    title: 'Diaspora Investment Summit 2024',
    description: 'Annual summit bringing together diaspora investors and local development partners to discuss investment opportunities in Cameroon.',
    event_type: 'summit',
    scheduled_date: '2024-03-15T14:00:00Z',
    duration_minutes: 240,
    platform: 'zoom',
    meeting_link: 'https://zoom.us/j/123456789',
    organizer_name: 'CamerPulse Investment Team',
    max_participants: 1000,
    current_participants: 342,
    registration_required: true,
    agenda: ['Opening Remarks', 'Investment Portfolio Review', 'New Project Presentations', 'Breakout Sessions', 'Q&A with Government Officials'],
    regions_focus: ['All Regions'],
    topics: ['Infrastructure', 'Education', 'Healthcare', 'Technology', 'Agriculture'],
    status: 'scheduled'
  },
  {
    id: '2',
    title: 'Northwest Region Development Roundtable',
    description: 'Monthly discussion on development progress in the Northwest region with direct participation from regional representatives.',
    event_type: 'roundtable',
    scheduled_date: '2024-02-28T16:00:00Z',
    duration_minutes: 120,
    platform: 'teams',
    organizer_name: 'Northwest Regional Council',
    max_participants: 200,
    current_participants: 67,
    registration_required: true,
    agenda: ['Regional Progress Update', 'Diaspora Contribution Report', 'Community Challenges Discussion', 'Action Items Review'],
    regions_focus: ['Northwest'],
    topics: ['Regional Development', 'Infrastructure', 'Security', 'Education'],
    status: 'scheduled'
  }
];

// Mock data for Transaction Logs
export const mockTransactionLogs = [
  {
    id: '1',
    diaspora_profile_id: '1',
    transaction_type: 'donation',
    amount_fcfa: 75000,
    amount_original_currency: 125,
    original_currency: 'USD',
    project_name: 'Rural Education Initiative - Bamenda',
    payment_method: 'flutterwave',
    payment_reference: 'FLW-CAMERPULSE-2024-001',
    payment_status: 'completed',
    qr_receipt_data: {
      verification_code: 'QR-2024-EDU-001',
      issued_at: '2024-01-15T10:30:00Z',
      expires_at: '2025-01-15T10:30:00Z'
    },
    audit_trail: {
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      verification_level: 'verified',
      geolocation: 'Paris, France'
    },
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    diaspora_profile_id: '1',
    transaction_type: 'investment',
    amount_fcfa: 250000,
    amount_original_currency: 350,
    original_currency: 'EUR',
    project_name: 'Solar Energy Project - Far North',
    payment_method: 'flutterwave',
    payment_reference: 'FLW-CAMERPULSE-2024-002',
    payment_status: 'completed',
    qr_receipt_data: {
      verification_code: 'QR-2024-SOL-002',
      issued_at: '2024-01-20T14:15:00Z',
      expires_at: '2025-01-20T14:15:00Z'
    },
    audit_trail: {
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      verification_level: 'verified',
      geolocation: 'Paris, France'
    },
    created_at: '2024-01-20T14:15:00Z'
  }
];