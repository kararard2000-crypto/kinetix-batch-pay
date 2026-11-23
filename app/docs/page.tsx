"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { translations, Locale } from "@/lib/i18n";

export default function DocsPage() {
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

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 p-4 md:p-8 font-sans ${t.dir === "rtl" ? "text-right" : "text-left"}`} dir={t.dir}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-900/60 border border-purple-500/20 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
              {locale === "ar" ? "توثيق Kinetix" : "Kinetix Documentation"}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {locale === "ar" ? "كل ما تحتاج معرفته" : "Everything you need to know"}
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm font-bold hover:bg-slate-700 transition-all"
          >
            {locale === "ar" ? "← العودة للتطبيق" : "← Back to App"}
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          
          {/* Section 1 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">
              {locale === "ar" ? "ما هو Kinetix Batch Pay؟" : "What is Kinetix Batch Pay?"}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {locale === "ar" 
                ? "Kinetix هي منصة لامركزية غير وصائية لإرسال الدفعات المجمعة على سولانا. سواء كنت تدفع الرواتب، أو توزع التوكنات، أو توزع الأرباح، تتيح لك Kinetix الإرسال إلى مئات المستلمين في دفعة واحدة فعالة."
                : "Kinetix is a decentralized, non-custodial platform for sending bulk payments on Solana. Whether you are paying salaries, airdropping tokens, or distributing profits, Kinetix allows you to send to hundreds of recipients in a single, efficient batch."}
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">
              {locale === "ar" ? "🔒 غير وصائية بحكم التصميم" : "🔒 Non-Custodial by Design"}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {locale === "ar"
                ? "Kinetix لا تحتفظ بأموالك أبداً. نحن لا نملك صلاحية الوصول إلى مفاتيحك الخاصة. أنت توقّع كل معاملة مباشرة من محفظتك (Phantom, Solflare, إلخ). تبقى أموالك تحت سيطرتك في جميع الأوقات."
                : "Kinetix never holds your funds. We do not have access to your private keys. You sign every transaction directly from your wallet (Phantom, Solflare, etc.). Your funds remain in your control at all times."}
            </p>
          </section>

          {/* Section 3 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">
              {locale === "ar" ? "💰 رسوم شفافة" : "💰 Transparent Fees"}
            </h2>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-2">
              {locale === "ar" ? (
                <>
                  <li><strong>رسوم المنصة:</strong> 0% خلال الإطلاق (الوضع المجاني).</li>
                  <li><strong>رسوم الشبكة:</strong> ~0.000005 SOL لكل معاملة (تدفع للمدققين).</li>
                  <li><strong>رسوم الأولوية:</strong> اختيارية (Eco/Balanced/Turbo) لتسريع المعاملات.</li>
                </>
              ) : (
                <>
                  <li><strong>Platform Fee:</strong> 0% during launch (Free Mode).</li>
                  <li><strong>Network Fee:</strong> ~0.000005 SOL per transaction (paid to Solana validators).</li>
                  <li><strong>Priority Fee:</strong> Optional (Eco/Balanced/Turbo) to speed up transactions.</li>
                </>
              )}
            </ul>
          </section>

          {/* Section 4 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">
              {locale === "ar" ? "⚡ شرح رسوم الأولوية" : "⚡ Priority Fees Explained"}
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {locale === "ar"
                ? "رسوم الأولوية هي إكراميات اختيارية تدفع للمدققين لإعطاء الأولوية لمعاملتك. Kinetix تجلب بيانات حية من شبكة سولانا وتقدم ثلاثة أوضاع:"
                : "Priority fees are optional tips paid to validators to prioritize your transaction. Kinetix fetches real-time data from the Solana network and offers three modes:"}
            </p>
            <ul className="list-disc list-inside text-sm text-slate-300 mt-2 space-y-1">
              <li><strong>Eco:</strong> {locale === "ar" ? "أقل تكلفة (P50)." : "Lowest cost (P50)."}</li>
              <li><strong>Balanced:</strong> {locale === "ar" ? "موصى به (P75)." : "Recommended (P75)."}</li>
              <li><strong>Turbo:</strong> {locale === "ar" ? "الأسرع (P90)." : "Fastest (P90)."}</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <h2 className="text-xl font-bold text-white mb-3">
              {locale === "ar" ? "❓ الأسئلة الشائعة" : "❓ Frequently Asked Questions"}
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-cyan-400">
                  {locale === "ar" ? "كيف أربط محفظتي؟" : "How do I connect my wallet?"}
                </h3>
                <p className="text-sm text-slate-400">
                  {locale === "ar"
                    ? "اضغط على \"Select Wallet\" في الزاوية العلوية اليمنى واختر Phantom أو Solflare أو أي محفظة متوافقة."
                    : "Click \"Select Wallet\" in the top right corner and choose Phantom, Solflare, or any Wallet Standard compatible wallet."}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-cyan-400">
                  {locale === "ar" ? "ما هو الحد الأقصى لحجم الدفعة؟" : "What is the maximum batch size?"}
                </h3>
                <p className="text-sm text-slate-400">
                  {locale === "ar"
                    ? "معاملات سولانا لها حد أقصى للحجم (~1232 بايت). Kinetix تقوم تلقائياً بتقسيم دفعتك إلى معاملات متعددة إذا لزم الأمر."
                    : "Solana transactions have a size limit (~1232 bytes). Kinetix automatically splits your batch into multiple transactions if needed."}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-cyan-400">
                  {locale === "ar" ? "هل تقومون بتخزين بياناتي؟" : "Do you store my data?"}
                </h3>
                <p className="text-sm text-slate-400">
                  {locale === "ar"
                    ? "دفتر العناوين والسجل الخاص بك يتم تخزينه محلياً في متصفحك (localStorage). نحن لا نخزن أي بيانات شخصية على خوادمنا."
                    : "Your address book and history are stored locally in your browser (localStorage). We do not store any personal data on our servers."}
                </p>
              </div>
            </div>
          </section>

          {/* Section 6 */}
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <h2 className="text-xl font-bold text-white mb-3">
              {locale === "ar" ? "📞 تحتاج مساعدة؟" : "📞 Need Help?"}
            </h2>
            <p className="text-sm text-slate-300">
              {locale === "ar"
                ? "انضم إلى مجتمع التليجرام للدعم والتحديثات."
                : "Join our Telegram community for support and updates."}
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