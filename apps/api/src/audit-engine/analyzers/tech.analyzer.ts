import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { TechStack } from '@dlmetrix/shared';

// ── Fingerprint rules ─────────────────────────────────────────────────────────
// Each rule: pattern to match against html/headers, and the tech to report.
interface Rule {
  name: string;
  category: TechStack['category'];
  // at least one of these must be provided
  html?:    RegExp;
  header?:  { name: string; pattern: RegExp };
  meta?:    { name: string; pattern: RegExp };
  script?:  RegExp;         // matches <script src="…">
  link?:    RegExp;         // matches <link href="…">
  global?:  RegExp;         // matches inline JS (window.X / var X)
  cookie?:  RegExp;
}

const RULES: Rule[] = [
  // ── CMS ────────────────────────────────────────────────────────
  { name: 'WordPress',    category: 'CMS',       html:   /wp-content|wp-includes|wp-json/i },
  { name: 'Joomla',       category: 'CMS',       html:   /\/components\/com_|Joomla!/i },
  { name: 'Drupal',       category: 'CMS',       meta:   { name: 'generator', pattern: /drupal/i } },
  { name: 'Magento',      category: 'CMS',       html:   /Mage\.Cookies|\/skin\/frontend\//i },
  { name: 'Shopify',      category: 'CMS',       html:   /cdn\.shopify\.com|Shopify\.theme/i },
  { name: 'PrestaShop',   category: 'CMS',       html:   /prestashop|\/modules\/ps_/i },
  { name: 'TYPO3',        category: 'CMS',       meta:   { name: 'generator', pattern: /typo3/i } },
  { name: 'Ghost',        category: 'CMS',       meta:   { name: 'generator', pattern: /ghost/i } },
  { name: 'Wix',          category: 'CMS',       html:   /wix\.com|wixstatic\.com/i },
  { name: 'Squarespace',  category: 'CMS',       html:   /squarespace\.com|static\.squarespace/i },
  { name: 'Webflow',      category: 'CMS',       html:   /webflow\.com|Webflow/i },

  // ── JS Frameworks ────────────────────────────────────────────────
  { name: 'Next.js',      category: 'Framework', html:   /__NEXT_DATA__|_next\/static/i },
  { name: 'Nuxt.js',      category: 'Framework', html:   /__NUXT__|_nuxt\//i },
  { name: 'React',        category: 'Framework', html:   /react(?:\.production|\.development|Dom)/i },
  { name: 'Vue.js',       category: 'Framework', html:   /vue(?:\.min)?\.js|__vue_/i },
  { name: 'Angular',      category: 'Framework', html:   /ng-version=|angular(?:\.min)?\.js/i },
  { name: 'Svelte',       category: 'Framework', html:   /svelte|__svelte/i },
  { name: 'Gatsby',       category: 'Framework', html:   /___gatsby|gatsby-chunk/i },
  { name: 'Astro',        category: 'Framework', html:   /astro-island|astro:page-load/i },
  { name: 'Remix',        category: 'Framework', html:   /__remixContext|@remix-run/i },
  { name: 'SvelteKit',    category: 'Framework', html:   /kit\.svelte|__sveltekit/i },
  { name: 'Ember.js',     category: 'Framework', script: /ember(?:\.min)?\.js/i },
  { name: 'Backbone.js',  category: 'Framework', script: /backbone(?:\.min)?\.js/i },

  // ── CSS Frameworks ───────────────────────────────────────────────
  { name: 'Tailwind CSS', category: 'UI',        html:   /tailwindcss|tw-|class="[^"]*(?:flex|grid|text-\w+-\d{3}|bg-\w+-\d{3})[^"]*"/i },
  { name: 'Bootstrap',    category: 'UI',        html:   /bootstrap(?:\.min)?\.css|class="[^"]*(?:container-fluid|navbar-|btn-primary)/i },
  { name: 'Material UI',  category: 'UI',        html:   /MuiButton|MuiTypography|@mui\//i },
  { name: 'Chakra UI',    category: 'UI',        html:   /chakra-|@chakra-ui/i },
  { name: 'Ant Design',   category: 'UI',        html:   /ant-design|antd\/lib/i },
  { name: 'Bulma',        category: 'UI',        link:   /bulma(?:\.min)?\.css/i },
  { name: 'Foundation',   category: 'UI',        link:   /foundation(?:\.min)?\.css/i },

  // ── Analytics ───────────────────────────────────────────────────
  { name: 'Google Analytics', category: 'Analytics', html: /google-analytics\.com\/analytics\.js|gtag\('config'|UA-\d+-\d+|G-[A-Z0-9]+/i },
  { name: 'Google Tag Manager', category: 'Analytics', html: /googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]+/i },
  { name: 'Hotjar',       category: 'Analytics', html:   /hotjar\.com|hjid/i },
  { name: 'Mixpanel',     category: 'Analytics', html:   /mixpanel\.com|mixpanel\.init/i },
  { name: 'Segment',      category: 'Analytics', html:   /cdn\.segment\.com|analytics\.load/i },
  { name: 'Plausible',    category: 'Analytics', script: /plausible\.io\/js/i },
  { name: 'Matomo',       category: 'Analytics', html:   /matomo\.js|_paq\.push/i },
  { name: 'Clarity',      category: 'Analytics', html:   /clarity\.ms|microsoft\.com\/clarity/i },

  // ── CDN / Hosting ───────────────────────────────────────────────
  { name: 'Cloudflare',   category: 'CDN',       header: { name: 'cf-ray', pattern: /.+/ } },
  { name: 'AWS CloudFront', category: 'CDN',     header: { name: 'x-amz-cf-id', pattern: /.+/ } },
  { name: 'Fastly',       category: 'CDN',       header: { name: 'x-served-by', pattern: /fastly/i } },
  { name: 'Vercel',       category: 'Hosting',   header: { name: 'x-vercel-id', pattern: /.+/ } },
  { name: 'Netlify',      category: 'Hosting',   header: { name: 'x-nf-request-id', pattern: /.+/ } },
  { name: 'GitHub Pages', category: 'Hosting',   header: { name: 'x-github-request-id', pattern: /.+/ } },

  // ── Server ───────────────────────────────────────────────────────
  { name: 'Nginx',        category: 'Server',    header: { name: 'server', pattern: /nginx/i } },
  { name: 'Apache',       category: 'Server',    header: { name: 'server', pattern: /apache/i } },
  { name: 'Caddy',        category: 'Server',    header: { name: 'server', pattern: /caddy/i } },
  { name: 'IIS',          category: 'Server',    header: { name: 'server', pattern: /microsoft-iis/i } },
  { name: 'LiteSpeed',    category: 'Server',    header: { name: 'server', pattern: /litespeed/i } },

  // ── E-commerce ───────────────────────────────────────────────────
  { name: 'WooCommerce',  category: 'Ecommerce', html:   /woocommerce|add_to_cart_url/i },
  { name: 'BigCommerce',  category: 'Ecommerce', html:   /bigcommerce\.com|BigCommerce/i },
  { name: 'OpenCart',     category: 'Ecommerce', html:   /opencart|catalog\/view\/theme/i },

  // ── Libraries ────────────────────────────────────────────────────
  { name: 'jQuery',       category: 'Library',   html:   /jquery(?:\.min)?\.js|jQuery\.fn\.jquery/i },
  { name: 'GSAP',         category: 'Library',   script: /gsap(?:\.min)?\.js|greensock/i },
  { name: 'Lodash',       category: 'Library',   script: /lodash(?:\.min)?\.js/i },
  { name: 'Alpine.js',    category: 'Library',   html:   /alpinejs|x-data="/i },
  { name: 'HTMX',         category: 'Library',   html:   /hx-get=|hx-post=|htmx\.org/i },
  { name: 'Axios',        category: 'Library',   script: /axios(?:\.min)?\.js/i },
  { name: 'Framer Motion', category: 'Library',  html:   /framer-motion|__framer/i },
  { name: 'Three.js',     category: 'Library',   script: /three(?:\.min)?\.js/i },
  { name: 'Swiper',       category: 'Library',   html:   /swiper(?:\.min)?\.(?:js|css)|swiper-wrapper/i },
  { name: 'Chart.js',     category: 'Library',   script: /chart(?:\.min)?\.js/i },

  // ── Auth / Payments ──────────────────────────────────────────────
  { name: 'Stripe',       category: 'Payment',   html:   /js\.stripe\.com|Stripe\(/i },
  { name: 'PayPal',       category: 'Payment',   html:   /paypal\.com\/sdk|paypal\.Buttons/i },
  { name: 'Paddle',       category: 'Payment',   script: /paddle\.js/i },
  { name: 'Auth0',        category: 'Auth',      html:   /auth0\.com|Auth0Lock/i },
  { name: 'Clerk',        category: 'Auth',      html:   /clerk\.dev|__clerk/i },
  { name: 'Supabase',     category: 'Backend',   html:   /supabase\.co|createClient/i },
  { name: 'Firebase',     category: 'Backend',   html:   /firebase(?:app|auth|store)\.js|firebaseapp\.com/i },

  // ── Chat / Support ───────────────────────────────────────────────
  { name: 'Intercom',     category: 'Marketing', html:   /intercom\.io|Intercom\(/i },
  { name: 'Zendesk',      category: 'Marketing', html:   /zendesk\.com|zopim/i },
  { name: 'HubSpot',      category: 'Marketing', html:   /hs-scripts\.com|_hsp\.push/i },
  { name: 'Crisp',        category: 'Marketing', html:   /crisp\.chat|CRISP_WEBSITE_ID/i },
];

@Injectable()
export class TechAnalyzer {
  async analyze(html: string, headers: Record<string, string>): Promise<TechStack[]> {
    const $ = cheerio.load(html);
    const found = new Map<string, TechStack>();

    const addTech = (rule: Rule) => {
      if (!found.has(rule.name)) {
        found.set(rule.name, { name: rule.name, category: rule.category });
      }
    };

    // Collect data once
    const scriptSrcs = $('script[src]').map((_, el) => $(el).attr('src') || '').get().join('\n');
    const linkHrefs  = $('link[rel="stylesheet"]').map((_, el) => $(el).attr('href') || '').get().join('\n');
    const fullHtml   = html;

    for (const rule of RULES) {
      if (rule.html    && rule.html.test(fullHtml))                                         { addTech(rule); continue; }
      if (rule.script  && rule.script.test(scriptSrcs))                                     { addTech(rule); continue; }
      if (rule.link    && rule.link.test(linkHrefs))                                         { addTech(rule); continue; }
      if (rule.header) {
        const val = headers[rule.header.name.toLowerCase()];
        if (val && rule.header.pattern.test(val))                                            { addTech(rule); continue; }
      }
      if (rule.meta) {
        const content = $(`meta[name="${rule.meta.name}"]`).attr('content') || '';
        if (rule.meta.pattern.test(content))                                                 { addTech(rule); continue; }
      }
    }

    return Array.from(found.values());
  }
}
