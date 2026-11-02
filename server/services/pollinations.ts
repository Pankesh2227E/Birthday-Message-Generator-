export const pollinationsService = {
  async generateCake(name: string, age: string) {
    console.log('[POLLINATIONS] GENERATION START');
    const prompt = `A hyper-realistic, luxurious dark chocolate birthday cake for ${name} who is turning ${age}. The cake is adorned with fresh blackberries and raspberries, elegant gold leaf, and sits on a dark velvet surface. Cinematic lighting, minimalist-noir aesthetic, moody atmosphere. High-end food photography. No text on the cake itself.`;
    
    const encodedPrompt = encodeURIComponent(prompt);
    const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000000)}&model=flux`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const response = await fetch(imageUrl, { signal: controller.signal });
      clearTimeout(timeout);
      
      if (!response.ok) {
        console.error('[POLLINATIONS] ERROR');
        throw new Error('Pollinations image generation failed');
      }

      console.log('[POLLINATIONS] SUCCESS');
      return imageUrl;
    } catch (error: any) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        console.error('[POLLINATIONS] TIMEOUT');
        throw new Error('Pollinations request timed out');
      }
      throw error;
    }
  }
};
