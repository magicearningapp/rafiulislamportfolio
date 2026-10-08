import React, { useState, useRef, ChangeEvent } from "react";
import {
  X,
  Printer,
  Download,
  Camera,
  CheckCheck,
  Palette,
  RotateCcw,
} from "lucide-react";
import { ProfileData, ContactData, SkillItem, TimelineItem, ProjectItem, CustomCvFileInfo } from "../types";
import { useThemeLanguage } from "../context/ThemeLanguageContext";
import { generateWordCvDocument } from "../lib/docxGenerator";
import { processUniversalPhoto } from "../lib/imageUtils";

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
  onUpdateProfile?: (updatedProfile: ProfileData) => void;
  contact: ContactData;
  skills?: SkillItem[];
  timeline?: TimelineItem[];
  projects?: ProjectItem[];
}

export default function ResumeModal({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  contact,
}: ResumeModalProps) {
  const { language } = useThemeLanguage();
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Style Mode: "color" (Royal Blue & Shaded Executive) or "classic" (Original Black & Gray)
  const [styleMode, setStyleMode] = useState<"color" | "classic">("color");

  // Loading states
  const [isGeneratingDocx, setIsGeneratingDocx] = useState<boolean>(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);

  // Feedback toast
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<string>("");

  if (!isOpen) return null;

  const pd = profile.cvPersonalDetails;
  const permAddr = pd?.permanentAddress || {
    name: "Md. Rafiul Islam",
    careOf: "Md. Shawkat Ali",
    village: "South Ramchandrapur",
    post: "Pabna",
    policeStation: "Pabna Sadar",
    district: "Pabna",
  };
  const presAddr = pd?.presentAddress || permAddr;

  // 1. Direct photo upload handler
  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      const processed = await processUniversalPhoto(file);
      const updatedProfile: ProfileData = {
        ...profile,
        photo: processed.base64,
      };

      if (onUpdateProfile) {
        onUpdateProfile(updatedProfile);
      }

      setCopied(true);
      setCopiedText(language === "bn" ? "আপনার ছবি সফলভাবে সিভিতে যুক্ত হয়েছে!" : "Photo updated successfully!");
      setTimeout(() => {
        setCopied(false);
        setCopiedText("");
      }, 3000);
    } catch (err: any) {
      console.error("Photo upload error:", err);
      alert("ছবি আপলোড করতে সমস্যা হয়েছে। অন্য ছবি সিলেক্ট করুন।");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // 2. Download genuine MS Word (.docx) document
  const handleDownloadWordDocx = async () => {
    try {
      setIsGeneratingDocx(true);
      const blob = await generateWordCvDocument(profile, contact);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Md_Rafiul_Islam_Curriculum_Vitae.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setCopied(true);
      setCopiedText(language === "bn" ? "Word (.docx) ফাইল ডাউনলোড সম্পন্ন!" : "Word (.docx) downloaded!");
      setTimeout(() => {
        setCopied(false);
        setCopiedText("");
      }, 3000);
    } catch (err) {
      console.error("Failed to generate docx:", err);
      alert("Could not generate Word document. Opening print view.");
      window.print();
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  // 3. Print
  const handlePrint = () => {
    window.print();
  };

  // Border & Header styles based on mode
  const isColor = styleMode === "color";
  const borderClass = isColor ? "border-2 border-[#1E40AF]" : "border-2 border-black";
  const innerBorderClass = isColor ? "border-[#1E40AF]" : "border-black";
  const headerShadingClass = isColor
    ? "bg-gradient-to-r from-[#1E40AF] to-[#2563EB] text-white"
    : "bg-[#D9D9D9] text-black";
  const leftColBg = isColor ? "bg-blue-50/70 text-[#1E3A8A]" : "bg-white text-black";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      <div className="relative bg-[#0F172A] rounded-2xl max-w-4xl w-full border-2 border-blue-500/50 shadow-[0_25px_60px_rgba(0,0,0,0.7)] overflow-hidden my-4 max-h-[96vh] flex flex-col print:max-h-none print:m-0 print:border-0 print:shadow-none print:w-full print:rounded-none">
        
        {/* ======================================================== */}
        {/* 1. TOP CONTROL BAR                                       */}
        {/* ======================================================== */}
        <div className="bg-[#1E293B] text-white px-4 sm:px-6 py-3 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden select-none">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center font-black text-white text-base shadow-md">
              W
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs sm:text-sm font-black tracking-wide text-white uppercase">
                  CURRICULUM VITAE — MD. RAFIUL ISLAM
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500 text-white shadow-xs">
                  .DOCX / PDF
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-medium">
                Phone: {contact.whatsapp || "+8801784-275274"} • Email: {contact.email || "rafiulislam125@gmail.com"}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* Color Mode Switcher */}
            <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => setStyleMode("color")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  styleMode === "color"
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {language === "bn" ? "কালারফুল স্টাইল" : "Vibrant Blue"}
              </button>
              <button
                onClick={() => setStyleMode("classic")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  styleMode === "classic"
                    ? "bg-slate-700 text-white shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {language === "bn" ? "অরিজিনাল B&W" : "Classic B&W"}
              </button>
            </div>

            {/* Direct Upload Photo Button */}
            <button
              onClick={() => photoInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-black px-3 py-2 rounded-xl transition-all shadow-md cursor-pointer hover:scale-105 border border-amber-300/40"
              title="Upload your own picture into the Picture frame"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>
                {isUploadingPhoto
                  ? (language === "bn" ? "আপলোড হচ্ছে..." : "Uploading...")
                  : (language === "bn" ? "আমার ছবি আপলোড" : "Upload Picture")}
              </span>
            </button>

            {/* Hidden Photo Input */}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            {/* Download MS Word (.docx) */}
            <button
              onClick={handleDownloadWordDocx}
              disabled={isGeneratingDocx}
              className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white text-xs font-black px-3.5 py-2 rounded-xl transition-all shadow-md cursor-pointer hover:scale-105 border border-blue-400/40"
              title="Download Genuine Microsoft Word Document (.docx)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {isGeneratingDocx
                  ? (language === "bn" ? "তৈরি হচ্ছে..." : "Generating...")
                  : (language === "bn" ? "ডাউনলোড Word (.docx)" : "Download Word (.docx)")}
              </span>
            </button>

            {/* Print / Save PDF */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-3 py-2 rounded-xl transition-all shadow-sm cursor-pointer hover:scale-105"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{language === "bn" ? "প্রিন্ট / PDF" : "Print / PDF"}</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
              aria-label="Close CV Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {copied && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-1.5 text-center transition-all print:hidden flex items-center justify-center space-x-2">
            <CheckCheck className="w-4 h-4" />
            <span>{copiedText || "সফল হয়েছে!"}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. THE EXACT BOXED CURRICULUM VITAE (PAGE 1 & PAGE 2)    */}
        {/* ======================================================== */}
        <div
          id="cv-printable-area"
          className="flex-1 overflow-y-auto p-3 sm:p-8 bg-[#0F172A] print:p-0 print:bg-white print:overflow-visible font-serif flex flex-col items-center space-y-8"
        >
          {/* ==================== PAGE 1 ==================== */}
          <div className="cv-sheet bg-white w-full max-w-[820px] shadow-[0_15px_40px_rgba(0,0,0,0.35)] rounded-sm p-6 sm:p-12 space-y-4 text-black border border-slate-300 text-xs sm:text-sm leading-normal print:border-0 print:shadow-none print:p-8 print:w-full print:max-w-none">
            
            {/* Header: Title, Contact & Double-Bordered Picture Box */}
            <div className="flex items-start justify-between gap-4 pb-2">
              <div className="flex-1 text-center pt-2">
                <h1 className={`text-xl sm:text-2xl font-black tracking-wide uppercase ${isColor ? "text-[#1E40AF]" : "text-black"}`}>
                  CURRICULUM VITAE
                </h1>
                <p className="text-sm italic font-serif py-0.5 text-slate-700">of</p>
                <h2 className={`text-lg sm:text-xl font-black tracking-wide ${isColor ? "text-[#1E3A8A]" : "text-black"}`}>
                  MD. RAFIUL ISLAM
                </h2>
                <p className="text-xs font-bold pt-1 text-slate-900">
                  Contact Phone: {contact.whatsapp || "+8801784-275274"}
                </p>
                <p className="text-xs font-bold text-slate-900">
                  E-mail:{" "}
                  <a
                    href={`mailto:${contact.email || "rafiulislam125@gmail.com"}`}
                    className="text-blue-700 underline font-normal"
                  >
                    {contact.email || "rafiulislam125@gmail.com"}
                  </a>
                </p>
              </div>

              {/* Picture Box: Exact Double Border from the PDF with Interactive Photo Upload! */}
              <div className="shrink-0 text-center group">
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className={`w-28 sm:w-32 h-36 sm:h-40 ${innerBorderClass} p-1 bg-white cursor-pointer relative shadow-xs transition-transform hover:scale-105`}
                  style={{
                    borderStyle: "double",
                    borderWidth: "4px",
                  }}
                  title="Click to upload your own picture"
                >
                  <div className={`w-full h-full border ${innerBorderClass} overflow-hidden flex flex-col items-center justify-center bg-slate-50 relative`}>
                    {profile.photo ? (
                      <img
                        src={profile.photo}
                        alt="Md. Rafiul Islam"
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <div className="text-center p-2 text-slate-700">
                        <Camera className="w-6 h-6 mx-auto mb-1 text-slate-500 animate-pulse" />
                        <span className="font-bold text-xs uppercase tracking-wider block">
                          Picture
                        </span>
                        <span className="text-[10px] text-blue-600 block mt-1">
                          Click to Upload
                        </span>
                      </div>
                    )}

                    {/* Hover change photo overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white p-1 text-center">
                      <Camera className="w-5 h-5 mb-1 text-amber-300" />
                      <span className="text-[10px] font-bold">
                        {language === "bn" ? "ছবি পরিবর্তন" : "Change Photo"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="mt-1 text-[10px] font-bold text-blue-700 hover:underline block mx-auto print:hidden cursor-pointer"
                >
                  {language === "bn" ? "ছবি আপলোড" : "Upload Picture"}
                </button>
              </div>
            </div>

            {/* Section 1: Objectives Career */}
            <div className={`border ${innerBorderClass} flex flex-col sm:flex-row shadow-2xs`}>
              <div className={`w-full sm:w-[28%] border-b sm:border-b-0 sm:border-r ${innerBorderClass} p-3 font-bold text-center flex items-center justify-center text-xs sm:text-sm ${leftColBg}`}>
                Objectives Career
              </div>
              <div className="flex-1 p-3.5 text-justify text-xs sm:text-sm leading-relaxed text-slate-900 bg-white">
                <span className={`font-serif mr-1.5 ${isColor ? "text-blue-700 font-bold" : ""}`}>❖</span>
                To work in an responsible position where I could use my Interpersonal skills, Creative and above all my learning experience in order to develop my career as well as to contribution in any sector.
              </div>
            </div>

            {/* Section 2: Educational Qualification Header */}
            <div className={`border ${innerBorderClass} ${headerShadingClass} font-bold text-center py-1.5 text-xs sm:text-sm uppercase tracking-wide shadow-2xs`}>
              Educational Qualification
            </div>

            {/* HSC Block */}
            <div className={`border ${innerBorderClass} -mt-4 border-t-0 flex flex-col sm:flex-row bg-white shadow-2xs`}>
              <div className={`w-full sm:w-[28%] border-b sm:border-b-0 sm:border-r ${innerBorderClass} p-3 font-bold text-center flex flex-col justify-center text-xs sm:text-sm ${leftColBg}`}>
                <span>Higher Secondary</span>
                <span>Certificate</span>
                <span>(H.S.C)</span>
              </div>
              <div className="flex-1 p-3.5 text-xs sm:text-sm space-y-1.5 text-slate-900">
                <div className="flex"><span className="w-32 font-bold text-slate-800"> Institute</span><span>: Shahid Bulbul Govt. College, Pabna</span></div>
                <div className="flex"><span className="w-32 font-bold text-slate-800"> Group</span><span>: Humanities</span></div>
                <div className="flex"><span className="w-32 font-bold text-slate-800"> Board</span><span>: Rajshahi</span></div>
                <div className="flex"><span className="w-32 font-bold text-slate-800"> Duration</span><span>: 2 Years</span></div>
                <div className="flex"><span className="w-32 font-bold text-slate-800"> Passing year</span><span>: 2013</span></div>
                <div className="flex items-center">
                  <span className="w-32 font-bold text-slate-800"> Result</span>
                  <span className={`font-bold ${isColor ? "text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200" : ""}`}>
                    : GPA- 3.40 out of 5.00
                  </span>
                </div>
              </div>
            </div>

            {/* SSC Block */}
            <div className={`border ${innerBorderClass} -mt-4 border-t-0 flex flex-col sm:flex-row bg-white shadow-2xs`}>
              <div className={`w-full sm:w-[28%] border-b sm:border-b-0 sm:border-r ${innerBorderClass} p-3 font-bold text-center flex flex-col justify-center text-xs sm:text-sm ${leftColBg}`}>
                <span>Secondary School</span>
                <span>Certificate</span>
                <span>(S.S.C)</span>
              </div>
              <div className="flex-1 p-3.5 text-xs sm:text-sm space-y-1.5 text-slate-900">
                <div className="flex"><span className="w-32 font-bold text-slate-800"> Institute</span><span>: Gopal Chandra Institution, Pabna</span></div>
                <div className="flex"><span className="w-32 font-bold text-slate-800"> Group</span><span>: Humanities</span></div>
                <div className="flex"><span className="w-32 font-bold text-slate-800"> Board</span><span>: Rajshahi</span></div>
                <div className="flex"><span className="w-32 font-bold text-slate-800"> Duration</span><span>: 2 Years</span></div>
                <div className="flex"><span className="w-32 font-bold text-slate-800"> Passing year</span><span>: 2011</span></div>
                <div className="flex items-center">
                  <span className="w-32 font-bold text-slate-800"> Result</span>
                  <span className={`font-bold ${isColor ? "text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200" : ""}`}>
                    : GPA- 4.19 out of 5.00
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Personal Information */}
            <div className={`border ${innerBorderClass} flex flex-col sm:flex-row bg-white shadow-2xs`}>
              <div className={`w-full sm:w-[28%] border-b sm:border-b-0 sm:border-r ${innerBorderClass} p-3 font-bold text-center flex flex-col justify-center text-xs sm:text-sm ${leftColBg}`}>
                <span>Personal</span>
                <span>Information</span>
              </div>
              <div className="flex-1 p-3.5 text-xs sm:text-sm space-y-1 text-slate-900">
                <div className="flex"><span className="w-36 font-bold text-slate-800"> Name</span><span>: Md. Rafiul Islam</span></div>
                <div className="flex"><span className="w-36 font-bold text-slate-800"> Father’s Name</span><span>: {pd?.fatherName || "Md. Shawkat Ali"}</span></div>
                <div className="flex"><span className="w-36 font-bold text-slate-800"> Mother’s Name</span><span>: {pd?.motherName || "Most. Shahana Begum"}</span></div>
                <div className="flex"><span className="w-36 font-bold text-slate-800"> Date of Birth</span><span>: {pd?.dateOfBirth || "1st December, 1996"}</span></div>
                <div className="flex"><span className="w-36 font-bold text-slate-800"> Nationality</span><span>: {pd?.nationality || "Bangladeshi (By birth)"}</span></div>
                <div className="flex"><span className="w-36 font-bold text-slate-800"> Religion</span><span>: {pd?.religion || "Islam (Sunni)"}</span></div>
                <div className="flex"><span className="w-36 font-bold text-slate-800"> Sex</span><span>: {pd?.gender || "Male"}</span></div>
                <div className="flex"><span className="w-36 font-bold text-slate-800"> Marital Status</span><span>: {pd?.maritalStatus || "Unmarried"}</span></div>
                <div className="flex"><span className="w-36 font-bold text-slate-800"> Height</span><span>: {pd?.height || "5'- 7\""}</span></div>
                <div className="flex"><span className="w-36 font-bold text-slate-800"> Weight</span><span>: {pd?.weight || "69 Kg"}</span></div>
                <div className="flex"><span className="w-36 font-bold text-slate-800"> Contact No</span><span className="font-bold text-blue-900">: {pd?.contactNo || "+8801701- 008254"}</span></div>
              </div>
            </div>

            {/* Page 1 indicator */}
            <div className="text-center text-[10px] text-slate-400 font-sans print:hidden pt-3 border-t border-slate-100">
              — Page 1 of 2 —
            </div>
          </div>

          {/* ==================== PAGE 2 ==================== */}
          <div className="cv-sheet bg-white w-full max-w-[820px] shadow-[0_15px_40px_rgba(0,0,0,0.35)] rounded-sm p-6 sm:p-12 space-y-4 text-black border border-slate-300 text-xs sm:text-sm leading-normal print:border-0 print:shadow-none print:p-8 print:w-full print:max-w-none break-before-page">
            
            {/* Permanent Address */}
            <div className={`border ${innerBorderClass} flex flex-col sm:flex-row bg-white shadow-2xs`}>
              <div className={`w-full sm:w-[28%] border-b sm:border-b-0 sm:border-r ${innerBorderClass} p-3 font-bold text-center flex items-center justify-center text-xs sm:text-sm ${leftColBg}`}>
                Permanent Address
              </div>
              <div className="flex-1 p-3.5 text-xs sm:text-sm space-y-1 text-slate-900">
                <div className="flex"><span className="w-28 font-bold text-slate-800"> Name</span><span>: {permAddr.name || "Md. Rafiul Islam"}</span></div>
                <div className="flex"><span className="w-28 font-bold text-slate-800"> C/O</span><span>: {permAddr.careOf || "Md. Shawkat Ali"}</span></div>
                <div className="flex"><span className="w-28 font-bold text-slate-800"> Vill</span><span>: {permAddr.village || "South Ramchandrapur"}</span></div>
                <div className="flex"><span className="w-28 font-bold text-slate-800"> Post</span><span>: {permAddr.post || "Pabna"}</span></div>
                <div className="flex"><span className="w-28 font-bold text-slate-800"> P.S</span><span>: {permAddr.policeStation || "Pabna Sadar"}</span></div>
                <div className="flex"><span className="w-28 font-bold text-slate-800"> Dist</span><span>: {permAddr.district || "Pabna"}</span></div>
              </div>
            </div>

            {/* Present Address */}
            <div className={`border ${innerBorderClass} flex flex-col sm:flex-row bg-white shadow-2xs`}>
              <div className={`w-full sm:w-[28%] border-b sm:border-b-0 sm:border-r ${innerBorderClass} p-3 font-bold text-center flex items-center justify-center text-xs sm:text-sm ${leftColBg}`}>
                Present Address
              </div>
              <div className="flex-1 p-3.5 text-xs sm:text-sm space-y-1 text-slate-900">
                <div className="flex"><span className="w-28 font-bold text-slate-800"> Name</span><span>: {presAddr.name || "Md. Rafiul Islam"}</span></div>
                <div className="flex"><span className="w-28 font-bold text-slate-800"> C/O</span><span>: {presAddr.careOf || "Md. Shawkat Ali"}</span></div>
                <div className="flex"><span className="w-28 font-bold text-slate-800"> Vill</span><span>: {presAddr.village || "South Ramchandrapur"}</span></div>
                <div className="flex"><span className="w-28 font-bold text-slate-800"> Post</span><span>: {presAddr.post || "Pabna"}</span></div>
                <div className="flex"><span className="w-28 font-bold text-slate-800"> P.S</span><span>: {presAddr.policeStation || "Pabna Sadar"}</span></div>
                <div className="flex"><span className="w-28 font-bold text-slate-800"> Dist</span><span>: {presAddr.district || "Pabna"}</span></div>
              </div>
            </div>

            {/* Language Skills Table */}
            <div className={`border ${innerBorderClass} shadow-2xs`}>
              <div className={`${headerShadingClass} font-bold text-center py-1.5 text-xs sm:text-sm border-b ${innerBorderClass} uppercase tracking-wide`}>
                Language Skills
              </div>
              <table className="w-full text-center text-xs sm:text-sm bg-white">
                <thead>
                  <tr className={`border-b ${innerBorderClass} font-bold ${isColor ? "bg-blue-50/50" : "bg-slate-50"}`}>
                    <th className={`p-2.5 border-r ${innerBorderClass} w-1/3 text-slate-900`}>Language</th>
                    <th className={`p-2.5 border-r ${innerBorderClass} w-1/3 text-slate-900`}>Writing /Reading</th>
                    <th className="p-2.5 w-1/3 text-slate-900">Spoken</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={`border-b ${innerBorderClass}`}>
                    <td className={`p-2.5 border-r ${innerBorderClass} font-bold text-slate-900`}>Bengali</td>
                    <td className={`p-2.5 border-r ${innerBorderClass} ${isColor ? "text-emerald-700 font-bold" : ""}`}>Excellent</td>
                    <td className={`p-2.5 ${isColor ? "text-emerald-700 font-bold" : ""}`}>Excellent</td>
                  </tr>
                  <tr>
                    <td className={`p-2.5 border-r ${innerBorderClass} font-bold text-slate-900`}>English</td>
                    <td className={`p-2.5 border-r ${innerBorderClass} ${isColor ? "text-blue-700 font-bold" : ""}`}>Good</td>
                    <td className={`p-2.5 ${isColor ? "text-blue-700 font-bold" : ""}`}>Good</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Interested */}
            <div className={`border ${innerBorderClass} flex flex-col sm:flex-row bg-white shadow-2xs`}>
              <div className={`w-full sm:w-[28%] border-b sm:border-b-0 sm:border-r ${innerBorderClass} p-3 font-bold text-center flex items-center justify-center text-xs sm:text-sm ${leftColBg}`}>
                Interested
              </div>
              <div className="flex-1 p-3.5 text-xs sm:text-sm text-slate-900">
                <span className="font-bold"> I have interested about sports, film, traveling, reading & the story etc.</span>
              </div>
            </div>

            {/* Hobby */}
            <div className={`border ${innerBorderClass} flex flex-col sm:flex-row bg-white shadow-2xs`}>
              <div className={`w-full sm:w-[28%] border-b sm:border-b-0 sm:border-r ${innerBorderClass} p-3 font-bold text-center flex items-center justify-center text-xs sm:text-sm ${leftColBg}`}>
                Hobby
              </div>
              <div className="flex-1 p-3.5 text-xs sm:text-sm text-slate-900">
                <span className="font-bold"> Reading Books and News Paper.</span>
              </div>
            </div>

            {/* Declaration */}
            <div className={`border ${innerBorderClass} flex flex-col sm:flex-row bg-white shadow-2xs`}>
              <div className={`w-full sm:w-[28%] border-b sm:border-b-0 sm:border-r ${innerBorderClass} p-3 font-bold text-center flex items-center justify-center text-xs sm:text-sm ${leftColBg}`}>
                Declaration
              </div>
              <div className="flex-1 p-3.5 text-justify text-xs sm:text-sm leading-relaxed text-slate-900">
                <span className="font-bold"> I, Undersigned certify that to the best of my knowledge and belief this resume correctly describes my qualifications and me. Any willful misstatement described herein may lead to my disqualification or dismissal, if employed.</span>
              </div>
            </div>

            {/* Signature & Date Box */}
            <div className="pt-6">
              <div className={`w-full sm:w-2/3 border ${innerBorderClass} text-xs sm:text-sm bg-white shadow-2xs`}>
                <div className={`flex border-b ${innerBorderClass}`}>
                  <div className={`w-32 border-r ${innerBorderClass} p-2.5 font-bold text-slate-900 ${leftColBg}`}>Signature</div>
                  <div className="flex-1 p-2.5 font-serif italic text-base text-blue-900 font-bold">
                    Md. Rafiul Islam
                  </div>
                </div>
                <div className="flex">
                  <div className={`w-32 border-r ${innerBorderClass} p-2.5 font-bold text-slate-900 ${leftColBg}`}>Date</div>
                  <div className="flex-1 p-2.5 font-sans text-slate-800">
                    {new Date().toLocaleDateString("en-GB")}
                  </div>
                </div>
              </div>
            </div>

            {/* Page 2 indicator */}
            <div className="text-center text-[10px] text-slate-400 font-sans print:hidden pt-4 border-t border-slate-100">
              — Page 2 of 2 —
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
