import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    author?: string;
    image?: string;
    url?: string;
    type?: string;
}

export function SEO({
    title = 'FinisPro | Construction Admin Dashboard',
    description = 'A powerful Construction Project Management and Workforce administration dashboard.',
    keywords = 'construction, project management, workforce, dashboard, finispro',
    author = 'FinisPro Team',
    image = '/og-image.jpg',
    url = 'https://dashboard.finispro.com',
    type = 'website'
}: SEOProps) {
    const fullTitle = title.includes('FinisPro') ? title : `${title} | FinisPro`;

    return (
        <Helmet>
            {/* Basic metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content={author} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
            <meta property="og:url" content={url} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </Helmet>
    );
}
