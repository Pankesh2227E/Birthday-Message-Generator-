/**
 * Multi-Page Application (MPA) HTML Generators for SEO, Google Search Console, and Google AdSense
 */

function baseLayout({
  title,
  description,
  canonicalUrl,
  content,
  jsonLd,
  isNoIndex = false,
}: {
  title: string;
  description: string;
  canonicalUrl: string;
  content: string;
  jsonLd?: object;
  isNoIndex?: boolean;
}): string {
  const robotsMeta = isNoIndex 
    ? '<meta name="robots" content="noindex, nofollow">'
    : '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-M1NR3GVTTS"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-M1NR3GVTTS');
  </script>
  <title>${title}</title>
  <meta name="description" content="${description}">
  ${robotsMeta}
  <link rel="canonical" href="${canonicalUrl}">

  <!-- OpenGraph Social Cards -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:site_name" content="Birthday Surprise">
  <meta property="og:image" content="https://res.cloudinary.com/zxgbxh38/image/upload/w_1200,h_630,c_fill/v1791811363/birthday_surprise/official_user_birthday_cake.jpg">

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="https://res.cloudinary.com/zxgbxh38/image/upload/w_1200,h_630,c_fill/v1791811363/birthday_surprise/official_user_birthday_cake.jpg">

  <!-- Favicons & Icons (Optimized for Google Search 48px multiple & Safari iOS) -->
  <link rel="icon" href="/favicon.ico?v=2" sizes="48x48">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=2">
  <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png?v=2">
  <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png?v=2">
  <link rel="icon" type="image/png" sizes="144x144" href="/favicon-144x144.png?v=2">
  <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png?v=2">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=2">
  <link rel="apple-touch-icon-precomposed" sizes="180x180" href="/apple-touch-icon-precomposed.png?v=2">
  <link rel="manifest" href="/site.webmanifest?v=2">
  <meta name="apple-mobile-web-app-title" content="Birthday Surprise">
  <meta name="theme-color" content="#ec4899">

  ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}

  <style>
    :root {
      --bg: #09090b;
      --surface: #18181b;
      --surface-border: rgba(255, 255, 255, 0.1);
      --primary: #d946ef;
      --primary-hover: #c026d3;
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.7;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    a {
      color: var(--primary);
      text-decoration: none;
      transition: color 0.2s;
    }
    a:hover {
      color: var(--primary-hover);
      text-decoration: underline;
    }
    .header {
      border-bottom: 1px solid var(--surface-border);
      padding: 1.25rem 2rem;
      background: rgba(9, 9, 11, 0.8);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 50;
    }
    .header-inner {
      max-width: 1000px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-family: Georgia, serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary);
      text-decoration: none !important;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .nav-links {
      display: flex;
      gap: 1.5rem;
      font-size: 0.875rem;
      list-style: none;
    }
    .nav-links a {
      color: var(--text-muted);
    }
    .nav-links a:hover, .nav-links a.active {
      color: #ffffff;
      text-decoration: none;
    }
    .btn-create {
      background: var(--primary);
      color: #ffffff !important;
      padding: 0.5rem 1.25rem;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 0.875rem;
      text-decoration: none !important;
      transition: background 0.2s, transform 0.1s;
      display: inline-block;
    }
    .btn-create:hover {
      background: var(--primary-hover);
      transform: translateY(-1px);
    }
    .main {
      flex: 1;
      max-width: 900px;
      margin: 0 auto;
      padding: 3.5rem 1.5rem;
      width: 100%;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 1.5rem;
      padding: 2.5rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }
    h1 {
      font-family: Georgia, serif;
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
      color: #ffffff;
      letter-spacing: -0.02em;
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 1.1rem;
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--surface-border);
      padding-bottom: 1.5rem;
    }
    h2 {
      font-family: Georgia, serif;
      font-size: 1.5rem;
      color: var(--primary);
      margin-top: 2rem;
      margin-bottom: 0.75rem;
    }
    h3 {
      font-size: 1.15rem;
      color: #ffffff;
      margin-top: 1.25rem;
      margin-bottom: 0.5rem;
    }
    p, li {
      color: #d4d4d8;
      margin-bottom: 1rem;
      font-size: 1rem;
    }
    ul, ol {
      margin-left: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .privacy-badge {
      background: rgba(217, 70, 239, 0.1);
      border: 1px solid rgba(217, 70, 239, 0.25);
      border-radius: 1rem;
      padding: 1.25rem;
      margin: 1.5rem 0;
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }
    .privacy-badge-icon {
      font-size: 1.75rem;
    }
    .privacy-badge-text h4 {
      color: var(--primary);
      font-size: 1.05rem;
      margin-bottom: 0.25rem;
    }
    .privacy-badge-text p {
      margin: 0;
      font-size: 0.9rem;
      color: #e4e4e7;
    }
    .contact-form {
      display: grid;
      gap: 1.25rem;
      margin-top: 1.5rem;
    }
    .form-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .form-group input, .form-group textarea {
      width: 100%;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--surface-border);
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      color: #ffffff;
      font-size: 1rem;
      font-family: inherit;
    }
    .form-group input:focus, .form-group textarea:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(217, 70, 239, 0.2);
    }
    .footer {
      border-top: 1px solid var(--surface-border);
      background: #09090b;
      padding: 3rem 1.5rem;
      margin-top: auto;
    }
    .footer-inner {
      max-width: 1000px;
      margin: 0 auto;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 2rem;
    }
    .footer-brand p {
      color: var(--text-muted);
      font-size: 0.875rem;
      max-width: 300px;
      margin-top: 0.5rem;
    }
    .footer-links {
      display: flex;
      gap: 3rem;
    }
    .footer-col h5 {
      color: #ffffff;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
    }
    .footer-col ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .footer-col li {
      margin-bottom: 0.5rem;
    }
    .footer-col a {
      color: var(--text-muted);
      font-size: 0.875rem;
    }
    .footer-col a:hover {
      color: #ffffff;
      text-decoration: none;
    }
    .footer-bottom {
      max-width: 1000px;
      margin: 2rem auto 0;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--text-muted);
      font-size: 0.8rem;
    }
    @media (max-width: 768px) {
      .header-inner {
        flex-direction: column;
        gap: 1rem;
      }
      .nav-links {
        flex-wrap: wrap;
        justify-content: center;
      }
      .card {
        padding: 1.75rem;
      }
      h1 {
        font-size: 2rem;
      }
      .footer-inner {
        flex-direction: column;
      }
      .footer-links {
        flex-direction: column;
        gap: 1.5rem;
      }
    }
  </style>
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <a href="/" class="logo">✨ Birthday Surprise</a>
      <ul class="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/about-us">About Us</a></li>
        <li><a href="/privacy-policy">Privacy Policy</a></li>
        <li><a href="/terms-and-conditions">Terms & Conditions</a></li>
        <li><a href="/contact-us">Contact Us</a></li>
      </ul>
      <a href="/" class="btn-create">Create Surprise ✨</a>
    </div>
  </header>

  <main class="main">
    <article class="card">
      ${content}
    </article>
  </main>

  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="logo">✨ Birthday Surprise</div>
        <p>Creating unforgettable, private cinematic birthday journeys with personalized stories, photos, and animated cakes.</p>
        <p style="margin-top: 0.75rem; font-size: 0.8rem; color: #a1a1aa;">
          🛡️ <strong>2-Day Privacy Guarantee:</strong> All personal photos, messages, and dates automatically delete 48 hours after the birthday.
        </p>
      </div>
      <div class="footer-links">
        <div class="footer-col">
          <h5>Company</h5>
          <ul>
            <li><a href="/about-us">About Us</a></li>
            <li><a href="/contact-us">Contact Us</a></li>
            <li><a href="/">Create Surprise</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h5>Legal & Privacy</h5>
          <ul>
            <li><a href="/privacy-policy">Privacy Policy</a></li>
            <li><a href="/terms-and-conditions">Terms & Conditions</a></li>
            <li><a href="/sitemap.xml">Sitemap</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} Birthday Surprise. All rights reserved.</span>
      <span>Empowering heartfelt celebrations worldwide.</span>
    </div>
  </footer>
