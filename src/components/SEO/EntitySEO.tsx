import { Helmet } from 'react-helmet-async';
import { getCanonicalURL } from '@/utils/slug';

interface BaseEntity {
  id: string;
  slug?: string;
  name?: string;
  full_name?: string;
  title?: string;
}

interface PoliticianEntity extends BaseEntity {
  full_name: string;
  position_title?: string;
  role_title?: string;
  constituency?: string;
  region?: string;
  ministry?: string;
  bio?: string;
  profile_picture_url?: string;
  average_rating?: number;
  political_parties?: {
    name: string;
    acronym?: string;
  };
}

interface PoliticalPartyEntity extends BaseEntity {
  name: string;
  acronym?: string;
  description?: string;
  logo_url?: string;
  ideology?: string;
  founded_year?: number;
  leader_name?: string;
  member_count?: number;
}

interface VillageEntity extends BaseEntity {
  village_name: string;
  region: string;
  division?: string;
  population?: number;
  description?: string;
  village_chief_name?: string;
  fon_name?: string;
}

interface CompanyEntity extends BaseEntity {
  name: string;
  description?: string;
  industry?: string;
  location?: string;
  logo_url?: string;
  website?: string;
  employee_count?: number;
}

interface EntitySEOProps {
  entity: PoliticianEntity | PoliticalPartyEntity | VillageEntity | CompanyEntity;
  entityType: 'politician' | 'mp' | 'senator' | 'minister' | 'political_party' | 'village' | 'company';
  customTitle?: string;
  customDescription?: string;
}

