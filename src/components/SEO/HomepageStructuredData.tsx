import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Comprehensive structured data for homepage SEO optimization
 */
export const HomepageStructuredData: React.FC = () => {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CamerPulse",
    "alternateName": ["CamerPulse Civic Platform", "CamerPulse Democracy Platform"],
    "description": "Africa's leading civic engagement and transparency platform empowering democratic participation in Cameroon",
    "url": "https://camerpulse.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://camerpulse.com/logo.png",
      "width": 512,
      "height": 512,
      "caption": "CamerPulse Logo"
    },
    "image": {
      "@type": "ImageObject",
      "url": "https://camerpulse.com/og-image-homepage.jpg",
      "width": 1200,
      "height": 630,
      "caption": "CamerPulse Civic Engagement Platform"
    },
    "foundingDate": "2024",
    "foundingLocation": {
      "@type": "Place",
      "name": "Cameroon",
      "addressCountry": "CM"
    },
    "areaServed": [
      {
        "@type": "Country",
        "name": "Cameroon",
        "alternateName": "Republic of Cameroon"
      },
      {
        "@type": "Place",
        "name": "Central Africa"
      }
    ],
    "audience": {
      "@type": "Audience",
      "audienceType": "Citizens of Cameroon",
      "geographicArea": {
        "@type": "Country",
        "name": "Cameroon"
      }
    },
    "sameAs": [
      "https://twitter.com/camerpulse",
      "https://facebook.com/camerpulse",
      "https://linkedin.com/company/camerpulse",
      "https://instagram.com/camerpulse"
    ],
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "availableLanguage": ["English", "French"],
        "areaServed": "CM"
      },
      {
        "@type": "ContactPoint",
        "contactType": "technical support",
        "availableLanguage": ["English", "French"],
        "areaServed": "CM"
      }
    ],
    "offers": {
      "@type": "Offer",
      "name": "Civic Engagement Platform Access",
      "category": "Civic Technology Services",
      "availability": "https://schema.org/InStock",
      "price": "0",
      "priceCurrency": "XAF",
      "description": "Free access to democratic participation tools, transparency tracking, and civic engagement features"
    },
    "numberOfEmployees": {
      "@type": "QuantitativeValue",
      "value": "50+"
    },
    "knowsAbout": [
      "Civic Engagement",
      "Political Transparency",
      "Democratic Participation",
      "Government Accountability",
      "Cameroon Politics",
      "African Democracy"
    ]
  };

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "CamerPulse",
    "alternateName": "CamerPulse Civic Platform",
    "url": "https://camerpulse.com",
    "description": "The most advanced civic engagement platform in Africa, empowering democratic participation in Cameroon",
    "inLanguage": ["en", "fr"],
    "copyrightYear": "2024",
    "creator": {
      "@type": "Organization",
      "name": "CamerPulse Team"
    },
    "potentialAction": [
      {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://camerpulse.com/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      {
        "@type": "LoginAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://camerpulse.com/auth"
        }
      }
    ],
    "mainEntity": {
      "@type": "WebApplication",
      "name": "CamerPulse Platform",
      "applicationCategory": "Civic Technology",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "XAF"
      }
    }
  };

  const webApplicationData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "CamerPulse",
    "description": "Comprehensive civic engagement platform for democratic participation in Cameroon",
    "url": "https://camerpulse.com",
    "applicationCategory": ["Civic Technology", "Political Platform", "Democracy Tools"],
    "operatingSystem": "Web Browser",
    "browserRequirements": "Modern web browser with JavaScript enabled",
    "permissions": "Location access for regional features (optional)",
    "screenshot": {
      "@type": "ImageObject",
      "url": "https://camerpulse.com/screenshot-homepage.jpg",
      "caption": "CamerPulse Platform Homepage"
    },
    "featureList": [
      "Political transparency tracking",
      "Civic polling and voting",
      "Government accountability monitoring",
      "Democratic participation tools",
      "Real-time sentiment analysis",
      "Politician performance tracking",
      "Community engagement features",
      "Transparency scoring system"
    ],
    "offers": {
      "@type": "Offer",
      "name": "Free Platform Access",
      "price": "0",
      "priceCurrency": "XAF",
      "availability": "https://schema.org/InStock"
    },
    "author": {
      "@type": "Organization",
      "name": "CamerPulse"
    }
  };

  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://camerpulse.com"
      }
    ]
  };

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is CamerPulse?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CamerPulse is Africa's most advanced civic engagement platform, providing real-time transparency tracking, democratic participation tools, and government accountability monitoring specifically designed for Cameroon."
        }
      },
      {
        "@type": "Question",
        "name": "Is CamerPulse free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, CamerPulse is completely free for all citizens. Our mission is to democratize access to civic engagement tools and government transparency information."
        }
      },
      {
        "@type": "Question",
        "name": "How does CamerPulse ensure data security?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CamerPulse uses end-to-end encryption, ISO 27001 certified security protocols, and follows international data protection standards to ensure your information remains secure and private."
        }
      },
      {
        "@type": "Question",
        "name": "Can diaspora Cameroonians use CamerPulse?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Absolutely! CamerPulse is designed to be diaspora-friendly, allowing Cameroonians worldwide to participate in democratic processes and stay connected with their homeland's civic activities."
        }
      }
    ]
  };

  return (
    <Helmet>
      {/* Organization Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationData)}
      </script>
      
      {/* Website Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(websiteData)}
      </script>
      
      {/* Web Application Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(webApplicationData)}
      </script>
      
      {/* Breadcrumb Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbData)}
      </script>
      
      {/* FAQ Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(faqData)}
      </script>
    </Helmet>
  );
};