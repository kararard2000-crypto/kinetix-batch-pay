"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { translations, Locale } from "@/lib/i18n";

export default function AboutPage() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("kntx_locale") as Locale;
    if (saved && translations[saved]) {
      setLocale(saved);
    }
  }, []);

  if (!mounted) return null;

  const t = translations[locale];
  const isAr = locale === "ar";

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 p-4 md:p-8 font-sans ${isAr ? "text-right" : "text-left"}`} dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
              {isAr ? "عن Kinetix" : "About Kinetix"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {isAr ? "مهمتنا ورؤيتنا" : "Our Mission & Vision"}
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-bold hover:bg-slate-700 transition-all"
          >
            {isAr ? "← العودة للتطبيق" : "← Back to App"}
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          
          {/* Section 1: Who We Are */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">
              {isAr ? "من نحن" : "Who We Are"}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isAr
                ? "Kinetix هي منصة لامركزية غير وصائية مبنية على سولانا. نحن فريق من المطورين وعشاق الكريبتو الذين يؤمنون بأن إرسال الدفعات المجمعة يجب أن يكون سريعاً ورخيصاً وآمناً. سواء كنت شركة صغيرة تدفع الرواتب، أو مشروعاً يوزع التوكنات، أو فرداً يرسل الأموال لأصدقائه، فإن Kinetix مصممة لتسهيل حياتك."
                : "Kinetix is a decentralized, non-custodial platform built on Solana. We are a team of developers and crypto enthusiasts who believe that sending bulk payments should be fast, cheap, and secure. Whether you are a small business paying salaries, a project distributing tokens, or an individual sending funds to friends, Kinetix is designed to make your life easier."}
            </p>
          </section>

          {/* Section 2: Our Vision */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">
              {isAr ? "🚀 رؤيتنا" : "🚀 Our Vision"}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {isAr
                ? "نحن نتصور عالماً يكون فيه إرسال الأموال سهلاً مثل إرسال بريد إلكتروني. بلوكتشين سولانا عالي السرعة ومنخفض التكلفة يجعل هذا ممكناً. Kinetix هي مساهمتنا في هذه الرؤية: أداة تمكن أي شخص من إرسال المدفوعات إلى مئات المستلمين في ثوانٍ، دون وسطاء، ودون فقدان السيطرة على أموالهم."
                : "We envision a world where sending money is as easy as sending an email. Solana's high-speed, low-cost blockchain makes this possible. Kinetix is our contribution to this vision: a tool that empowers anyone to send payments to hundreds of recipients in seconds, without intermediaries, and without losing control of their funds."}
            </p>
          </section>

          {/* Section 3: Why Kinetix */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">
              {isAr ? "💡 لماذا Kinetix؟" : "💡 Why Kinetix?"}
            </h2>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-2">
              {isAr ? (
                <>
                  <li><strong>غير وصائية:</strong> لا نحتفظ بأموالك أبداً. أنت توقّع كل معاملة.</li>
                  <li><strong>شفافة:</strong> 0% رسوم منصة خلال الإطلاق، مع رسوم شبكة حقيقية.</li>
                  <li><strong>سريعة:</strong> مدعومة ببلوكتشين سولانا عالي الأداء.</li>
                  <li><strong>متعددة اللغات:</strong> تدعم 9 لغات، بما فيها العربية.</li>
                  <li><strong>مفتوحة المصدر:</strong> الكود الخاص بنا عام وقابل للتدقيق.</li>
                </>
              ) : (
                <>
                  <li><strong>Non-Custodial:</strong> We never hold your funds. You sign every transaction.</li>
                  <li><strong>Transparent:</strong> 0% platform fees during launch, with real-time network fees.</li>
                  <li><strong>Fast:</strong> Powered by Solana's high-performance blockchain.</li>
                  <li><strong>Multi-Language:</strong> Supports 9 languages, including Arabic.</li>
                  <li><strong>Open Source:</strong> Our code is public and auditable.</li>
                </>
              )}
            </ul>
          </section>

          {/* Section 4: Contact */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <h2 className="text-xl font-bold text-white mb-3">
              {isAr ? "📞 تواصل معنا" : "📞 Get in Touch"}
            </h2>
            <p className="text-sm text-slate-300">
              {isAr ? "انضم إلى مجتمعنا للدعم والتحديثات." : "Join our community for support and updates."}
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <a 
                href="https://t.me/+TbozRkWWmfE4YTEy" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-6 py-2 rounded-xl bg-[#229ED9] text-sm font-bold text-white hover:bg-[#1a8bc4] transition-all"
              >
                Telegram
              </a>
              <a 
                href="https://x.com/your_handle" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-6 py-2 rounded-xl bg-slate-800 text-sm font-bold text-white hover:bg-slate-700 transition-all"
              >
                X (Twitter)
              </a>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}