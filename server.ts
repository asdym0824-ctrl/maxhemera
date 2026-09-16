import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // API Routes FIRST
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Simple in-memory rate limiter per IP for AI endpoints
  const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  const isRateLimited = (ip: string): boolean => {
    const now = Date.now();
    const record = rateLimitMap.get(ip);
    if (!record || now > record.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 });
      return false;
    }
    if (record.count >= 30) {
      return true;
    }
    record.count += 1;
    return false;
  };

  const getAiClient = (apiKey: string) => {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Resilient multi-model Gemini execution helper with automatic failover
  const generateWithFallback = async (
    ai: GoogleGenAI,
    contents: string,
    config?: any
  ): Promise<string> => {
    // Prioritize high-throughput gemini-3.1-flash-lite to avoid 503 high-demand spikes on gemini-3.8-flash
    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config,
        });
        if (response && typeof response.text === 'string' && response.text.trim()) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || err?.error?.message || String(err);
        console.warn(`[AI Failover] Model "${model}" returned error (${msg}). Trying next candidate...`);
      }
    }

    throw lastError || new Error('All AI models temporarily unavailable');
  };

  // Helper to detect if audio transcript is inaudible, silent or hallucinated meta-prompt
  const isHallucinatedOrEmptyTranscription = (text?: string | null): boolean => {
    if (!text || typeof text !== 'string') return true;
    const t = text.trim();
    if (t.length < 2) return true;
    const invalidPatterns = [
      'نامفهوم',
      'فایل صوتی',
      'صدا شنیده نمی‌شود',
      'صدایی شنیده نمی‌شود',
      'صدایی وجود ندارد',
      'سکوت',
      'پیاده‌سازی کنم',
      'ارسال کنید تا',
      'مورد نظر خود را ارسال',
      'امکان پیاده‌سازی',
      'قابل تشخیص نیست',
      'متن صدا',
      'unable to transcribe',
      'no speech',
      'audio is silent'
    ];
    return invalidPatterns.some(pattern => t.toLowerCase().includes(pattern.toLowerCase()));
  };

  // Resilient Gemini Audio Transcription helper for voice notes in Persian
  const transcribeAudioWithFallback = async (
    ai: GoogleGenAI,
    base64Audio: string,
    mimeType: string = 'audio/webm'
  ): Promise<string> => {
    const cleanMime = (mimeType || 'audio/webm').split(';')[0].trim();
    const audioPart = {
      inlineData: {
        mimeType: cleanMime,
        data: base64Audio,
      },
    };

    const promptText = `شما یک سیستم هوشمند تبدیل گفتار به نوشتار (Speech-to-Text) تخصصی زبان فارسی هستید.
وظیفه شما این است که صدای ضبط‌شده بیمار را دقیقاً به زبان فارسی روان پیاده‌سازی و تایپ کنید.
قوانین:
۱. فقط و فقط متن جملاتی که بیمار به زبان فارسی بیان می‌کند را بنویسید.
۲. از نوشتن هرگونه توضیح اضافی، برچسب، پیشوند یا علامت نقل‌قول خودداری فرمایید.
۳. اگر در فایل صوتی هیچ صحبتی شنیده نمی‌شود یا فقط صدای خش‌خش/سکوت است، فقط عبارت «[صدا نامفهوم بود]» را بازگردانید.`;

    // Fast, responsive flash models for voice transcription
    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              audioPart,
              { text: promptText },
            ],
          },
        });
        if (response && typeof response.text === 'string' && response.text.trim()) {
          const cleaned = response.text.trim().replace(/^["'«»]+|["'«»]+$/g, '');
          return cleaned;
        }
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || err?.error?.message || String(err);
        console.warn(`[Audio Transcribe Failover] Model "${model}" failed (${msg}). Trying next candidate...`);
      }
    }

    throw lastError || new Error('All AI models temporarily unavailable for audio transcription');
  };

  // Server-side Gemini AI Endpoint for Patient Assistant / Care Navigator
  app.post('/api/ai/assistant', async (req, res) => {
    const { prompt, history, context } = req.body;
    const safePrompt = typeof prompt === 'string' ? prompt.trim().slice(0, 2000) : '';

    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (isRateLimited(clientIp)) {
        return res.status(429).json({ error: 'تعداد درخواست‌های شما از حد مجاز فراتر رفته است. لطفاً کمی صبر کنید.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          text: 'به سامانه راهبری سلامت و نوبت‌دهی همراه کلینیک خوش آمدید. می‌توانید از بخش پزشکان، متخصص مورد نظر را انتخاب و نوبت حضوری یا مشاوره آنلاین دریافت نمایید.'
        });
      }

      if (!safePrompt) {
        return res.status(400).json({ error: 'متن درخواست نامعتبر است.' });
      }

      const ai = getAiClient(apiKey);
      const promptContent = `شما "راهبر هوشمند سلامت همراه کلینیک (Hamrah Clinic Care Navigator)" هستید.
وظیفه شما:
۱. راهنمایی صبورانه، محترمانه و دقیق مراجعین جهت یافتن دپارتمان تخصصی مناسب و راهنمایی فرآیند رزرو نوبت.
۲. آگاهی‌بخشی عمومی سلامت بدون تشخیص قطعی بیماری یا تجویز دارو.
۳. در صورت وجود علائم هشداردهنده حاد (مانند درد شدید و فشارنده قفسه سینه، تنگی نفس شدید، فلج یا بی‌حسی ناگهانی صورت و اندام‌ها، تشنج یا خونریزی شدید)، فوراً و با اولویت بالا بیمار را به تماس با اورژانس ۱۱۵ یا مراجعه به نزدیک‌ترین اورژانس بیمارستانی هدایت نمایید.
۴. پاسخ‌ها را به زبان فارسی روان، شیوا و در ۲ الی ۴ جمله ارائه دهید.

پرسش بیمار: "${safePrompt}"
${context ? `بافت کاربر: ${JSON.stringify(context).slice(0, 500)}` : ''}`;

      const generatedText = await generateWithFallback(ai, promptContent);
      return res.json({ text: generatedText.trim() });
    } catch (error) {
      console.warn('AI Assistant service fallback triggered:', error instanceof Error ? error.message : error);

      // Safe, grounded patient response fallback without hardcoded doctor recommendations
      const q = safePrompt.toLowerCase();
      let fallbackText = 'به سامانه سلامت هوشمند همراه کلینیک خوش آمدید. شما می‌توانید بر اساس علائم خود، تخصص مورد نظر را جستجو کرده و از پزشکان متخصص کلینیک نوبت حضوری یا آنلاین رزرو فرمایید.';
      
      if (q.includes('معده') || q.includes('گوارش') || q.includes('کبد') || q.includes('سوزش')) {
        fallbackText = 'برای بررسی علائم گوارشی، مراجعه به متخصصین دپارتمان گوارش و کبد کلینیک پیشنهاد می‌شود. می‌توانید لیست پزشکان فعال این تخصص را در بخش پزشکان مشاهده فرمایید.';
      } else if (q.includes('قلب') || q.includes('فشار') || q.includes('سینه')) {
        fallbackText = 'برای بررسی سلامت قلب و عروق، دپارتمان قلب کلینیک در دسترس است. هشدار: در صورت وجود درد شدید و ناگهانی در قفسه سینه، فوراً با اورژانس ۱۱۵ تماس حاصل فرمایید.';
      } else if (q.includes('پوست') || q.includes('مو') || q.includes('زیبایی') || q.includes('جوش')) {
        fallbackText = 'برای خدمات درمانی و مراقبت‌های پوست و مو، متخصصین پوست همراه کلینیک آماده ارائه مشاوره حضوری و آنلاین هستند.';
      } else if (q.includes('زانو') || q.includes('کمر') || q.includes('مفاصل') || q.includes('ارتوپدی')) {
        fallbackText = 'برای ارزیابی مشکلات مفصلی، ستون فقرات و دردهای اسکلتی-عضلانی، مراجعه به دپارتمان ارتوپدی و طب فیزیکی توصیه می‌شود.';
      } else if (q.includes('نوبت') || q.includes('رزرو') || q.includes('ساعت') || q.includes('هزینه')) {
        fallbackText = 'برای دریافت نوبت، پزشک مورد نظر خود را از صفحه «پزشکان» انتخاب نموده و ساعت ویزیت حضوری یا آنلاین را تأیید فرمایید.';
      }

      return res.json({ text: fallbackText });
    }
  });

  // Stateful Care Navigator endpoint with structured intent & triage (Text and Voice input support)
  app.post('/api/ai/care-navigator', async (req, res) => {
    const { message, audioBase64, mimeType, history, context } = req.body;
    let safeMsg = typeof message === 'string' ? message.trim().slice(0, 2000) : '';
    let userTranscript: string | null = null;

    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (isRateLimited(clientIp)) {
        return res.status(429).json({ error: 'تعداد درخواست‌ها بیش از حد مجاز است.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      const ai = apiKey ? getAiClient(apiKey) : null;

      // If voice audio is provided, transcribe with Gemini AI
      if (audioBase64 && typeof audioBase64 === 'string') {
        if (ai) {
          try {
            userTranscript = await transcribeAudioWithFallback(ai, audioBase64, mimeType || 'audio/webm');
          } catch (transcribeErr) {
            console.warn('Voice transcription failed in care-navigator:', transcribeErr);
            userTranscript = null;
          }
        }

        // Handle inaudible, silent or hallucinated empty voice recording gracefully
        if (isHallucinatedOrEmptyTranscription(userTranscript)) {
          return res.json({
            reply: 'پیام صوتی شما دریافت شد، اما صدا به اندازه کافی واضح نبود یا صحبتی شنیده نشد. لطفاً در محیطی با نویز کمتر مجدداً ویس بفرستید یا علائم خود را به صورت متنی بنویسید تا راهنمایی‌تان کنم.',
            userTranscript: 'صدا واضح نبود',
            intent: 'general_info',
            specialtyId: null,
            doctorId: null,
            urgency: 'routine',
            emergency: false
          });
        }

        safeMsg = userTranscript;
      }

      if (!apiKey) {
        return res.json({
          reply: 'به راهبر هوشمند سلامت همراه کلینیک خوش آمدید. پیام صوتی/متنی شما دریافت شد. چگونه می‌توانم در انتخاب تخصص درمانی، پزشک یا نوبت‌دهی به شما کمک کنم؟',
          userTranscript: userTranscript || undefined,
          intent: 'general_info',
          specialtyId: null,
          doctorId: null,
          urgency: 'routine',
          emergency: false
        });
      }

      if (!safeMsg) {
        return res.status(400).json({ error: 'پیام یا صوت ارسالی نامعتبر است.' });
      }

      const conversationTurns = Array.isArray(history)
        ? history.slice(-8).map((h: any) => `${h.sender === 'user' ? 'کاربر' : 'دستیار'}: ${h.text}`).join('\n')
        : '';

      const promptContent = `شما "راهبر هوشمند سلامت همراه کلینیک (Hamrah Clinic Care Navigator)" هستید.
وظیفه شما راهنمایی هوشمند و پیوسته بیمار در انتخاب تخصص پزشکی مناسب، ارائه اطلاعات آموزشی و راهنمایی فرآیند نوبت‌دهی است.

دستورالعمل‌های حیاتی:
۱. از ارائه تشخیص قطعی بیماری یا تجویز دارو خودداری فرمایید.
۲. هرگز نام پزشک خاصی را از پیش خود نسازید یا توصیه نکنید؛ فقط تخصص بالینی مناسب را بر اساس شناسه تعیین کنید.
۳. در صورت بروز علائم اورژانسی (مانند درد شدید قفسه سینه، تنگی نفس حاد، بیهوشی، علائم سکته، خونریزی حاد)، فوراً بیمار را به تماس با اورژانس ۱۱۵ ارجاع داده و فیلد emergency را true قرار دهید.
۴. در صورتی که کاربر در مورد پیام قبلی خود سوال پرسید (مثلاً "کدوم دکتر برم؟" پس از ذکر مشکل معده)، از تاریخچه گفتگو تخصص مربوطه را تشخیص دهید.
۵. خروجی باید الزاماً و بدون هیچ متن اضافی، یک شیء JSON معتبر با ساختار زیر باشد:
{
  "reply": "متن پاسخ محترمانه و راهنمایی به زبان فارسی روان (۲ الی ۴ جمله)",
  "intent": "find_doctor" | "find_specialty" | "booking_help" | "patient_appointments" | "general_info" | "emergency",
  "specialtyId": "cardiology" | "gastroenterology" | "dermatology" | "orthopedics" | "neurology" | "pediatrics" | "general" | "ophthalmology" | null,
  "doctorId": null,
  "urgency": "routine" | "urgent" | "emergency",
  "emergency": false
}

بافت سیستم و صفحه جاری:
${context ? JSON.stringify(context).slice(0, 1500) : 'صفحه عمومی'}

تاریخچه گفتگوهای قبلی:
${conversationTurns}

پیام جدید بیمار:
"${safeMsg}"
${audioBase64 ? 'توجه: این پیام توسط بیمار به صورت پیام صوتی (ویس) ارسال و با دقت پیاده‌سازی شده است. به عنوان راهبر سلامت، با لحنی گرم، همدلانه و متناسب با علائم پزشکی بیان‌شده به بیمار پاسخ دهید. هرگز نگویید امکان پردازش یا شنیدن فایل صوتی را ندارید.' : ''}`;

      const rawText = await generateWithFallback(ai, promptContent);

      let parsed: any = null;
      try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch {
        parsed = null;
      }

      if (parsed && typeof parsed.reply === 'string') {
        return res.json({
          reply: parsed.reply.trim(),
          userTranscript: userTranscript || undefined,
          intent: parsed.intent || 'general_info',
          specialtyId: parsed.specialtyId || null,
          doctorId: parsed.doctorId || null,
          urgency: parsed.urgency || 'routine',
          emergency: !!parsed.emergency
        });
      }

      const isEmerg = safeMsg.includes('درد قفسه سینه') || safeMsg.includes('سکته') || safeMsg.includes('بیهوشی') || safeMsg.includes('۱۱۵');
      return res.json({
        reply: rawText.replace(/```json|```/g, '').trim() || 'برای راهنمایی دقیق‌تر، تخصص مورد نظر خود را بفرمایید.',
        userTranscript: userTranscript || undefined,
        intent: isEmerg ? 'emergency' : 'general_info',
        specialtyId: null,
        doctorId: null,
        urgency: isEmerg ? 'emergency' : 'routine',
        emergency: isEmerg
      });
    } catch (error) {
      console.warn('Care Navigator fallback:', error instanceof Error ? error.message : error);
      return res.json({
        reply: 'به راهبر سلامت همراه کلینیک خوش آمدید. برای راهنمایی در انتخاب دپارتمان تخصصی و رزرو نوبت، لطفاً علائم یا سوال خود را مطرح فرمایید.',
        userTranscript: userTranscript || undefined,
        intent: 'general_info',
        specialtyId: null,
        doctorId: null,
        urgency: 'routine',
        emergency: false
      });
    }
  });

  // Dedicated Voice Transcription Endpoint (Gemini Multimodal Audio Understanding)
  app.post('/api/ai/transcribe-voice', async (req, res) => {
    const { audioBase64, mimeType } = req.body;
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      return res.status(400).json({ error: 'داده صوتی ارسال نشده است.' });
    }

    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (isRateLimited(clientIp)) {
        return res.status(429).json({ error: 'تعداد درخواست‌ها بیش از حد مجاز است.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({ text: 'پیام صوتی شما با موفقیت دریافت شد.' });
      }

      const ai = getAiClient(apiKey);
      const text = await transcribeAudioWithFallback(ai, audioBase64, mimeType || 'audio/webm');
      return res.json({ text });
    } catch (err: any) {
      console.warn('Voice transcribe error:', err);
      return res.status(500).json({ error: 'خطا در تبدیل صوت به متن با هوش مصنوعی', message: err?.message });
    }
  });

  // Server-side Gemini AI Endpoint for Doctor Copilot (Conservative & Hallucination-free)
  app.post('/api/ai/copilot', async (req, res) => {
    const { patientName, history } = req.body;
    const safeName = typeof patientName === 'string' ? patientName.trim().slice(0, 200) : 'بیمار';
    const safeHistory = typeof history === 'string' ? history.trim().slice(0, 3000) : '';

    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (isRateLimited(clientIp)) {
        return res.status(429).json({ error: 'تعداد درخواست‌های شما از حد مجاز فراتر رفته است. لطفاً کمی صبر کنید.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          summary: `خلاصه پرونده برای بیمار ${safeName} آماده بررسی در ویزیت حضوری است.`,
          alerts: [],
          suggestedFocus: ['بررسی شکایات و علائم فعلی در ویزیت حضوری'],
          missingInformation: ['اطلاعات کافی برای استخراج این مورد وجود ندارد.']
        });
      }

      const ai = getAiClient(apiKey);
      const prompt = `شما دستیار هوشمند بالینی پزشک (AI Doctor Copilot) در سامانه همراه کلینیک هستید.
شما باید بر اساس شرح حال و سوابق واقعی ثبت شده برای بیمار "${safeName}" یک تحلیل بالینی مستند و محافظه‌کارانه در قالب JSON تولید کنید.

دستورالعمل‌های حیاتی ایمنی بالینی (Clinical Safety Directives):
۱. تمام موارد باید ۱۰۰٪ مستند به سوابق ارائه شده باشد.
۲. اکیداً از ابداع، حدس زدن یا فرض کردن بیماری‌ها، داروها یا تجویز سرخود تست‌های تشخیصی خودداری کنید.
۳. در بخش هشدارهای بالینی فقط مواردی که صراحتاً در پرونده آمده (مثل حساسیت دارویی ذکر شده، سابقه بیماری اعلام شده) را بیاورید.
۴. اگر در بخشی اطلاعات کافی وجود ندارد، بنویسید: "اطلاعات کافی برای استخراج این مورد وجود ندارد."
۵. خروجی فقط و فقط یک JSON معتبر با ساختار زیر باشد:
{
  "summary": "خلاصه ۲ جمله‌ای از سوابق و شکایات مستند بیمار",
  "alerts": ["لیست هشدارهای بالینی صریحاً مستند در پرونده"],
  "suggestedFocus": ["محورهای پیشنهادی برای بررسی توسط پزشک در ویزیت امروز"],
  "missingInformation": ["اطلاعات یا سوابقی که برای تصمیم‌گیری بالینی کامل نیاز به تکمیل در ویزیت دارد"]
}

سوابق بالینی و شرح حال بیمار:
${safeHistory || 'هیچ شرح حال قبلی ثبت نشده است.'}`;

      const rawText = await generateWithFallback(ai, prompt);

      // Defensive JSON extraction
      let parsed = null;
      try {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      } catch {
        parsed = null;
      }

      if (parsed && typeof parsed.summary === 'string') {
        return res.json({
          summary: parsed.summary,
          alerts: Array.isArray(parsed.alerts) ? parsed.alerts : [],
          suggestedFocus: Array.isArray(parsed.suggestedFocus) ? parsed.suggestedFocus : [],
          missingInformation: Array.isArray(parsed.missingInformation) ? parsed.missingInformation : []
        });
      }

      return res.json({
        summary: rawText.replace(/```json|```/g, '').trim().slice(0, 400) || `شرح حال بیمار ${safeName} آماده بررسی در ویزیت است.`,
        alerts: [],
        suggestedFocus: ['بررسی علائم فعلی بیمار در ویزیت حضوری'],
        missingInformation: ['نیاز به بررسی تکمیلی سوابق در ویزیت']
      });
    } catch (error) {
      console.warn('AI Copilot service fallback triggered:', error instanceof Error ? error.message : error);

      // Conservative fallback without keyword-based test prescriptions
      return res.json({
        summary: safeHistory ? `شرح حال ثبت شده برای ${safeName}: ${safeHistory.slice(0, 150)}...` : `شرح حال اولیه برای بیمار ${safeName} در پرونده ثبت نشده است.`,
        alerts: [],
        suggestedFocus: ['بررسی شکایات و علائم ذکر شده توسط بیمار در ویزیت امروز'],
        missingInformation: ['بررسی تکمیلی سوابق دارویی و حساسیت‌ها در ویزیت حضوری']
      });
    }
  });

  // Server-side Gemini AI Endpoint for Clinic Operations Copilot (Secretary & Clinic Manager)
  app.post('/api/ai/operations', async (req, res) => {
    const { role, prompt, context } = req.body;
    const safeRole = typeof role === 'string' ? role : 'secretary';
    const safePrompt = typeof prompt === 'string' ? prompt.trim().slice(0, 1500) : '';
    const safeContext = typeof context === 'object' && context !== null ? JSON.stringify(context).slice(0, 3000) : '';

    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (isRateLimited(clientIp)) {
        return res.status(429).json({ error: 'تعداد درخواست‌های شما از حد مجاز فراتر رفته است.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          text: safeRole === 'clinic_manager'
            ? 'گزارش مدیریت: شاخص‌های عملیاتی و جریان مراجعین در حال پایش است.'
            : 'دستیار منشی: آماده سازماندهی صف نوبت‌ها و ثبت وضعیت حضور بیماران.'
        });
      }

      const systemPersona = safeRole === 'clinic_manager'
        ? `شما "دستیار هوشمند مدیریت همراه کلینیک" (Clinic Manager Operations AI) هستید. به مدیر کلینیک در تحلیل بهره‌وری، گلوگاه‌های زمان انتظار، عملکرد پرسنل و پیشنهادات بهینه‌سازی عملیاتی کمک می‌کنید.`
        : safeRole === 'doctor'
        ? `شما "دستیار هوشمند سازماندهی کار روزانه پزشک همراه کلینیک" هستید. به پزشک در اولویت‌بندی مراجعین، مدیریت نوبت‌های معوقه و تسک‌های بالینی کمک می‌کنید.`
        : `شما "دستیار هوشمند منشی و پذیرش همراه کلینیک" (Secretary AI Copilot) هستید. به منشی در اعلام حضور، پیگیری تلفنی، ارسال پیامک‌های الگو و رفع اختلالات نوبت‌دهی امروز کمک می‌کنید.`;

      const ai = getAiClient(apiKey);
      const promptContent = `${systemPersona}
به زبان فارسی روان، کاربردی، ساختاریافته و با تمرکز دقیق بر داده‌های واقعی زیر پاسخ دهید:
بافت عملیاتی واقعی سیستم: ${safeContext}
درخواست کاربر: "${safePrompt}"

نکات مهم:
۱. فقط بر اساس اعداد و داده‌های بافت فوق تحلیل ارائه دهید و از ساختن ارقام غیرواقعی خودداری فرمایید.
۲. در صورت مناسب بودن، پیشنهادات اقدام مشخص (Actionable suggestions) ارائه دهید.`;

      const generatedText = await generateWithFallback(ai, promptContent);
      return res.json({ text: generatedText.trim() });
    } catch (error) {
      console.warn('Operations AI service fallback triggered:', error instanceof Error ? error.message : error);

      if (safeRole === 'clinic_manager') {
        return res.json({
          text: 'تحلیلگر هوشمند مدیریت کلینیک: عملیات کلینیک فعال است و مراجعین طبق زمان‌بندی در حال پذیرش هستند.'
        });
      }
      return res.json({
        text: 'دستیار هوشمند منشی: سیستم نوبت‌دهی و مدیریت صف آماده خدمت‌رسانی است. از پنل تسک‌ها و دکمه‌های سریع برای تغییر وضعیت بیماران استفاده فرمایید.'
      });
    }
  });

  // Dedicated Doctor Site AI Assistant Endpoint (Grounded in specific Doctor Practice with Text & Voice support)
  app.post('/api/ai/doctor-site-assistant', async (req, res) => {
    const { prompt, audioBase64, mimeType, doctorContext, history } = req.body;
    let safePrompt = typeof prompt === 'string' ? prompt.trim().slice(0, 2000) : '';
    let userTranscript: string | null = null;

    try {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (isRateLimited(clientIp)) {
        return res.status(429).json({ error: 'تعداد درخواست‌ها بیش از حد مجاز است.' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      const ai = apiKey ? getAiClient(apiKey) : null;

      if (audioBase64 && typeof audioBase64 === 'string') {
        if (ai) {
          try {
            userTranscript = await transcribeAudioWithFallback(ai, audioBase64, mimeType || 'audio/webm');
            safePrompt = userTranscript;
          } catch (transcribeErr) {
            console.warn('Voice transcription failed in doctor assistant:', transcribeErr);
            userTranscript = 'پیام صوتی دریافت شد';
            safePrompt = 'پیام صوتی مراجع جهت راهنمایی نوبت‌دهی و خدمات مطب';
          }
        } else {
          userTranscript = 'پیام صوتی دریافت شد';
          safePrompt = 'پیام صوتی مراجع مطب';
        }
      }

      if (!apiKey) {
        return res.json({
          text: `به وبسایت اختصاصی ${doctorContext?.name || 'پزشک'} خوش آمدید. پیام صوتی/متنی شما دریافت شد. می‌توانید جهت دریافت نوبت حضوری یا مشاوره آنلاین از دکمه نوبت‌دهی استفاده فرمایید.`,
          userTranscript: userTranscript || undefined,
          isEmergency: false,
          suggestedAction: { label: 'رزرو نوبت با پزشک', actionType: 'book' }
        });
      }

      if (!safePrompt) {
        return res.status(400).json({ error: 'متن یا صوت ارسالی نامعتبر است.' });
      }

      const conversationTurns = Array.isArray(history)
        ? history.slice(-6).map((h: any) => `${h.role === 'user' ? 'مراجع' : 'دستیار مطب'}: ${h.text}`).join('\n')
        : '';

      const promptContent = `شما "دستیار هوشمند رسمی مطب ${doctorContext?.name || 'پزشک'}" هستید.
عنوان پزشک: ${doctorContext?.title || ''}
تخصص: ${doctorContext?.specialty || ''}
کد نظام پزشکی: ${doctorContext?.councilNumber || ''}
نزدیک‌ترین نوبت آزاد: ${doctorContext?.nextSlot || ''}
تعرفه ویزیت: ${doctorContext?.fee ? doctorContext.fee + ' تومان' : 'تعرفه مصوب'}
تعرفه آنلاین: ${doctorContext?.onlineFee ? doctorContext.onlineFee + ' تومان' : 'مشاوره آنلاین'}
بیمه‌های طرف قرارداد: ${Array.isArray(doctorContext?.insurances) ? doctorContext.insurances.join('، ') : ''}
خدمات تخصصی: ${JSON.stringify(doctorContext?.services || [])}
مطب‌ها و شعب: ${JSON.stringify(doctorContext?.offices || [])}
سوالات متداول مطب: ${JSON.stringify(doctorContext?.faqs || [])}

وظایف شما:
۱. پاسخ دقیق، باوقار، محترمانه و کوتاه به زبان فارسی روان در ۲ الی ۴ جمله.
۲. منحصراً بر اساس اطلاعات فوق درباره این پزشک، خدمات، مطب‌ها و نوبت‌دهی پاسخ دهید. هرگز اطلاعات پزشک دیگری را نام نبرید.
۳. تشخیص قطعی پزشکی یا تجویز دارویی انجام ندهید.
۴. در صورت مشاهده علائم هشداردهنده فوری (مانند سکته، درد شدید قفسه سینه، تنگی نفس حاد، خونریزی شدید، بیهوشی)، فوراً اعلام هشدار اورژانس ۱۱۵ نمایید.
۵. خروجی باید یک شیء JSON بدون مارک‌داون با فیلدهای زیر باشد:
{
  "text": "متن پاسخ به بیمار",
  "isEmergency": false,
  "suggestedAction": { "label": "عنوان دکمه پیشنهادی (مثلاً رزرو نوبت)", "actionType": "book" | "offices" | "services" | "articles" | "faq" }
}

تاریخچه گفتگو:
${conversationTurns}
پرسش بیمار: "${safePrompt}"`;

      const generatedText = await generateWithFallback(ai, promptContent);
      let parsed = null;
      try {
        const clean = generatedText.trim().replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();
        parsed = JSON.parse(clean);
      } catch {
        parsed = {
          text: generatedText.trim(),
          isEmergency: false,
          suggestedAction: { label: 'دریافت نوبت اینترنتی', actionType: 'book' }
        };
      }

      return res.json({
        ...parsed,
        userTranscript: userTranscript || parsed?.userTranscript || undefined
      });
    } catch (error) {
      console.warn('Doctor AI service fallback triggered:', error instanceof Error ? error.message : error);

      const q = safePrompt.toLowerCase();
      let text = `مطب ${doctorContext?.name || 'پزشک'} آماده ارائه خدمات تخصصی به شماست. نزدیک‌ترین زمان در دسترس «${doctorContext?.nextSlot || 'امروز'}» می‌باشد.`;
      let isEmergency = false;
      let action: any = { label: 'دریافت نوبت', actionType: 'book' };

      if (q.includes('درد سینه') || q.includes('سکته') || q.includes('تنگی نفس') || q.includes('خونریزی')) {
        text = '⚠️ هشدار اورژانسی: این علائم نیازمند اقدام فوری پزشکی هستند. لطفاً فوراً با اورژانس ۱۱۵ تماس حاصل فرمایید.';
        isEmergency = true;
        action = undefined;
      } else if (q.includes('آدرس') || q.includes('کجا') || q.includes('مطب') || q.includes('تلفن')) {
        text = `آدرس مطب: ${doctorContext?.address || 'مطب مرکزی'} - ساعات پذیرش و نوبت‌دهی در بخش مطب‌ها قابل مشاهده است.`;
        action = { label: 'مشاهده آدرس مطب‌ها', actionType: 'offices' };
      } else if (q.includes('بیمه') || q.includes('تامین اجتماعی') || q.includes('تکمیلی')) {
        text = `بیمه‌های طرف قرارداد این مطب شامل: ${Array.isArray(doctorContext?.insurances) ? doctorContext.insurances.join('، ') : 'تامین اجتماعی، خدمات درمانی و بیمه‌های تکمیلی'} می‌باشد.`;
      }

      return res.json({ text, isEmergency, suggestedAction: action });
    }
  });

  // Vite middleware for development vs static dist for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hamrah Clinic Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
