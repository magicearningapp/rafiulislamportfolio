import { useState } from "react";
import {
  Mail,
  MessageCircle,
  Phone,
  Youtube,
  Facebook,
  Instagram,
  Linkedin,
  Copy,
  Check,
  ArrowUpRight,
  Share2,
} from "lucide-react";
import { motion } from "motion/react";
import { ContactData, ProfileData } from "../types";
import { useThemeLanguage } from "../context/ThemeLanguageContext";

interface ContactProps {
  contact: ContactData;
  profile?: ProfileData;
}

export default function Contact({ contact, profile }: ContactProps) {
  const { t, language } = useThemeLanguage();
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    if (contact.email) {
      navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Direct Communication / Inquiry Methods from CV
  const contactMethods = [
    {
      name: "Primary WhatsApp / Call",
      description: "Direct instant chat & phone inquiries",
      value: contact.whatsapp || "+8801784-275274",
      href: contact.whatsapp?.startsWith("http")
        ? contact.whatsapp
        : `https://wa.me/${(contact.whatsapp || "+8801784275274").replace(/[^0-9]/g, "")}`,
      icon: <MessageCircle className="w-5 h-5 text-emerald-600" />,
      actionText: "Send Message",
    },
    {
      name: "Direct Mobile Call",
      description: "Secondary official mobile contact",
      value: contact.secondaryPhone || "+8801701- 008254",
      href: `tel:${(contact.secondaryPhone || "+8801701008254").replace(/[^0-9]/g, "")}`,
      icon: <Phone className="w-5 h-5 text-amber-600" />,
      actionText: "Call Now",
    },
    {
      name: "Email",
      description: "Official proposals & collaboration inquiries",
      value: contact.email || "rafiulislam125@gmail.com",
      href: `mailto:${contact.email || "rafiulislam125@gmail.com"}`,
      icon: <Mail className="w-5 h-5 text-blue-600" />,
      actionText: "Send Email",
      isEmail: true,
    },
    {
      name: "Facebook",
      description: "Connect on Facebook for updates & messaging",
      value: "Visit Facebook Profile",
      href: contact.facebook.startsWith("http")
        ? contact.facebook
        : `https://${contact.facebook}`,
      icon: <Facebook className="w-5 h-5 text-blue-700" />,
      actionText: "Follow / Connect",
    },
  ];

  // Social Media Profile Links defined in Profile Data (Facebook, Instagram, LinkedIn)
  const facebookUrl =
    profile?.socials?.facebook ||
    profile?.facebook ||
    contact.facebook ||
    "https://facebook.com";

  const instagramUrl =
    profile?.socials?.instagram ||
    profile?.instagram ||
    "https://instagram.com/rafiulislam";

  const linkedinUrl =
    profile?.socials?.linkedin ||
    profile?.linkedin ||
    "https://linkedin.com/in/rafiulislam";

  const socialProfiles = [
    {
      name: "Facebook",
      handle: facebookUrl.replace(/^https?:\/\/(www\.)?facebook\.com\/?/, "@").replace(/\/$/, "") || "@rafiulislam",
      url: facebookUrl.startsWith("http") ? facebookUrl : `https://${facebookUrl}`,
      icon: <Facebook className="w-5 h-5 text-[#1877F2]" />,
      badge: "Social Media",
      tagline: "Community & updates",
      actionText: "Follow on Facebook",
      borderColor: "hover:border-[#1877F2]/50",
    },
    {
      name: "Instagram",
      handle: instagramUrl.replace(/^https?:\/\/(www\.)?instagram\.com\/?/, "@").replace(/\/$/, "") || "@rafiulislam",
      url: instagramUrl.startsWith("http") ? instagramUrl : `https://${instagramUrl}`,
      icon: <Instagram className="w-5 h-5 text-[#E1306C]" />,
      badge: "Visuals & Reels",
      tagline: "Shorts, photography & stories",
      actionText: "Connect on Instagram",
      borderColor: "hover:border-[#E1306C]/50",
    },
    {
      name: "LinkedIn",
      handle: linkedinUrl.replace(/^https?:\/\/(www\.)?linkedin\.com\/(in\/)?/, "@").replace(/\/$/, "") || "@rafiulislam",
      url: linkedinUrl.startsWith("http") ? linkedinUrl : `https://${linkedinUrl}`,
      icon: <Linkedin className="w-5 h-5 text-[#0A66C2]" />,
      badge: "Professional",
      tagline: "Career milestones & networking",
      actionText: "Connect on LinkedIn",
      borderColor: "hover:border-[#0A66C2]/50",
    },
  ];

  return (
    <section id="contact" className="py-20 md:py-28 px-6 sm:px-8 border-b border-[#8FAF72]/30 relative">
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px", amount: 0.15 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl mx-auto space-y-12"
      >
        {/* Main Section Header */}
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-[#467A4A] dark:text-[#A3E699]">
            {t.contact.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#172117] dark:text-white glow-heading">
            {t.contact.title}
          </h2>
          <p className="text-[#4E5E4E] dark:text-[#DCE8DD] text-sm sm:text-base max-w-xl font-medium">
            {t.contact.subtitle}
          </p>
        </div>

        {/* Direct Contact Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {contactMethods.map((method, index) => (
            <motion.div
              key={method.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: (index % 2) * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/95 dark:bg-[#0F2013] border border-[#8FAF72]/35 dark:border-[#8FAF72]/50 rounded-2xl p-6 flex flex-col justify-between space-y-5 hover:border-[#8FAF72] hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(143,175,114,0.25)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-[#F4F1E6] dark:bg-[#16331E] text-[#2F5D3A] dark:text-[#A3E699] border border-[#8FAF72]/30 dark:border-[#8FAF72]/50 rounded-lg inline-block">
                    {method.icon}
                  </div>
                  {method.isEmail && (
                    <button
                      onClick={handleCopyEmail}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-[#4E5E4E] dark:text-zinc-200 hover:text-[#172117] dark:hover:text-white bg-white dark:bg-[#122617] border border-[#8FAF72]/35 dark:border-[#8FAF72]/50 hover:border-[#8FAF72] px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                      title="Copy Email Address"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#2F5D3A] dark:text-[#A3E699]" />
                          <span className="text-[#2F5D3A] dark:text-[#A3E699]">{t.contact.copiedBtn}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{t.contact.copyBtn}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#172117] dark:text-white">{method.name}</h3>
                  <p className="text-xs text-[#4E5E4E] dark:text-[#DCE8DD] mt-0.5">{method.description}</p>
                </div>
              </div>

              <a
                href={method.href}
                target={method.isEmail ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="inline-flex items-center justify-between text-xs font-bold text-[#172117] dark:text-white bg-[#F4F1E6] dark:bg-[#162D1D] hover:bg-[#8FAF72]/20 dark:hover:bg-[#1E3F27] border border-[#8FAF72]/35 dark:border-[#8FAF72]/50 px-4 py-2.5 rounded-lg transition-colors group"
              >
                <span className="truncate pr-2">{method.value}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-[#4E5E4E] dark:text-[#A3E699] group-hover:text-[#172117] dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </motion.div>
          ))}
        </div>

        {/* Dedicated Socials Section (Facebook, Instagram, LinkedIn from profile data) */}
        <div className="pt-8 border-t border-[#8FAF72]/30 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#173522] text-[#8FAF72] text-[11px] font-semibold tracking-wide">
                <Share2 className="w-3.5 h-3.5 text-[#8FAF72]" />
                <span className="uppercase tracking-wider">{t.contact.socialsBadge}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#172117]">
                {t.contact.socialsTitle}
              </h3>
            </div>
            <p className="text-xs text-[#4E5E4E] max-w-sm sm:text-right">
              {t.contact.socialsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {socialProfiles.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`group relative bg-white/95 backdrop-blur-md border border-[#8FAF72]/35 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${social.borderColor}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 bg-[#F4F1E6] rounded-xl border border-[#8FAF72]/30 text-[#172117] group-hover:scale-105 transition-transform">
                      {social.icon}
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#173522]/5 text-[#2F5D3A] border border-[#8FAF72]/30">
                      {social.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-[#172117] flex items-center space-x-1.5">
                      <span>{social.name}</span>
                    </h4>
                    <p className="text-xs text-[#4E5E4E] mt-0.5 line-clamp-1">
                      {social.tagline}
                    </p>
                    <p className="text-[11px] font-mono text-[#2F5D3A] font-semibold truncate mt-1">
                      {social.handle}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-[#8FAF72]/25 flex items-center justify-between text-xs font-semibold text-[#2F5D3A] group-hover:text-[#173522]">
                  <span>{social.actionText}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