export function EntitySEO({ entity, entityType, customTitle, customDescription }: EntitySEOProps) {
  if (!entity) return null;

  const generateTitle = (): string => {
    if (customTitle) return customTitle;

    switch (entityType) {
      case 'politician':
      case 'mp':
      case 'senator':
      case 'minister': {
        const politician = entity as PoliticianEntity;
        const position = politician.position_title || politician.role_title || entityType.toUpperCase();
        const location = politician.constituency || politician.region || politician.ministry;
        return `${politician.full_name} - ${position}${location ? ` for ${location}` : ''} | CamerPulse`;
      }
      case 'political_party': {
        const party = entity as PoliticalPartyEntity;
        return `${party.name}${party.acronym ? ` (${party.acronym})` : ''} | CamerPulse`;
      }
      case 'village': {
        const village = entity as VillageEntity;
        return `${village.village_name}, ${village.region} | CamerPulse`;
      }
      case 'company': {
        const company = entity as CompanyEntity;
        return `${company.name}${company.industry ? ` - ${company.industry}` : ''} | CamerPulse`;
      }
      default:
        return `${(entity as any).name || (entity as any).full_name || (entity as any).title} | CamerPulse`;
    }
  };

  const generateDescription = (): string => {
    if (customDescription) return customDescription;

    switch (entityType) {
      case 'politician':
      case 'mp':
      case 'senator':
      case 'minister': {
        const politician = entity as PoliticianEntity;
        const position = politician.position_title || politician.role_title || entityType.toUpperCase();
        const location = politician.constituency || politician.region || politician.ministry;
        const party = politician.political_parties?.name;
        const rating = politician.average_rating ? ` with ${politician.average_rating.toFixed(1)}/5 rating` : '';
        
        return `View the complete profile of ${politician.full_name}, ${position}${location ? ` for ${location}` : ''}${party ? ` (${party})` : ''}${rating}. Check transparency ratings, performance metrics, and civic achievements on CamerPulse.`;
      }
      case 'political_party': {
        const party = entity as PoliticalPartyEntity;
        const founded = party.founded_year ? ` Founded in ${party.founded_year}` : '';
        const ideology = party.ideology ? ` with ${party.ideology} ideology` : '';
        const members = party.member_count ? ` representing ${party.member_count} members` : '';
        
        return `Learn about ${party.name} (${party.acronym || 'Political Party'})${founded}${ideology}${members}. View party platform, leadership, and electoral performance on CamerPulse.`;
      }
      case 'village': {
        const village = entity as VillageEntity;
        const population = village.population ? ` with ${village.population.toLocaleString()} residents` : '';
        const leader = village.fon_name || village.village_chief_name;
        const leadership = leader ? ` led by ${leader}` : '';
        
        return `Discover ${village.village_name} in ${village.region}, ${village.division || 'Cameroon'}${population}${leadership}. View development projects, community information, and local governance on CamerPulse.`;
      }
      case 'company': {
        const company = entity as CompanyEntity;
        const industry = company.industry ? ` in ${company.industry}` : '';
        const location = company.location ? ` based in ${company.location}` : '';
        const employees = company.employee_count ? ` with ${company.employee_count} employees` : '';
        
        return `Learn about ${company.name}${industry}${location}${employees}. View company profile, ratings, and business information on CamerPulse.`;
      }
      default:
        return `Detailed information about ${(entity as any).name || (entity as any).full_name} on CamerPulse.`;
    }
  };

  const generateKeywords = (): string => {
    const baseKeywords = ['CamerPulse', 'Cameroon'];
    
    switch (entityType) {
      case 'politician':
      case 'mp':
      case 'senator':
      case 'minister': {
        const politician = entity as PoliticianEntity;
        return [
          politician.full_name,
          politician.position_title || politician.role_title || entityType,
          politician.constituency || politician.region || politician.ministry,
          politician.political_parties?.name,
          'transparency rating',
          'civic performance',
          'politician profile',
          ...baseKeywords
        ].filter(Boolean).join(', ');
      }
      case 'political_party': {
        const party = entity as PoliticalPartyEntity;
        return [
          party.name,
          party.acronym,
          'political party',
          'electoral platform',
          'party leadership',
          'Cameroon politics',
          ...baseKeywords
        ].filter(Boolean).join(', ');
      }
      case 'village': {
        const village = entity as VillageEntity;
        return [
          village.village_name,
          village.region,
          village.division,
          'village profile',
          'community development',
          'local governance',
          ...baseKeywords
        ].filter(Boolean).join(', ');
      }
      case 'company': {
        const company = entity as CompanyEntity;
        return [
          company.name,
          company.industry,
          company.location,
          'business profile',
          'company ratings',
          'Cameroon business',
          ...baseKeywords
        ].filter(Boolean).join(', ');
      }
      default:
        return baseKeywords.join(', ');
    }
  };

  const getEntityUrl = (): string => {
    const slug = entity.slug || entity.id;
    const entityPath = entityType === 'political_party' ? 'parties' : `${entityType}s`;
    return `/${entityPath}/${slug}`;
  };

  const getImageUrl = (): string | undefined => {
    switch (entityType) {
      case 'politician':
      case 'mp':
      case 'senator':
      case 'minister':
        return (entity as PoliticianEntity).profile_picture_url;
      case 'political_party':
        return (entity as PoliticalPartyEntity).logo_url;
      case 'company':
        return (entity as CompanyEntity).logo_url;
      default:
        return undefined;
    }
  };

  const title = generateTitle();
  const description = generateDescription();
  const keywords = generateKeywords();
  const canonicalUrl = getCanonicalURL(getEntityUrl());
  const imageUrl = getImageUrl();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": entityType === 'political_party' ? 'Organization' : 
              entityType === 'village' ? 'Place' :
              entityType === 'company' ? 'Organization' : 'Person',
    "name": (entity as any).name || (entity as any).full_name || (entity as any).village_name,
    "url": canonicalUrl,
    ...(imageUrl && { "image": imageUrl }),
    ...(description && { "description": description.substring(0, 200) }),
    ...(entityType !== 'village' && entityType !== 'company' && {
      "jobTitle": (entity as PoliticianEntity).position_title || (entity as PoliticianEntity).role_title,
      "worksFor": (entity as PoliticianEntity).political_parties?.name
    }),
    ...(entityType === 'village' && {
      "addressRegion": (entity as VillageEntity).region,
      "addressCountry": "Cameroon"
    }),
    ...(entityType === 'company' && {
      "industry": (entity as CompanyEntity).industry,
      "address": (entity as CompanyEntity).location
    })
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={entityType === 'village' ? 'place' : entityType === 'company' || entityType === 'political_party' ? 'organization' : 'profile'} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content="CamerPulse" />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      {imageUrl && <meta property="og:image:alt" content={`Photo of ${(entity as any).name || (entity as any).full_name}`} />}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      {imageUrl && <meta property="twitter:image" content={imageUrl} />}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
}