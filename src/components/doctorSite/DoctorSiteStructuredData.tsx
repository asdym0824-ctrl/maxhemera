import React, { useEffect } from 'react';
import { Doctor, DetailedService, HealthArticle, DiseaseCondition } from '../../types';

interface Props {
  doctor: Doctor;
  subpage?: string;
  service?: DetailedService | null;
  article?: HealthArticle | null;
  condition?: DiseaseCondition | null;
  canonicalUrl?: string;
}

export const DoctorSiteStructuredData: React.FC<Props> = ({
  doctor,
  subpage = 'home',
  service,
  article,
  condition,
  canonicalUrl
}) => {
  const primaryOffice = doctor.offices?.[0];
  const baseUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/site/${doctor.slug}`
    : `https://hamrahclinic.ir/site/${doctor.slug}`;
  const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : baseUrl);

  // 1. Physician Schema
  const physicianSchema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    '@id': `${baseUrl}#physician`,
    name: doctor.name,
    jobTitle: doctor.title,
    medicalSpecialty: doctor.specialtyName,
    description: doctor.websiteConfig?.seoDescription || doctor.bio,
    image: doctor.avatar,
    url: baseUrl,
    telephone: doctor.websiteConfig?.phone || primaryOffice?.phone || '021-22000000',
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: primaryOffice?.address || doctor.address,
      addressLocality: primaryOffice?.city || doctor.city,
      addressRegion: 'Tehran',
      addressCountry: 'IR'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: doctor.rating ? doctor.rating.toString() : '5.0',
      reviewCount: doctor.reviewCount ? doctor.reviewCount.toString() : '1',
      bestRating: '5',
      worstRating: '1'
    },
    openingHoursSpecification: primaryOffice ? [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'],
        opens: '16:00',
        closes: '20:30'
      }
    ] : undefined,
    knowsAbout: doctor.services,
    availableService: (doctor.detailedServices || []).map(srv => ({
      '@type': 'MedicalProcedure',
      name: srv.title,
      description: srv.description
    }))
  };

  // 2. BreadcrumbList Schema for nested subpages
  const breadcrumbItems = [
    {
      '@type': 'ListItem',
      position: 1,
      name: `وبسایت ${doctor.name}`,
      item: baseUrl
    }
  ];

  if (subpage === 'about') {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: 'درباره پزشک و سوابق علمی',
      item: `${baseUrl}/about`
    });
  } else if (subpage === 'services' || subpage === 'service-detail') {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: 'خدمات تخصصی',
      item: `${baseUrl}/services`
    });
    if (subpage === 'service-detail' && service) {
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: 3,
        name: service.title,
        item: `${baseUrl}/services/${service.id}`
      });
    }
  } else if (subpage === 'conditions' || subpage === 'condition-detail') {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: 'حوزه‌های درمان و بیماری‌ها',
      item: `${baseUrl}/conditions`
    });
    if (subpage === 'condition-detail' && condition) {
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: 3,
        name: condition.persianTitle,
        item: `${baseUrl}/conditions/${condition.slug}`
      });
    }
  } else if (subpage === 'articles' || subpage === 'article-detail') {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: 'مقالات و آموزش سلامت',
      item: `${baseUrl}/articles`
    });
    if (subpage === 'article-detail' && article) {
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: `${baseUrl}/articles/${article.slug}`
      });
    }
  } else if (subpage === 'achievements') {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: 'افتخارات و مدارک',
      item: `${baseUrl}/achievements`
    });
  } else if (subpage === 'reviews') {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: 'نظرات مراجعین',
      item: `${baseUrl}/reviews`
    });
  } else if (subpage === 'offices') {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: 'مطب‌ها و ساعات حضور',
      item: `${baseUrl}/offices`
    });
  } else if (subpage === 'faq') {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: 'پرسش‌های متداول',
      item: `${baseUrl}/faq`
    });
  } else if (subpage === 'contact') {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: 'تماس با مطب',
      item: `${baseUrl}/contact`
    });
  } else if (subpage === 'videos') {
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: 2,
      name: 'ویدئوها و آموزش تصویری',
      item: `${baseUrl}/videos`
    });
  }

  const breadcrumbSchema = breadcrumbItems.length > 1 ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems
  } : null;

  // 3. Article Schema (when viewing article-detail)
  const articleSchema = (subpage === 'article-detail' && article) ? {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    '@id': `${currentUrl}#article`,
    headline: article.title,
    description: article.summary,
    image: article.coverImage,
    datePublished: article.updatedAt || '2025-01-01',
    dateModified: article.updatedAt || '2025-01-01',
    author: {
      '@type': 'Person',
      name: article.authorDoctorName || doctor.name,
      jobTitle: doctor.title,
      url: baseUrl
    },
    publisher: {
      '@type': 'Organization',
      name: 'همرا کلینیک',
      url: 'https://hamrahclinic.ir'
    },
    mainEntityOfPage: currentUrl,
    about: article.category
  } : null;

  // 4. FAQ Schema (when subpage === 'faq' or when viewing page with FAQ)
  const faqs = doctor.websiteConfig?.faqs || doctor.faqs || [];
  const faqSchema = (faqs.length > 0 && (subpage === 'faq' || subpage === 'home' || subpage === 'services')) ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer
      }
    }))
  } : null;

  // 5. MedicalProcedure Schema (when viewing service-detail)
  const serviceProcedureSchema = (subpage === 'service-detail' && service) ? {
    '@context': 'https://schema.org',
    '@type': 'MedicalProcedure',
    name: service.title,
    description: service.description,
    procedureType: 'https://schema.org/NoninvasiveProcedure',
    performer: {
      '@type': 'Physician',
      name: doctor.name,
      url: baseUrl
    },
    offers: service.price ? {
      '@type': 'Offer',
      price: service.price.toString(),
      priceCurrency: 'IRR',
      availability: 'https://schema.org/InStock'
    } : undefined
  } : null;

  // 6. MedicalCondition Schema (when viewing condition-detail)
  const conditionSchema = (subpage === 'condition-detail' && condition) ? {
    '@context': 'https://schema.org',
    '@type': 'MedicalCondition',
    name: condition.persianTitle,
    alternateName: condition.title,
    description: condition.overview,
    signOrSymptom: condition.symptoms?.map(s => ({
      '@type': 'MedicalSymptom',
      name: s
    }))
  } : null;

  const schemasToRender = [
    physicianSchema,
    breadcrumbSchema,
    articleSchema,
    faqSchema,
    serviceProcedureSchema,
    conditionSchema
  ].filter(Boolean);

  return (
    <>
      {schemasToRender.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
};
