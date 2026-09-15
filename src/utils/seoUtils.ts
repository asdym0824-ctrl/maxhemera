/**
 * Utility functions for setting route-specific SEO metadata, OpenGraph tags, and Canonical URLs.
 */

export interface SeoMetaOptions {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  keywords?: string[];
  noIndex?: boolean;
}

export function setSeoMetaData(
  titleOrOptions: string | SeoMetaOptions,
  description?: string,
  canonicalUrl?: string,
  options?: SeoMetaOptions
) {
  let title = '';
  let desc = '';
  let canonical = canonicalUrl;
  let opts = options;

  if (typeof titleOrOptions === 'object') {
    title = titleOrOptions.title || '';
    desc = titleOrOptions.description || '';
    canonical = titleOrOptions.canonicalUrl;
    opts = titleOrOptions;
  } else {
    title = titleOrOptions;
    desc = description || '';
  }

  // 1. Update Document Title
  if (title) {
    document.title = title;
  }

  // 2. Update Meta Description
  if (desc) {
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', desc);
  }

  // 3. Update Canonical URL
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical);
  } else if (canonicalLink) {
    const fallbackUrl = `${window.location.origin}${window.location.pathname}`;
    canonicalLink.setAttribute('href', fallbackUrl);
  }

  // 4. Update OpenGraph Title
  if (title) {
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', title);
  }

  // 5. Update OpenGraph Description
  if (desc) {
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', desc);
  }

  // 6. Update OpenGraph URL
  if (canonical || typeof window !== 'undefined') {
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', canonical || window.location.href);
  }

  // 7. Update OpenGraph Type
  let ogType = document.querySelector('meta[property="og:type"]');
  if (!ogType) {
    ogType = document.createElement('meta');
    ogType.setAttribute('property', 'og:type');
    document.head.appendChild(ogType);
  }
  ogType.setAttribute('content', opts?.ogType || 'website');

  // 8. Update OpenGraph Image if provided
  if (opts?.ogImage) {
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
      ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute('content', opts.ogImage);
  }

  // 9. Robots noindex if requested (e.g. unpublished/draft preview)
  let robotsMeta = document.querySelector('meta[name="robots"]');
  if (opts?.noIndex) {
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, nofollow');
  } else if (robotsMeta) {
    robotsMeta.setAttribute('content', 'index, follow');
  }
}
