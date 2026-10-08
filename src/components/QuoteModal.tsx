import React, { useState } from "react";
import { X, Send, MessageCircle, CheckCircle2, Sparkles, DollarSign, Clock, Layers, Mail } from "lucide-react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useThemeLanguage } from "../context/ThemeLanguageContext";
import { safeSetLocalStorage, safeGetLocalStorage } from "../lib/storage";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber: string;
  emailAddress: string;
}

export default function QuoteModal({
  isOpen,
  onClose,
  whatsappNumber,
  emailAddress,
}: QuoteModalProps) {
  const { language, t } = useThemeLanguage();

  const [selectedServices, setSelectedServices] = useState<string[]>([
    "Social Media Management",
  ]);
  const [selectedBudget, setSelectedBudget] = useState<string>("$200 – $500 (৳২০,০০০ – ৳৫০,০০০)");
  const [selectedTimeline, setSelectedTimeline] = useState<string>("Ongoing Monthly Retainer");

  const [clientName, setClientName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [brief, setBrief] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const servicesList = [
    { id: "smm", name: "Social Media Management", bn: "সোশ্যাল মিডিয়া ম্যানেজমেন্ট" },
    { id: "content", name: "Content Creation & Copy", bn: "কন্টেন্ট তৈরি ও কপিরাইটিং" },
    { id: "video", name: "Reels & Video Editing", bn: "রিলস ও ভিডিও এডিটিং" },
    { id: "growth", name: "Organic Audience Growth", bn: "অর্গানিক অডিয়েন্স গ্রোথ" },
    { id: "photo", name: "Commercial Photography", bn: "কমার্শিয়াল ফটোগ্রাফি" },
    { id: "retainer", name: "Full Monthly Brand Retainer", bn: "ফুল মান্থলি রিটেইনার" },
  ];

  const budgetOptions = [
    { label: "< $200 (Below ৳20,000)", val: "< $200" },
    { label: "$200 – $500 (৳20,000 – ৳50,000)", val: "$200 – $500" },
    { label: "$500 – $1,000 (৳50,000 – ৳1,00,000)", val: "$500 – $1,000" },
    { label: "$1,000+ (৳1,00,000+)", val: "$1,000+" },
  ];

  const timelineOptions = [
    { label: language === "bn" ? "জরুরি (১–২ সপ্তাহ)" : "Urgent (1–2 weeks)", val: "1-2 weeks" },
    { label: language === "bn" ? "১ মাসের ক্যাম্পেইন" : "1 Month Campaign", val: "1 Month" },
    { label: language === "bn" ? "মাসিক রিটেইনার (চলমান)" : "Monthly Retainer (Ongoing)", val: "Monthly Retainer" },
  ];

  const toggleService = (name: string) => {
    if (selectedServices.includes(name)) {
      if (selectedServices.length > 1) {
        setSelectedServices(selectedServices.filter((s) => s !== name));
      }
    } else {
      setSelectedServices([...selectedServices, name]);
    }
  };

  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, "");

  const generateMessageText = () => {
    return `*Project Inquiry / Quote Request for Md. Rafiul Islam*
---------------------------------------
👤 *Client:* ${clientName || "Prospective Client"}
🏢 *Brand:* ${brandName || "Not specified"}
✉️ *Email:* ${email || "Not specified"}
📱 *Contact:* ${phone || "Not specified"}

🛠️ *Services Needed:*
${selectedServices.map((s) => `• ${s}`).join("\n")}

💰 *Budget:* ${selectedBudget}
⏱️ *Timeline:* ${selectedTimeline}

📝 *Project Brief:*
${brief || "Looking forward to discussing project scope and rates."}
---------------------------------------
Sent via portfolio project estimator.`;
  };

  const handleSendWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = generateMessageText();
    const encoded = encodeURIComponent(text);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;

    // Record inquiry to Firestore / localStorage
    saveInquiryToDatabase();

    window.open(waUrl, "_blank");
    setIsSubmitted(true);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = generateMessageText();
    const subject = encodeURIComponent(`Project Proposal Request — ${clientName || "Client"} (${brandName || "Brand"})`);
    const body = encodeURIComponent(text);
    const mailtoUrl = `mailto:${emailAddress}?subject=${subject}&body=${body}`;

    saveInquiryToDatabase();
    window.location.href = mailtoUrl;
    setIsSubmitted(true);
  };

  const saveInquiryToDatabase = async () => {
    const payload = {
      clientName: clientName || "Anonymous Client",
      brandName: brandName || "",
      email: email || "",
      phone: phone || "",
      services: selectedServices,
      budget: selectedBudget,
      timeline: selectedTimeline,
      brief: brief || "",
      createdAt: new Date().toISOString(),
    };

    try {
      // Local storage backup
      const existing = JSON.parse(safeGetLocalStorage("raf_inquiries") || "[]");
      safeSetLocalStorage("raf_inquiries", JSON.stringify([payload, ...existing]));

      // Save to Firestore
      await addDoc(collection(db, "project_inquiries"), payload);
    } catch (err) {
      console.error("Error saving project inquiry:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-3xl max-w-2xl w-full border border-[#8FAF72]/40 shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#173522] text-white px-6 py-5 flex items-center justify-between border-b border-[#8FAF72]/30 shrink-0">
          <div className="space-y-0.5">
            <div className="inline-flex items-center space-x-1.5 text-xs text-[#8FAF72] font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === "bn" ? "প্রজেক্ট কোটেশন" : "Fast Quote Estimator"}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              {t.quoteModal.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSubmitted ? (
          <div className="p-8 sm:p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#172117]">
              {language === "bn" ? "প্রস্তাবনা পাঠানো হয়েছে!" : "Inquiry Prepared & Sent!"}
            </h3>
            <p className="text-sm text-[#4E5E4E] max-w-md mx-auto">
              {t.quoteModal.successMsg}
            </p>
            <div className="pt-4">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  onClose();
                }}
                className="bg-[#2F5D3A] text-white font-semibold text-xs px-6 py-2.5 rounded-xl hover:bg-[#1F452B] transition-colors cursor-pointer"
              >
                {t.quoteModal.closeBtn}
              </button>
            </div>
          </div>
        ) : (
          <form className="p-6 sm:p-8 overflow-y-auto space-y-6 text-[#172117]">
            {/* Step 1: Select Services */}
            <div className="space-y-2.5">
              <label className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#2F5D3A]">
                <Layers className="w-3.5 h-3.5" />
                <span>{t.quoteModal.servicesTitle}</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {servicesList.map((service) => {
                  const isChecked = selectedServices.includes(service.name);
                  return (
                    <button
                      type="button"
                      key={service.id}
                      onClick={() => toggleService(service.name)}
                      className={`text-left px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? "bg-[#2F5D3A] text-white border-[#2F5D3A] shadow-xs"
                          : "bg-white text-[#172117] border-[#8FAF72]/30 hover:border-[#8FAF72]"
                      }`}
                    >
                      <span>{language === "bn" ? service.bn : service.name}</span>
                      <CheckCircle2
                        className={`w-3.5 h-3.5 shrink-0 ml-2 ${
                          isChecked ? "text-[#8FAF72]" : "text-transparent"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Budget & Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#2F5D3A]">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>{t.quoteModal.budgetTitle}</span>
                </label>
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#8FAF72]/40 rounded-xl text-xs text-[#172117] focus:outline-hidden focus:border-[#2F5D3A]"
                >
                  {budgetOptions.map((b, idx) => (
                    <option key={idx} value={b.label}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#2F5D3A]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t.quoteModal.timelineTitle}</span>
                </label>
                <select
                  value={selectedTimeline}
                  onChange={(e) => setSelectedTimeline(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#8FAF72]/40 rounded-xl text-xs text-[#172117] focus:outline-hidden focus:border-[#2F5D3A]"
                >
                  {timelineOptions.map((tl, idx) => (
                    <option key={idx} value={tl.label}>
                      {tl.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 3: Contact Details */}
            <div className="space-y-3 pt-2 border-t border-[#8FAF72]/30">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2F5D3A]">
                {t.quoteModal.detailsTitle}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder={t.quoteModal.namePlaceholder}
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#8FAF72]/35 rounded-xl text-xs text-[#172117] placeholder:text-[#4E5E4E]/60 focus:outline-hidden focus:border-[#2F5D3A]"
                  required
                />
                <input
                  type="text"
                  placeholder={t.quoteModal.brandPlaceholder}
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#8FAF72]/35 rounded-xl text-xs text-[#172117] placeholder:text-[#4E5E4E]/60 focus:outline-hidden focus:border-[#2F5D3A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="email"
                  placeholder={t.quoteModal.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#8FAF72]/35 rounded-xl text-xs text-[#172117] placeholder:text-[#4E5E4E]/60 focus:outline-hidden focus:border-[#2F5D3A]"
                  required
                />
                <input
                  type="tel"
                  placeholder={t.quoteModal.phonePlaceholder}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#8FAF72]/35 rounded-xl text-xs text-[#172117] placeholder:text-[#4E5E4E]/60 focus:outline-hidden focus:border-[#2F5D3A]"
                  required
                />
              </div>

              <textarea
                rows={3}
                placeholder={t.quoteModal.briefPlaceholder}
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-[#8FAF72]/35 rounded-xl text-xs text-[#172117] placeholder:text-[#4E5E4E]/60 focus:outline-hidden focus:border-[#2F5D3A]"
              />
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-[#8FAF72]/30 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.quoteModal.sendWhatsappBtn}</span>
              </button>

              <button
                type="button"
                onClick={handleSendEmail}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-[#2F5D3A] hover:bg-[#1F452B] text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>{t.quoteModal.sendEmailBtn}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
