import { v2 as cloudinary } from 'cloudinary';

export { cloudinary };

export const cloudinaryService = {
  configure() {
    console.log('[CLOUDINARY] Initializing configuration...');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
    
    // Check if config worked (without exposing secrets)
    const config = cloudinary.config();
    console.log(`[CLOUDINARY] Configured for cloud: ${config.cloud_name}`);
    if (!config.api_key) console.warn('[CLOUDINARY] WARNING: API Key missing in config');
    if (!config.api_secret) console.warn('[CLOUDINARY] WARNING: API Secret missing in config');
  },

  getConfig() {
    return cloudinary.config();
  },

  async uploadImage(imagePath: string, publicId: string) {
    if (!process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary configuration is missing');
    }

    console.log(`[CLOUDINARY] UPLOAD_IMAGE START: ${publicId}`);

    try {
      const result = await cloudinary.uploader.upload(imagePath, {
        public_id: publicId,
        folder: 'birthday_surprise',
        resource_type: 'auto'
      });
      console.log(`[CLOUDINARY] UPLOAD_IMAGE SUCCESS: ${result.secure_url}`);
      return result;
    } catch (error: any) {
      console.error(`[CLOUDINARY] UPLOAD_IMAGE FAILED: ${error.message}`);
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  },

  async uploadBuffer(buffer: Buffer, publicId: string): Promise<any> {
    if (!process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary configuration is missing');
    }

    console.log(`[CLOUDINARY] UPLOAD_BUFFER START: ${publicId} (${buffer.length} bytes)`);

    return new Promise((resolve, reject) => {
      try {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            public_id: publicId,
            folder: 'birthday_surprise',
            resource_type: 'image'
          },
          (error, result) => {
            if (error) {
              console.error(`[CLOUDINARY] UPLOAD_BUFFER CALLBACK ERROR: ${error.message}`);
              reject(new Error(`Cloudinary buffer upload failed: ${error.message}`));
            } else if (!result || !result.secure_url) {
              console.error('[CLOUDINARY] UPLOAD_BUFFER CALLBACK: No result or URL');
              reject(new Error('Cloudinary buffer upload failed: No result returned'));
            } else {
              console.log(`[CLOUDINARY] UPLOAD_BUFFER SUCCESS: ${result.secure_url}`);
              resolve(result);
            }
          }
        );

        uploadStream.on('error', (error) => {
          console.error(`[CLOUDINARY] STREAM ERROR: ${error.message}`);
          reject(new Error(`Stream error: ${error.message}`));
        });

        console.log('[CLOUDINARY] Pushing buffer to stream...');
        uploadStream.end(buffer);
      } catch (err: any) {
        console.error(`[CLOUDINARY] CATCH ERROR in uploadBuffer: ${err.message}`);
        reject(err);
      }
    });
  },

  async destroyImage(publicId: string): Promise<any> {
    try {
      console.log(`[CLOUDINARY] DESTROY_IMAGE: ${publicId}`);
      return await cloudinary.uploader.destroy(publicId);
    } catch (err: any) {
      console.warn(`[CLOUDINARY] DESTROY_IMAGE warning for ${publicId}:`, err.message);
      return null;
    }
  }
};