</body>
</html>`;
}

const CANONICAL_BASE = 'https://birthdaymessage.cc.cd';

export function renderPrivacyPolicyPage(origin: string, isNoIndex: boolean = false): string {
  const canonicalUrl = `${CANONICAL_BASE}/privacy-policy`;
  const title = "Privacy Policy – Birthday Surprise";
  const description = "Learn how Birthday Surprise protects your data, our user interaction analytics disclosure, and our strict 2-day automatic data deletion guarantee.";

  const content = `
    <h1>Privacy Policy</h1>
    <p class="subtitle">Effective Date: October 12, 2026 | Last Updated: November 5, 2026</p>

    <div class="privacy-badge">
      <div class="privacy-badge-icon">🛡️</div>
      <div class="privacy-badge-text">
        <h4>Our 48-Hour Automatic Data Deletion Guarantee</h4>
        <p>Your privacy is our core promise. All personal data provided for a birthday surprise—including names, photos, date of birth, messages, and memories—is <strong>automatically and permanently deleted 2 days (48 hours) after the selected birthdate</strong>. No backups or archives are retained.</p>
      </div>
    </div>

    <h2>1. Information We Collect</h2>
    <p>We collect only the minimal data necessary to craft and deliver your personalized birthday celebration:</p>
    <ul>
      <li><strong>Recipient Details:</strong> Name, age, date of birth (DOB), and relationship to the sender.</li>
      <li><strong>Personal Memories:</strong> Stories, how you met, favorite shared memories, personality traits, and hobbies.</li>
      <li><strong>Uploaded Photos:</strong> 3 to 5 photos uploaded by you to create the personalized photo gallery. These images are compressed to a maximum of 300KB each before being stored temporarily on secure cloud infrastructure.</li>
      <li><strong>Personal Notes:</strong> Optional custom messages or birthday notes you choose to include.</li>
      <li><strong>User Movement & Interaction Telemetry:</strong>
        <ul style="margin-top: 0.5rem; margin-bottom: 0.5rem;">
          <li><strong>Link Clicks & Page Visits:</strong> We record when a surprise link is opened by a recipient, including the timestamp and surprise reference, to verify link delivery and show celebration engagement.</li>
          <li><strong>Wizard Step Progression:</strong> When creating a surprise, we log anonymous progress across the creation steps (e.g., reaching Step 1 through Step 8) to understand where users encounter friction or abandon the process.</li>
          <li><strong>Social Sharing Interactions:</strong> We record when users click "Copy Link", WhatsApp, SMS, Instagram, or native share buttons to measure how celebrations are distributed.</li>
          <li><strong>Standard Technical Headers:</strong> IP addresses, browser user-agent strings, and request timestamps are processed temporarily in server logs for rate limiting, DDoS mitigation, and diagnostic error analysis.</li>
        </ul>
      </li>
    </ul>

    <h2>2. How We Use Your Information</h2>
    <p>Your information is used strictly and exclusively to:</p>
    <ul>
      <li>Render the interactive birthday website and 3D keepsake letter for the recipient.</li>
      <li>Generate a personalized, respectful birthday letter if you do not provide your own manual message.</li>
      <li>Provide a unique shareable link for the recipient to experience their birthday celebration.</li>
      <li><strong>Analyze Conversion & Usability:</strong> Track whether shared links are successfully clicked, count total surprises created, measure abandonment rates, and monitor step drop-offs so we can simplify and improve the creation experience.</li>
      <li><strong>Administrative Oversight:</strong> Display high-level aggregate analytics (link clicks, total created, abandonment count, and shares) within our password-protected administrative portal.</li>
    </ul>
    <p><strong>We never sell, rent, monetize, or trade your personal data, photos, memories, or interaction telemetry with third-party advertisers or data brokers.</strong></p>

    <h2>3. Automated Data Deletion & Retention Schedule</h2>
    <p>We practice strict data minimization and zero permanent storage for personal celebration content:</p>
    <ul>
      <li><strong>Automatic 2-Day Deletion:</strong> Exactly 48 hours after the selected birthday date, our automated server task permanently purges all records, photos, and associated links from our database and cloud storage.</li>
      <li><strong>Immediate Expiration:</strong> Once expired, anyone opening the link receives an expiration notice confirming that all private photos and data have been wiped.</li>
      <li><strong>Telemetry Retention:</strong> Aggregated interaction metrics (e.g. total click counts, step completion percentages) contain no personal photos or recipient messages and are retained solely for internal statistical reporting.</li>
    </ul>

    <h2>4. Image Processing & Compression</h2>
    <p>To respect your bandwidth and device resources, every image uploaded to Birthday Surprise is compressed down to 300KB JPEG format before upload. High-resolution raw images are never retained.</p>

    <h2>5. Third-Party Services</h2>
    <p>We work with trusted industry providers under strict privacy terms:</p>
    <ul>
      <li><strong>Cloudinary:</strong> Used for secure temporary image hosting (purged during auto-deletion).</li>
      <li><strong>Cloudflare D1:</strong> Encrypted, serverless database storing temporary surprise metadata.</li>
      <li><strong>Google Analytics (GA4):</strong> Google Analytics (Measurement ID: <code>G-M1NR3GVTTS</code>) is used to monitor website health and aggregate traffic patterns. You may opt out of Google Analytics by using the official <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out Browser Add-on</a>.</li>
      <li><strong>Google AdSense:</strong> Google and its advertising partners may use cookies to serve non-intrusive ads on informational pages based on prior visits to our site or other sites on the Internet. Users may opt out of personalized advertising by visiting Google Ad Settings (<a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">google.com/settings/ads</a>).</li>
    </ul>

    <h2>6. Cookies & Tracking Technologies</h2>
    <p>We use essential cookies strictly necessary for navigation, authentication, and session security. Our interaction tracking (link clicks, wizard step progress, and share actions) is logged directly to our first-party server API. We do not engage in keystroke logging, intrusive screen recording, or cross-site fingerprinting.</p>

    <h2>7. GDPR & CCPA Compliance</h2>
    <p>Under GDPR and CCPA, users have the right to access, delete, or restrict the processing of their data. Because our systems permanently delete all user celebration data 2 days after the birthday, your right to be forgotten is automated by design. For immediate manual deletion or inquiries, email us at <a href="mailto:sahupankesh7@gmail.com">sahupankesh7@gmail.com</a>.</p>

    <h2>8. Contact Our Data Protection Team</h2>
    <p>If you have any questions about this Privacy Policy or wish to request immediate data removal, contact us at:</p>
    <p><strong>Email:</strong> <a href="mailto:sahupankesh7@gmail.com">sahupankesh7@gmail.com</a><br>
    <strong>Website:</strong> <a href="${origin}">Birthday Surprise</a></p>
  `;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": canonicalUrl,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Birthday Surprise",
      "url": CANONICAL_BASE
    }
  };

  return baseLayout({ title, description, canonicalUrl, content, jsonLd, isNoIndex });
}

export function renderTermsPage(origin: string, isNoIndex: boolean = false): string {
  const canonicalUrl = `${CANONICAL_BASE}/terms-and-conditions`;
  const title = "Terms & Conditions – Birthday Surprise";
  const description = "Read the Terms & Conditions governing the use of Birthday Surprise, including user conduct, acceptable use, user interaction telemetry, and our automatic 2-day data deletion policy.";

  const content = `
    <h1>Terms & Conditions</h1>
    <p class="subtitle">Effective Date: October 12, 2026 | Last Updated: November 5, 2026</p>

    <h2>1. Acceptance of Terms</h2>
    <p>By accessing Birthday Surprise, creating a birthday celebration, or opening a shared surprise link, you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree with any part of these terms, please do not use our service.</p>

    <h2>2. Description of Service</h2>
    <p>Birthday Surprise provides an interactive digital platform allowing users to design and share personalized birthday experiences featuring custom notes, memories, curated photo galleries, and celebratory animated cakes accessible via a unique shareable link.</p>

    <h2>3. 48-Hour Automatic Expiration & Deletion Policy</h2>
    <p>You acknowledge and agree that:</p>
    <ul>
      <li>Birthday surprises and all associated user-provided content (photos, recipient names, dates of birth, memories, and personal messages) are temporary by design.</li>
      <li>All personal celebration data is <strong>automatically and permanently deleted 2 days (48 hours) following the selected birthdate</strong>.</li>
      <li>Once deleted, content cannot be recovered, reconstructed, or retrieved. Users are responsible for keeping local copies of any uploaded photos.</li>
    </ul>

    <h2>4. User Interaction Tracking & Analytics Consent</h2>
    <p>To ensure link accessibility, measure service health, and diagnose builder usability, you acknowledge and agree that:</p>
    <ul>
      <li><strong>Click & Access Logging:</strong> When a recipient opens a shared birthday surprise link, our servers log the link click event, timestamp, and celebration identifier.</li>
      <li><strong>Wizard Flow & Drop-off Monitoring:</strong> As you progress through the creation builder, step progression events (such as reaching or completing Step 1 through Step 8) are tracked to calculate completion and abandonment rates.</li>
      <li><strong>Share Action Telemetry:</strong> Clicks on sharing options (such as WhatsApp, SMS, Copy Link, or Instagram) are logged to evaluate distribution channels.</li>
      <li><strong>Administrative Dashboards:</strong> These interaction metrics are aggregated and made accessible exclusively through our password-protected administrative portal for technical monitoring, fraud prevention, and product improvements.</li>
      <li>All interaction tracking operates in strict adherence to our <a href="/privacy-policy">Privacy Policy</a> and is never sold to third parties.</li>
    </ul>

    <h2>5. User Content & Acceptable Use Policy</h2>
    <p>You are solely responsible for all images, text, and information you upload. By uploading content, you represent and warrant that:</p>
    <ul>
      <li>You own or have the explicit legal permission of the individuals depicted to share their photos and personal details.</li>
      <li>You will not upload any content that is illegal, defamatory, obscene, sexually explicit, harassing, hateful, or infringing on any third-party intellectual property or privacy rights.</li>
      <li>We reserve the right to immediately remove or refuse any content violating this policy without notice.</li>
    </ul>

    <h2>6. Image Compression Agreement</h2>
    <p>To optimize bandwidth, site performance, and server storage, you acknowledge that all uploaded images are compressed to a maximum of 300KB JPEG format. Original uncompressed raw files are neither requested nor retained.</p>

    <h2>7. Disclaimer of Warranties</h2>
    <p>Birthday Surprise is provided on an "AS IS" and "AS AVAILABLE" basis. While we strive for high uptime and smooth delivery, we do not guarantee uninterrupted, error-free, or delay-free operation.</p>

    <h2>8. Limitation of Liability</h2>
    <p>To the fullest extent permitted by applicable law, Birthday Surprise and its operators shall not be liable for any indirect, incidental, punitive, or consequential damages arising from the use of or inability to use the service.</p>

    <h2>9. Governing Law & Contact</h2>
    <p>These terms shall be governed by and construed in accordance with applicable laws. If you have questions regarding these Terms & Conditions, please contact us at <a href="mailto:sahupankesh7@gmail.com">sahupankesh7@gmail.com</a>.</p>
  `;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": canonicalUrl,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Birthday Surprise",
      "url": CANONICAL_BASE
    }
  };

  return baseLayout({ title, description, canonicalUrl, content, jsonLd, isNoIndex });
}

export function renderAboutPage(origin: string, isNoIndex: boolean = false): string {
  const canonicalUrl = `${CANONICAL_BASE}/about-us`;
  const title = "About Us – Birthday Surprise";
  const description = "Discover how Birthday Surprise transforms simple memories into cinematic, heartfelt digital celebrations designed with privacy at the core.";

  const content = `
    <h1>About Us</h1>
    <p class="subtitle">Turning cherished memories into unforgettable digital celebrations.</p>

    <h2>Our Mission</h2>
    <p>Every birthday is a milestone in someone's life, but generic greeting cards and text messages often fail to capture the depth of real relationships. <strong>Birthday Surprise</strong> was created with a simple mission: to give friends, couples, and families an effortless way to create deeply emotional, personalized birthday journeys that feel like private, cinematic movies.</p>

    <h2>How It Works</h2>
    <ol>
      <li><strong>Share What Matters:</strong> You share a few meaningful details—how you met, favorite shared memories, quirks you love, and 3 to 5 favorite photos.</li>
      <li><strong>Cinematic Assembly:</strong> Our platform weaves those memories together with ambient music, interactive lighting of the birthday candle, and personalized messages.</li>
      <li><strong>One Shareable Link:</strong> You receive a single, beautiful link to send to the birthday person. When they open it, they embark on an immersive celebration crafted just for them.</li>
    </ol>

    <h2>Privacy-First Architecture</h2>
    <p>We believe special personal moments should remain strictly personal. That is why Birthday Surprise was built with an uncompromising <strong>48-Hour Auto-Deletion Guarantee</strong>:</p>
    <ul>
      <li>Every photo, story, name, and message is automatically and irrevocably deleted 2 days after the birthday date.</li>
      <li>We do not build advertising profiles on recipients or monetize private memories.</li>
      <li>Images are automatically compressed to 300KB JPEG files to minimize data footprint and load instantly even on mobile cellular networks.</li>
    </ul>

    <h2>Our Values</h2>
    <ul>
      <li><strong>Heartfelt Authenticity:</strong> When you provide your own words, our AI stands aside—your authentic words take center stage.</li>
      <li><strong>Delightful Craft:</strong> From floating confetti to glowing candles and gentle ambient transitions, every detail is crafted for genuine joy.</li>
      <li><strong>Total Accessibility:</strong> Works flawlessly on mobile phones, tablets, and desktops with zero app installations required.</li>
    </ul>

    <h2>Get in Touch</h2>
    <p>We are always eager to hear feedback, feature ideas, and stories of celebrations created using Birthday Surprise. Reach out anytime at <a href="mailto:sahupankesh7@gmail.com">sahupankesh7@gmail.com</a> or visit our <a href="/contact-us">Contact Page</a>.</p>
  `;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": title,
    "description": description,
    "url": canonicalUrl,
    "mainEntity": {
      "@type": "Organization",
      "name": "Birthday Surprise",
      "url": CANONICAL_BASE,
      "email": "sahupankesh7@gmail.com"
    }
  };

  return baseLayout({ title, description, canonicalUrl, content, jsonLd, isNoIndex });
}

export function renderContactPage(origin: string, isNoIndex: boolean = false): string {
  const canonicalUrl = `${CANONICAL_BASE}/contact-us`;
  const title = "Contact Us – Birthday Surprise";
  const description = "Have questions, feedback, or need data assistance? Contact the Birthday Surprise support team directly.";

  const content = `
    <h1>Contact Us</h1>
    <p class="subtitle">We're here to help make every birthday celebration unforgettable.</p>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 2rem; margin-top: 1.5rem;">
      <div>
        <h2>Get in Touch Directly</h2>
        <p>Whether you have a question about how the service works, a feature suggestion, partnership inquiry, or need manual data deletion assistance before the 48-hour auto-deletion window, our team is ready to assist you.</p>

        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem; padding: 1.5rem; margin-top: 1.5rem;">
          <h3 style="color: var(--primary); margin-top: 0;">Support Email</h3>
          <p style="margin-bottom: 0.5rem;"><a href="mailto:sahupankesh7@gmail.com" style="font-size: 1.1rem; font-weight: 600;">sahupankesh7@gmail.com</a></p>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">Typical response time: Within 24 hours</p>
        </div>

        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem; padding: 1.5rem; margin-top: 1rem;">
          <h3 style="color: var(--primary); margin-top: 0;">🛡️ Privacy & Data Removal</h3>
          <p style="font-size: 0.9rem; margin: 0; color: #d4d4d8;">All surprise data is automatically purged 2 days after the birthday. If you require immediate data removal prior to that, email us with your surprise link and we will permanently delete it immediately.</p>
        </div>
      </div>

      <div>
        <h2>Send Us a Message</h2>
        <form class="contact-form" action="/api/contact" method="POST" id="contactForm">
          <div class="form-group">
            <label for="name">Your Name</label>
            <input type="text" id="name" name="name" required placeholder="Enter your name">
          </div>
          <div class="form-group">
            <label for="email">Your Email Address</label>
            <input type="email" id="email" name="email" required placeholder="name@example.com">
          </div>
          <div class="form-group">
            <label for="subject">Subject</label>
            <input type="text" id="subject" name="subject" required placeholder="What is your message regarding?">
          </div>
          <div class="form-group">
            <label for="message">Your Message</label>
            <textarea id="message" name="message" rows="5" required placeholder="Write your question or feedback here..."></textarea>
          </div>
          <button type="submit" class="btn-create" style="border: none; cursor: pointer; padding: 0.85rem 1.5rem; font-size: 1rem;">
            Send Message ✉️
          </button>
          <div id="formStatus" style="font-size: 0.9rem; margin-top: 0.5rem; display: none;"></div>
        </form>
      </div>
    </div>

    <script>
      const form = document.getElementById('contactForm');
      const statusDiv = document.getElementById('formStatus');
      if (form) {
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          statusDiv.style.display = 'block';
          statusDiv.style.color = '#a1a1aa';
          statusDiv.innerText = 'Sending your message...';
          
          try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            const res = await fetch('/api/contact', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok && result.success) {
              statusDiv.style.color = '#4ade80';
              statusDiv.innerText = '✓ Thank you! Your message has been received. We will get back to you shortly.';
              form.reset();
            } else {
              throw new Error(result.error || 'Failed to send message');
            }
          } catch (err) {
            statusDiv.style.color = '#f87171';
            statusDiv.innerText = 'Error sending message. Please email us directly at sahupankesh7@gmail.com';
          }
        });
      }
    </script>
  `;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": title,
    "description": description,
    "url": canonicalUrl,
    "mainEntity": {
      "@type": "Organization",
      "name": "Birthday Surprise",
      "email": "sahupankesh7@gmail.com"
    }
  };

  return baseLayout({ title, description, canonicalUrl, content, jsonLd, isNoIndex });
}

export function renderSitemapXml(origin: string): string {
  const currentDate = new Date().toISOString().split('T')[0];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${CANONICAL_BASE}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${CANONICAL_BASE}/about-us</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${CANONICAL_BASE}/contact-us</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${CANONICAL_BASE}/privacy-policy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${CANONICAL_BASE}/terms-and-conditions</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;
}

export function renderRobotsTxt(origin: string, isRenderHost: boolean = false): string {
  if (isRenderHost) {
    return `User-agent: *
Disallow: /
`;
  }

  return `User-agent: Googlebot
Allow: /
Disallow: /api/
Disallow: /surprise/
Disallow: /uploads/
Disallow: /s/

User-agent: Mediapartners-Google
Allow: /

User-agent: AdsBot-Google
Allow: /

User-agent: *
Allow: /
Disallow: /api/
Disallow: /surprise/
Disallow: /uploads/
Disallow: /s/

Sitemap: ${CANONICAL_BASE}/sitemap.xml
`;
}
