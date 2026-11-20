// lib/rateLimit.ts
type RateLimitOptions = {
  interval: number; // المدة الزمنية بالمللي ثانية (مثلاً 60 ثانية)
  uniqueTokenPerInterval: number; // الحد الأقصى لعدد الـ IPs المخزنة مؤقتاً
};

export default function rateLimit(options?: RateLimitOptions) {
  const tokenCache = new Map<string, number[]>();
  const interval = options?.interval || 60_000;
  const uniqueTokenPerInterval = options?.uniqueTokenPerInterval || 500;

  return {
    check: (res: Response, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || [0];
        const now = Date.now();
        
        // تنظيف التوكنات القديمة إذا تجاوزت الحد
        if (tokenCache.size > uniqueTokenPerInterval) {
          tokenCache.clear();
        }

        const windowStart = now - interval;
        // تصفية الطلبات داخل نافذة الوقت الحالية
        const requestsInWindow = tokenCount.filter((timestamp) => timestamp > windowStart);

        if (requestsInWindow.length >= limit) {
          reject(new Error("Rate limit exceeded. Please try again later."));
          return;
        }

        requestsInWindow.push(now);
        tokenCache.set(token, requestsInWindow);
        resolve();
      }),
  };
}