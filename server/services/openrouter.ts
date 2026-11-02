export const openRouterService = {
  async generateBirthdayContent(data: any) {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    console.log('[OPENROUTER] REQUEST START');
    
    const isBestFriend = data.relationship === 'Best Friend';
    const isRomantic = ['Girlfriend', 'Boyfriend', 'Partner', 'Wife', 'Husband'].includes(data.relationship);
    const isFamily = ['Sister', 'Brother', 'Mother', 'Father', 'Family'].includes(data.relationship);

    let toneDesc = 'warm, nostalgic, and meaningful';
    if (isRomantic) {
      toneDesc = 'romantic, warm, affectionate, and deeply emotional';
    } else if (isBestFriend) {
      toneDesc = 'warm, playful, nostalgic, and friendship-focused';
    } else if (isFamily) {
      toneDesc = 'warm, loving, and meaningful';
    }

    const detailsList = [
      `Name: ${data.recipientName || 'Friend'}`,
      data.recipientAge ? `Age: ${data.recipientAge}` : null,
      data.dob ? `Date of Birth: ${data.dob}` : null,
      `Relationship: ${data.relationship || 'Friend'}`,
      data.howWeMet ? `How we met: ${data.howWeMet}` : null,
      data.favoriteMemory ? `Favorite Memory: ${data.favoriteMemory}` : null,
      data.personality ? `Personality: ${data.personality}` : null,
      data.interests ? `Interests: ${data.interests}` : null,
    ].filter(Boolean).join('\n      ');

    const genderNeutralConstraint = isBestFriend
      ? 'CRITICAL GENDER-NEUTRAL INSTRUCTION: The relationship is "Best Friend". The message MUST be strictly gender-neutral. DO NOT use he/she/him/her/his/hers. Naturally speak directly to them using "you", "your", their name, or "they/them" where appropriate. Keep it natural.'
      : '';

    const prompt = `
      Generate a personalized birthday surprise package using only the provided details:
      ${detailsList}

      Return a JSON object with:
      - intro: A cinematic, emotional welcome line (e.g. "A little surprise for someone who makes every day brighter...")
      - birthday_message: A 2-3 paragraph emotional, personal birthday letter.
      - memory_captions: An array of ${data.memories?.length || 3} short, poetic captions for photos.
      - things_i_love: An array of 3 things the sender loves about the recipient, based on their personality and interests.
      - final_message: A short, heart-felt closing sentence.

      Tone: ${toneDesc}.
      ${genderNeutralConstraint}
      DO NOT invent unmentioned memories or activities (such as "late-night chats", "trips", etc.) unless explicitly provided. If a detail was omitted, speak warmly and genuinely without assuming.
    `;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s timeout

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://birthday-surprise.app',
          'X-Title': 'Birthday Surprise',
        },
        body: JSON.stringify({
          model: 'openai/gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a professional gift curator and creative writer. Always respond with valid JSON.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' },
          max_tokens: 500
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      console.log(`[OPENROUTER] RESPONSE STATUS: ${response.status}`);

      if (!response.ok) {
        const error = await response.text();
        console.error(`[OPENROUTER] ERROR: ${error}`);
        throw new Error(`OpenRouter API error: ${error}`);
      }

      const result = await response.json();
      const content = result.choices[0].message.content;
      console.log('[OPENROUTER] SUCCESS');
      
      try {
        return JSON.parse(content);
      } catch (e) {
        console.error('[OPENROUTER] JSON PARSE FAILED', content);
        throw new Error('AI generated invalid content format');
      }
    } catch (error: any) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        console.error('[OPENROUTER] TIMEOUT');
        throw new Error('OpenRouter request timed out');
      }
      throw error;
    }
  }
};
