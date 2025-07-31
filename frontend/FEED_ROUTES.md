# CamerPulse Feed Routes - Complete Access Guide

## Main Feed Access Points

### 🌟 Primary Feed Route
- **URL**: `/` (Home page)
- **URL**: `/feed` (Direct feed access)
- **Component**: `NewFeed.tsx`
- **Description**: Complete unified feed with all platform features

## Feed Content Tabs (All accessible via main feed)

### 📊 All Content Feed
- **Tab**: `all` (default)
- **Content**: All platform features combined
- **Algorithm**: Personalized based on user preferences
- **Includes**: Civic updates, jobs, artists, villages, marketplace, petitions, political updates

### 🏛️ Civic Feed
- **Tab**: `civic`
- **Content**: Civic engagement content
- **Includes**: 
  - Civic pulse discussions
  - Political updates
  - Community petitions
  - Government announcements

### 💼 Jobs Feed
- **Tab**: `jobs`
- **Content**: Employment opportunities
- **Includes**:
  - Job listings
  - Career opportunities
  - Company announcements
  - Professional development

### 🎵 Artists Feed
- **Tab**: `artists`
- **Content**: Cameroon creative community
- **Includes**:
  - Artist profiles
  - Music releases
  - Cultural events
  - Creative showcases

### 🏘️ Villages Feed
- **Tab**: `villages`
- **Content**: Village and community updates
- **Includes**:
  - Village development projects
  - Community announcements
  - Local government updates
  - Infrastructure progress

### 🛒 Marketplace Feed
- **Tab**: `marketplace`
- **Content**: Business and commerce
- **Includes**:
  - Marketplace listings
  - Business directory updates
  - Product announcements
  - Service offerings

## Feed Features

### 🎯 Personalization
- **AI Algorithm**: Machine learning-powered content ranking
- **User Preferences**: Customizable content weights
- **Regional Focus**: Cameroon region-specific content
- **Engagement Tracking**: Smart interaction analytics

### 🔍 Filtering Options
- **Region Filter**: All 10 Cameroon regions + Diaspora
- **Content Type**: Granular content category filtering
- **Time Range**: 1h, 6h, 24h, 7d, 30d options
- **Search**: Real-time content search
- **Tags**: Custom tag-based filtering

### 📱 Mobile Optimization
- **Font**: Inter font family for optimal mobile readability
- **Touch Targets**: 44px minimum touch targets
- **Responsive Design**: Mobile-first approach
- **Performance**: Lazy loading and intersection observers
- **Accessibility**: WCAG 2.1 compliant

## Platform Features Integrated

### 100+ Platform Features in Feed Algorithm:
1. **Civic Engagement**: Pulse discussions, voting, petitions
2. **Job Directory**: Employment listings, career services
3. **Artist Directory**: Creative community, music, culture
4. **Village Directory**: Community profiles, development tracking
5. **Business Directory**: Company listings, services
6. **Political Directory**: Politicians, parties, rankings
7. **Marketplace**: Commerce, trade, services
8. **Education Directory**: Schools, universities, training
9. **Healthcare Directory**: Hospitals, clinics, pharmacies
10. **Tourism**: Attractions, hotels, destinations
11. **Transportation**: Logistics, travel, shipping
12. **Legal Services**: Lawyers, courts, legal aid
13. **Real Estate**: Properties, rentals, developments
14. **Agriculture**: Farming, cooperatives, markets
15. **Technology**: Tech companies, services, innovation
16. **Finance**: Banks, microfinance, fintech
17. **Media**: News, broadcasting, journalism
18. **NGOs**: Non-profits, charities, social causes
19. **Sports**: Teams, events, facilities
20. **Religion**: Churches, mosques, spiritual centers

## Technical Implementation

### Frontend Components:
- `NewFeed.tsx` - Main feed container
- `FeedHeader.tsx` - Header with status indicators
- `FeedFilters.tsx` - Advanced filtering system
- `UnifiedFeedContent.tsx` - Dynamic content renderer

### Backend Integration:
- `generate-personalized-feed` - Edge function for feed generation
- `update-feed-preferences` - User preference management
- `track-feed-interaction` - Engagement analytics

### Data Sources:
- All CamerPulse database tables
- Real-time content aggregation
- User interaction analytics
- Regional content prioritization

## Access Instructions

1. **Direct Access**: Navigate to `/` or `/feed`
2. **Tab Navigation**: Use tabs to filter content types
3. **Customization**: Use filters panel for personalization
4. **Mobile**: Fully optimized for mobile devices
5. **Offline**: Progressive Web App capabilities

## Performance Features

- **Infinite Scroll**: Automatic content loading
- **Pull-to-Refresh**: Mobile-native refresh gesture
- **Caching**: Smart content caching
- **Lazy Loading**: Optimized resource loading
- **Real-time Updates**: Live content synchronization

---

**Note**: All routes are accessible through the main CamerPulse navigation. The unified feed replaces all previous separate feed implementations for a seamless user experience.