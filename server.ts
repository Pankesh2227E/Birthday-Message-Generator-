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

dotenv.config();

// Initialize Cloudinary once
cloudinaryService.configure();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

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
    upload.single('file')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ success: false, error: 'Image exceeds the maximum allowed size (50MB).' });
        }
        return res.status(400).json({ success: false, error: `Upload error: ${err.message}` });
      } else if (err) {
        return res.status(500).json({ success: false, error: err.message });
      }
      next();
    });
  }, async (req, res) => {
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

      // Always normalize through Sharp (handles HEIC, large camera photos, auto-orients EXIF, and compresses to <= 300KB JPEG)
      const isGif = req.file.mimetype === 'image/gif' || (req.file.originalname && req.file.originalname.toLowerCase().endsWith('.gif'));
      if (!isGif) {
        try {
          console.log(`[COMPRESSOR] Processing ${req.file.originalname} (${req.file.size} bytes)...`);
          let quality = 82;
          let compressed = await sharp(req.file.buffer)
            .rotate() // Auto-orient based on camera EXIF orientation
            .resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality, mozjpeg: true })
            .toBuffer();

          while (compressed.length > MAX_BYTES && quality > 25) {
            quality -= 15;
            compressed = await sharp(req.file.buffer)
              .rotate()
              .resize(1440, 1440, { fit: 'inside', withoutEnlargement: true })
              .jpeg({ quality, mozjpeg: true })
              .toBuffer();
          }

          console.log(`[COMPRESSOR] Success: ${req.file.size}B -> ${compressed.length}B (quality ${quality})`);
          bufferToUpload = compressed;
        } catch (compErr: any) {
          console.warn('[COMPRESSOR] Sharp processing warning, falling back to original buffer:', compErr.message);
        }
      } else {
        console.log(`[COMPRESSOR] Preserving GIF as-is (${req.file.size} bytes)`);
      }

      let imageUrl: string | null = null;
      let finalPublicId = publicId;

      // 1. Try Cloudinary upload if configured
      try {
        if (process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_CLOUD_NAME) {
          console.log(`[UPLOAD] HANDOFF: Passing buffer to Cloudinary service (${bufferToUpload.length} bytes)`);
          const result = await cloudinaryService.uploadBuffer(bufferToUpload, publicId);
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

      res.json({ 
        success: true, 
        url: imageUrl, 
        publicId: finalPublicId 
      });
    } catch (error: any) {
      console.error(`[UPLOAD] Error in pipeline: ${error.message}`);
      res.status(500).json({ 
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
              things_i_love: [
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
            aiContent = await openRouterService.generateBirthdayContent(data);
          }
          
          // 3. Birthday Cake (User custom animated GIF)
          console.log(`[PIPELINE] Step 3: Birthday Cake for ${surpriseId}`);
          await d1Service.updateSurprise(surpriseId, { ...initialData, ...aiContent, progress: 'Preparing birthday cake...', stage: 3 });
          
          const OFFICIAL_CAKE_GIF = 'https://res.cloudinary.com/zxgbxh38/image/upload/w_400,c_scale,fl_lossy/v1791811363/birthday_surprise/official_user_birthday_cake.gif';
          let resolvedCakeUrl = OFFICIAL_CAKE_GIF;
          
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

          // 6. Update D1 with final content
          console.log(`[PIPELINE] Step 6: Final Update for ${surpriseId}`);
          const finalData = {
            ...data,
            ...aiContent,
            cakeUrl: resolvedCakeUrl,
            memories: uploadedMemories,
            expires_at: expiresAt,
            status: 'ready',
            progress: 'Ready!',
            stage: 6
          };
          
          await d1Service.updateSurprise(surpriseId, finalData);
          console.log(`[PIPELINE] COMPLETE for ${surpriseId}`);
        } catch (error: any) {
          console.error(`[PIPELINE] ASYNC FAILED for ${surpriseId}:`, error);
          await d1Service.updateSurprise(surpriseId, { 
            status: 'failed', 
            error: error.message,
            progress: `Error: ${error.message}`
          });
        }
      })();

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

  // --- Multi-Page Application (MPA) Routes for SEO, Google Search Console, and AdSense ---
  app.get('/privacy-policy', (req, res) => {
    const origin = `${req.protocol}://${req.get('host')}`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderPrivacyPolicyPage(origin));
  });

  app.get('/terms-and-conditions', (req, res) => {
    const origin = `${req.protocol}://${req.get('host')}`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderTermsPage(origin));
  });

  app.get('/about-us', (req, res) => {
    const origin = `${req.protocol}://${req.get('host')}`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderAboutPage(origin));
  });

  app.get('/contact-us', (req, res) => {
    const origin = `${req.protocol}://${req.get('host')}`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(renderContactPage(origin));
  });

  app.post('/api/contact', express.json(), (req, res) => {
    console.log('[CONTACT MESSAGE RECEIVED]', req.body);
    res.json({ success: true, message: 'Message received successfully!' });
  });

  app.get('/sitemap.xml', (req, res) => {
    const origin = `${req.protocol}://${req.get('host')}`;
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.send(renderSitemapXml(origin));
  });

  app.get('/robots.txt', (req, res) => {
    const origin = `${req.protocol}://${req.get('host')}`;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(renderRobotsTxt(origin));
  });

  // Google Search Console HTML verification endpoint
  app.get('/google3b96e2c778683946.html', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send('google-site-verification: google3b96e2c778683946.html');
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
        if (filePath.match(/\.(webp|png|jpe?g|gif|svg|woff2?|ico)$/i)) {
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Start automatic background data purge worker (2 days after selected birthday)
  startAutoDeleteWorker();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
