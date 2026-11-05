import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import multer from 'multer';
import sharp from 'sharp';
import { openRouterService } from './server/services/openrouter';
import { pollinationsService } from './server/services/pollinations';
import { cloudinaryService, cloudinary } from './server/services/cloudinary';
import { d1Service } from './server/services/d1';
import { calculateExpiryTimestamp, isSurpriseExpired, purgeSurprise, startAutoDeleteWorker } from './server/services/autoDelete';
import { renderPrivacyPolicyPage, renderTermsPage, renderAboutPage, renderContactPage, renderSitemapXml, renderRobotsTxt } from './server/mpaPages';
import { analyticsService } from './server/services/analytics';
import crypto from 'crypto';

dotenv.config();

// Initialize Cloudinary once
cloudinaryService.configure();

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  const PORT = Number(process.env.PORT) || 3000;
  const CANONICAL_HOST = 'birthdaymessage.cc.cd';
  const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;

  function getOrigin(req: express.Request): string {
    const forwardedProto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim();
    const host = req.get('host') || CANONICAL_HOST;
    const isLocal = host.startsWith('localhost') || host.startsWith('127.0.0.1');
    const protocol = forwardedProto || (isLocal ? req.protocol : 'https');
    return `${protocol}://${host}`;
  }

  // --- SEO & Duplicate Content Prevention Middleware ---
  // If request arrives at Render subdomain (e.g. *.onrender.com), prevent search indexing & 301 redirect to primary domain
  app.use((req, res, next) => {
    const host = (req.get('host') || '').toLowerCase();
    const isRenderHost = host.includes('.onrender.com');

    if (isRenderHost) {
      // 1. Set HTTP response header to forbid search engine indexing
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');

      // 2. Safely 301 redirect all visitors and web crawlers to the primary canonical domain (excluding health check)
      if (!req.path.startsWith('/api')) {
        return res.redirect(301, `${CANONICAL_ORIGIN}${req.originalUrl}`);
      }
    }
    next();
  });

  // Ensure local uploads directory exists and is served statically
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  app.use(express.json({ limit: '50mb' }));

  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { 
      fileSize: 50 * 1024 * 1024, // 50MB limit (compressed to <= 300KB before Cloudinary)
      files: 1
    }
  });

  // API Routes
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Diagnostic route for Cloudinary
  app.get('/api/debug/cloudinary', (req, res) => {
    const cloudNameEnv = process.env.CLOUDINARY_CLOUD_NAME || null;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || null;

    const apiKeyPresent = Boolean(apiKey && apiKey.trim().length > 0);
    const apiSecretPresent = Boolean(apiSecret && apiSecret.trim().length > 0);

    // Perform a cloudinary.config() test to see what the SDK is actually configured with
    const activeConfig = cloudinary.config();

    // Log the states without exposing secret values
    console.log('[DEBUG-CLOUDINARY] process.env.CLOUDINARY_CLOUD_NAME:', cloudNameEnv);
    console.log(`[DEBUG-CLOUDINARY] process.env.CLOUDINARY_API_KEY: ${apiKeyPresent ? 'PRESENT' : 'MISSING'}${apiKeyPresent ? ` (length: ${apiKey!.length})` : ''}`);
    console.log(`[DEBUG-CLOUDINARY] process.env.CLOUDINARY_API_SECRET: ${apiSecretPresent ? 'PRESENT' : 'MISSING'}${apiSecretPresent ? ` (length: ${apiSecret!.length})` : ''}`);
    console.log('[DEBUG-CLOUDINARY] process.env.CLOUDINARY_UPLOAD_PRESET:', uploadPreset);
    console.log('[DEBUG-CLOUDINARY] cloudinary.config().cloud_name:', activeConfig.cloud_name || null);

    res.json({
      success: true,
      env: {
        CLOUDINARY_CLOUD_NAME: cloudNameEnv,
        CLOUDINARY_API_KEY: apiKeyPresent ? 'PRESENT' : 'MISSING',
        CLOUDINARY_API_SECRET: apiSecretPresent ? 'PRESENT' : 'MISSING',
        CLOUDINARY_UPLOAD_PRESET: uploadPreset
      },
      cloudinary_config: {
        cloud_name: activeConfig.cloud_name || null,
        api_key_configured: Boolean(activeConfig.api_key),
        api_secret_configured: Boolean(activeConfig.api_secret),
        secure: Boolean(activeConfig.secure)
      }
    });
  });

  // Simple image upload for the wizard
  app.post('/api/upload', (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    upload.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, error: 'Image exceeds the maximum allowed size (50MB).' });
        }
        return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(500).json({ success: false, error: err.message || 'Upload middleware error' });
      }
      next();
    });
  }, async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    console.log('[UPLOAD] Request started');
    try {
      if (!req.file) {
        console.error('[UPLOAD] No file found in request');
        return res.status(400).json({ success: false, error: 'No file found in request' });
      }

      console.log(`[UPLOAD] File received: ${req.file.originalname}`);
      console.log(`[UPLOAD] Size: ${req.file.size} bytes`);
      console.log(`[UPLOAD] Type: ${req.file.mimetype}`);

      // Robust image validation: check MIME, common extensions, or image/*
      const isImageMime = (req.file.mimetype && req.file.mimetype.startsWith('image/')) ||
        ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'image/gif', 'image/avif', 'image/x-heic', 'image/heic-sequence'].includes(req.file.mimetype);
      const isImageExtension = /\.(jpe?g|png|webp|heic|heif|gif|avif|bmp|tiff)$/i.test(req.file.originalname || '');

      if (!isImageMime && !isImageExtension) {
        return res.status(400).json({ success: false, error: 'Unsupported file type. Please upload an image (JPG, PNG, WEBP, or HEIC).' });
      }

      const publicId = (req.body?.publicId || `upload_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '_');
      const MAX_BYTES = 300 * 1024; // 300 KB limit
      let bufferToUpload = req.file.buffer;

      // Always normalize through Sharp (handles HEIC, large camera photos, auto-orients EXIF, and compresses safely)
      const isGif = req.file.mimetype === 'image/gif' || (req.file.originalname && req.file.originalname.toLowerCase().endsWith('.gif'));
      if (!isGif) {
        try {
          console.log(`[COMPRESSOR] Processing ${req.file.originalname} (${req.file.size} bytes)...`);
          let compressed = await sharp(req.file.buffer)
            .rotate() // Auto-orient based on camera EXIF orientation
            .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer();

          if (compressed.length > MAX_BYTES) {
            compressed = await sharp(compressed)
              .resize(1280, 1280, { fit: 'inside', withoutEnlargement: true })
              .jpeg({ quality: 70 })
              .toBuffer();
          }

          console.log(`[COMPRESSOR] Success: ${req.file.size}B -> ${compressed.length}B`);
          bufferToUpload = compressed;
        } catch (compErr: any) {
          console.warn('[COMPRESSOR] Sharp processing warning, falling back to original buffer:', compErr.message);
        }
      } else {
        console.log(`[COMPRESSOR] Preserving GIF as-is (${req.file.size} bytes)`);
      }

      let imageUrl: string | null = null;
      let finalPublicId = publicId;

      // 1. Try Cloudinary upload if configured (with 5-second timeout in uploadBuffer)
      try {
        if (process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_CLOUD_NAME) {
          console.log(`[UPLOAD] HANDOFF: Passing buffer to Cloudinary service (${bufferToUpload.length} bytes)`);
          const result = await cloudinaryService.uploadBuffer(bufferToUpload, publicId, 5000);
          if (result && result.secure_url) {
            imageUrl = result.secure_url;
            finalPublicId = result.public_id;
            console.log(`[UPLOAD] Cloudinary success: ${imageUrl}`);
          }
        }
      } catch (cloudErr: any) {
        console.warn(`[UPLOAD] Cloudinary upload warning: ${cloudErr.message}. Falling back to local storage.`);
      }

      // 2. Fallback to resilient local storage if Cloudinary fails or is unavailable
      if (!imageUrl) {
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const ext = isGif ? 'gif' : 'jpg';
        const filename = `${publicId}.${ext}`;
        const filePath = path.join(uploadDir, filename);
        fs.writeFileSync(filePath, bufferToUpload);
        imageUrl = `/uploads/${filename}`;
        console.log(`[UPLOAD] Stored locally as fallback: ${imageUrl}`);
      }

      return res.status(200).json({ 
        success: true, 
        url: imageUrl, 
        publicId: finalPublicId 
      });
    } catch (error: any) {
      console.error(`[UPLOAD] Error in pipeline: ${error.message}`);
      return res.status(500).json({ 
        success: false, 
        error: error.message || 'Internal server error during upload' 
      });
    }
  });

  // Global Error Handler for API routes to ensure JSON responses
  app.use('/api', (err: any, req: any, res: any, next: any) => {
    console.error('[API ERROR HANDLER]', err);
    res.status(err.status || 500).json({
      success: false,
      error: err.message || 'An unexpected error occurred'
    });
  });

  // Test Cloudinary endpoint
  app.get('/api/test-cloudinary', async (req, res) => {
    try {
      console.log('[CLOUDINARY-TEST] Started');
      // Simple transparent pixel
      const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
      const result = await cloudinaryService.uploadImage(testImage, `test_${Date.now()}`);
      res.json({ success: true, url: result.secure_url });
    } catch (error: any) {
      console.error('[CLOUDINARY-TEST] Failed:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create surprise (The Generation Pipeline)
  app.post('/api/surprises', async (req, res) => {
    const surpriseId = Math.random().toString(36).substring(2, 15);
    const { data } = req.body;
    
    // Auto-delete calculation: 2 days after the selected birthdate
    const expiresAt = calculateExpiryTimestamp(data?.dob);
    console.log(`[PIPELINE] Surprise ${surpriseId} scheduled for auto-deletion at: ${new Date(expiresAt).toISOString()} (2 days after DOB: ${data?.dob || 'N/A'})`);

    // Initial status
    const initialData = { 
      ...data, 
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
      status: 'generating',
      progress: 'Initializing...',
      stage: 1
    };
    
    try {
      await d1Service.createSurprise(surpriseId, initialData);
      
      // Start the pipeline in background
      (async () => {
        try {
          // Check if user manually entered their birthday message (Requirement 5)
          const hasManualMessage = Boolean(data.personalMessage && data.personalMessage.trim().length > 0);
          let aiContent: any;

          if (hasManualMessage) {
            console.log(`[PIPELINE] Creator provided manual message ("${data.personalMessage.trim().substring(0, 30)}..."). AI TRIGGER SKIPPED.`);
            await d1Service.updateSurprise(surpriseId, { 
              ...initialData, 
              progress: 'Preparing your personal message...', 
              stage: 2 
            });
            aiContent = {
              intro: `A birthday celebration crafted with love for ${data.recipientName} ✨`,
              birthday_message: data.personalMessage.trim(),
              memory_captions: (data.memories || []).map((_: any, i: number) => `Cherished memory #${i + 1}`),
              things_i_love: Array.isArray(data.things_i_love) && data.things_i_love.filter((t: string) => t && t.trim().length > 0).length > 0
                ? data.things_i_love.filter((t: string) => t && t.trim().length > 0)
                : [
                    `Your contagious smile and positive energy`,
                    `Your unwavering loyalty and support`,
                    `Every single memory and adventure we share`
                  ],
              final_message: `Wishing you the happiest birthday! ❤️`
            };
          } else {
            // 2. OpenRouter: Generate AI content
            console.log(`[PIPELINE] Step 2: OpenRouter AI for ${surpriseId}`);
            await d1Service.updateSurprise(surpriseId, { ...initialData, progress: 'Writing something special...', stage: 2 });
            try {
              aiContent = await openRouterService.generateBirthdayContent(data);
            } catch (aiErr: any) {
              console.warn(`[PIPELINE] AI generation error for ${surpriseId}:`, aiErr.message);
              throw new Error('AI is unavailable at this time. Please write your birthday message manually or use any chatbot like Gemini or ChatGPT.');
            }
          }
          
          // 3. Birthday Cake (User custom animated GIF)
          console.log(`[PIPELINE] Step 3: Birthday Cake for ${surpriseId}`);
          await d1Service.updateSurprise(surpriseId, { ...initialData, ...aiContent, progress: 'Preparing birthday cake...', stage: 3 });
          
          const OFFICIAL_CAKE_GIF = 'https://res.cloudinary.com/zxgbxh38/image/upload/w_400,c_scale,fl_lossy/v1791811363/birthday_surprise/official_user_birthday_cake.gif';
          let resolvedCakeUrl = data?.cakeUrl || OFFICIAL_CAKE_GIF;
          
          // 4. Finalizing Cake
          console.log(`[PIPELINE] Step 4: Finalizing Cake for ${surpriseId}`);
          await d1Service.updateSurprise(surpriseId, { ...initialData, ...aiContent, cakeUrl: resolvedCakeUrl, progress: 'Finalizing cake...', stage: 4 });
          
          // 5. Cloudinary: Upload memories if they are still base64
          console.log(`[PIPELINE] Step 5: Cloudinary Memories for ${surpriseId}`);
          await d1Service.updateSurprise(surpriseId, { 
            ...initialData, 
            ...aiContent, 
            cakeUrl: resolvedCakeUrl, 
            progress: 'Putting everything together...', 
            stage: 5 
          });

          const uploadedMemories = await Promise.all(
            (data.memories || []).map(async (m: any, i: number) => {
              if (m.url.startsWith('data:')) {
                const uploaded = await cloudinaryService.uploadImage(m.url, `memory_${surpriseId}_${i}`);
                return { ...m, url: uploaded.secure_url, publicId: uploaded.public_id };
              }
              return m;
            })
          );

          const customThings = Array.isArray(data.things_i_love) && data.things_i_love.filter((t: string) => t && t.trim().length > 0).length > 0
            ? data.things_i_love.filter((t: string) => t && t.trim().length > 0)
            : (aiContent.things_i_love || [
                `Your contagious smile and positive energy`,
                `Your unwavering loyalty and support`,
                `Every single memory and adventure we share`
              ]);

          const finalMemories = uploadedMemories.map((m: any, idx: number) => ({
            ...m,
            caption: m.caption?.trim() || aiContent.memory_captions?.[idx] || undefined,
            hiddenMessage: m.hiddenMessage?.trim() || undefined
          }));

          // 6. Update D1 with final content
          console.log(`[PIPELINE] Step 6: Final Update for ${surpriseId}`);
          const finalData = {
            ...data,
            ...aiContent,
            things_i_love: customThings,
            cakeUrl: resolvedCakeUrl,
            memories: finalMemories,
            expires_at: expiresAt,
            status: 'ready',
            progress: 'Ready!',
            stage: 6
          };
          
          await d1Service.updateSurprise(surpriseId, finalData);
          console.log(`[PIPELINE] COMPLETE for ${surpriseId}`);
        } catch (error: any) {
          console.error(`[PIPELINE] ASYNC FAILED for ${surpriseId}:`, error);
          const userFacingError = error.message?.includes('AI is unavailable')
            ? error.message
            : 'AI is unavailable at this time. Please write your birthday message manually or use any chatbot like Gemini or ChatGPT.';
          await d1Service.updateSurprise(surpriseId, { 
            status: 'failed', 
            error: userFacingError,
            progress: userFacingError
          });
        }
      })();

      // Track surprise creation in analytics
      analyticsService.trackSurpriseCreated(surpriseId, data?.recipientName);

      res.json({ id: surpriseId, status: 'generating' });
    } catch (error: any) {
      console.error(`[PIPELINE] INITIAL FAILED for ${surpriseId}:`, error);
      res.status(500).json({ error: error.message || 'Initialization failed' });
    }
  });

  // Get surprise data with 2-day birthday auto-deletion check (Requirement 1)
  app.get('/api/surprises/:id', async (req, res) => {
    try {
      const surprise = await d1Service.getSurprise(req.params.id);
      if (!surprise) return res.status(404).json({ error: 'Not found' });

      // Track link click in analytics
      analyticsService.trackLinkClick(req.params.id, surprise.recipientName);

      // Check if surprise has expired (2 days after selected birthdate)
      if (isSurpriseExpired(surprise)) {
        console.log(`[AUTO-DELETE] Surprise ${req.params.id} has expired (DOB: ${surprise.dob}). Purging all data...`);
        await purgeSurprise(req.params.id, surprise);
        return res.status(410).json({ 
          status: 'expired', 
          recipientName: surprise.recipientName || 'Friend',
          error: 'This birthday surprise has expired. In accordance with our privacy policy, all personal photos, memories, and details were permanently deleted 2 days after the birthday.' 
        });
      }

      res.json(surprise);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // --- Analytics Tracking API ---
  app.post('/api/analytics/track', (req, res) => {
    const { event, details } = req.body || {};
    try {
      if (event === 'link_click') {
        analyticsService.trackLinkClick(details?.surpriseId, details?.recipientName);
      } else if (event === 'wizard_start') {
        analyticsService.trackWizardStart();
      } else if (event === 'wizard_step') {
        analyticsService.trackWizardStep(Number(details?.step) || 1);
      } else if (event === 'surprise_shared') {
        analyticsService.trackSurpriseShared(details?.surpriseId, details?.platform);
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Admin Authentication & Dashboard APIs ---
  const getAdminToken = () => {
    const secret = process.env.ADMIN_PASSWORD || 'admin123';
    return crypto.createHash('sha256').update(`admin_salt_${secret}`).digest('hex');
  };

  const verifyAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.replace(/^Bearer\s+/i, '') || req.query.token;
    const expectedToken = getAdminToken();

    if (!token || token !== expectedToken) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or missing admin credentials' });
    }
    next();
  };

  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body || {};
    const configuredPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Password is required' });
    }

    if (password === configuredPassword) {
      const token = getAdminToken();
      return res.json({ 
        success: true, 
        token, 
        message: 'Admin authenticated successfully',
        configured: Boolean(process.env.ADMIN_PASSWORD)
      });
    }

    return res.status(401).json({ success: false, error: 'Incorrect admin password' });
  });

  app.get('/api/admin/stats', verifyAdmin, async (req, res) => {
    try {
      const stats = analyticsService.getStats();
      
      // Optionally fetch recent surprises from D1
      let recentSurprises: any[] = [];
      try {
        recentSurprises = await d1Service.getAllSurprises();
      } catch (d1Err) {
        // Fallback gracefully if D1 is not populated
      }

      res.json({
        success: true,
        stats,
        surprisesCount: recentSurprises.length || stats.surprisesCreated,
        recentSurprises: recentSurprises.slice(0, 20),
        envInfo: {
          nodeEnv: process.env.NODE_ENV || 'development',
          passwordConfigured: Boolean(process.env.ADMIN_PASSWORD),
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post('/api/admin/reset', verifyAdmin, (req, res) => {
    const reset = analyticsService.resetStats();
    res.json({ success: true, stats: reset });
  });

  // --- Multi-Page Application (MPA) Routes for SEO, Privacy, and AdSense ---
  app.get('/privacy-policy', (req, res) => {
    const origin = getOrigin(req);
    const host = (req.get('host') || '').toLowerCase();
    const isRender = host.includes('.onrender.com');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderPrivacyPolicyPage(origin, isRender));
  });

  app.get('/terms-and-conditions', (req, res) => {
    const origin = getOrigin(req);
    const host = (req.get('host') || '').toLowerCase();
    const isRender = host.includes('.onrender.com');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderTermsPage(origin, isRender));
  });

  app.get('/about-us', (req, res) => {
    const origin = getOrigin(req);
    const host = (req.get('host') || '').toLowerCase();
    const isRender = host.includes('.onrender.com');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderAboutPage(origin, isRender));
  });

  app.get('/contact-us', (req, res) => {
    const origin = getOrigin(req);
    const host = (req.get('host') || '').toLowerCase();
    const isRender = host.includes('.onrender.com');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderContactPage(origin, isRender));
  });

  app.post('/api/contact', express.json(), (req, res) => {
    console.log('[CONTACT MESSAGE RECEIVED]', req.body);
    res.json({ success: true, message: 'Message received successfully!' });
  });

  app.get('/sitemap.xml', (req, res) => {
    const origin = getOrigin(req);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(renderSitemapXml(origin));
  });

  app.get('/robots.txt', (req, res) => {
    const origin = getOrigin(req);
    const host = (req.get('host') || '').toLowerCase();
    const isRender = host.includes('.onrender.com');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(renderRobotsTxt(origin, isRender));
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      maxAge: '1d',
      setHeaders: (res, filePath) => {
        if (filePath.match(/(favicon|apple-touch-icon)/i)) {
          res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
        } else if (filePath.match(/\.(webp|png|jpe?g|gif|svg|woff2?|ico)$/i)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (filePath.endsWith('.webmanifest')) {
          res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
        }
      }
    }));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        let html = fs.readFileSync(indexPath, 'utf-8');
        const host = (req.get('host') || '').toLowerCase();
        const isRender = host.includes('.onrender.com');

        // Dynamically enforce primary domain as canonical source across all routes
        const canonicalUrl = `${CANONICAL_ORIGIN}${req.path === '/' ? '/' : req.path}`;
        if (html.includes('<link rel="canonical"')) {
          html = html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonicalUrl}" />`);
        }

        // If accessed directly from Render subdomain, inject noindex, nofollow
        if (isRender) {
          html = html.replace(/<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex, nofollow" />');
        }

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(html);
      }
      res.sendFile(indexPath);
    });
  }

  // Start automatic background data purge worker (2 days after selected birthday)
  startAutoDeleteWorker();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
