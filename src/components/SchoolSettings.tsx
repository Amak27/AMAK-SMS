import React, { useState, useEffect } from "react";
import { 
  Settings, 
  Save, 
  Upload, 
  Sparkles, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  BookOpen, 
  Activity, 
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Server,
  Plus,
  Trash2,
  Edit3
} from "lucide-react";
import { SchoolSettings as SettingsType, SystemUser } from "../types";

// Dynamic Ugandan School Crest SVG Presets representing traditional motifs
export const CREST_PRESETS = [
  {
    id: "crest-shield-laurel",
    name: "Classic Academic Shield & Laurel",
    svg: `<svg viewBox="0 0 100 100" class="w-12 h-12 text-blue-600" fill="currentColor">
      <path d="M50 5 L85 20 C85 55, 50 85, 50 95 C50 85, 15 55, 15 20 L50 5 Z" fill="none" stroke="currentColor" stroke-width="4"></path>
      <path d="M50 15 L50 80" stroke="currentColor" stroke-width="2" stroke-dasharray="2 2"></path>
      <rect x="35" y="30" width="30" height="20" rx="3" fill="currentColor" opacity="0.15"></rect>
      <path d="M38 30 Q50 35 62 30" stroke="currentColor" stroke-width="3" fill="none"></path>
      <path d="M38 40 L62 40 M38 45 L62 45" stroke="currentColor" stroke-width="2" fill="none"></path>
      <circle cx="50" cy="65" r="4" fill="currentColor"></circle>
    </svg>`
  },
  {
    id: "crest-enlightened-sun",
    name: "Golden Sun of Wisdom",
    svg: `<svg viewBox="0 0 100 100" class="w-12 h-12 text-amber-600" fill="currentColor">
      <circle cx="50" cy="50" r="22" fill="none" stroke="currentColor" stroke-width="4"></circle>
      <path d="M50 10 L50 22 M50 78 L50 90 M10 50 L22 50 M78 50 L90 50 M21 21 L30 30 M70 70 L79 79 M79 21 L70 30 M30 70 L21 79" stroke="currentColor" stroke-width="4" stroke-linecap="round"></path>
      <rect x="38" y="44" width="24" height="12" rx="2" fill="currentColor" fill-opacity="0.25"></rect>
    </svg>`
  },
  {
    id: "crest-anchor-crown",
    name: "Anchor of Truth & Excellence",
    svg: `<svg viewBox="0 0 100 100" class="w-12 h-12 text-teal-600" fill="currentColor">
      <path d="M50 15 L50 75 M30 50 L70 50" stroke="currentColor" stroke-width="5" stroke-linecap="round"></path>
      <path d="M25 55 C25 80, 75 80, 75 55" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"></path>
      <polygon points="40,25 50,15 60,25 55,30 45,30" fill="currentColor" opacity="0.3"></polygon>
    </svg>`
  },
  {
    id: "crest-torch-africa",
    name: "Modern African Star Crest",
    svg: `<svg viewBox="0 0 100 100" class="w-12 h-12 text-red-600" fill="currentColor">
      <polygon points="50,10 62,38 92,38 68,56 78,85 50,67 22,85 32,56 8,38 38,38" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"></polygon>
      <circle cx="50" cy="46" r="10" fill="currentColor" opacity="0.25"></circle>
    </svg>`
  }
];

// High fidelity SVG rubber-stamp presets for school verification
export const STAMP_PRESETS = [
  {
    id: "stamp-circular-approved",
    name: "Official Round Stamp",
    svg: `<svg viewBox="0 0 100 100" class="w-12 h-12 text-blue-700 font-bold" fill="currentColor">
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="2 1"></circle>
      <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="1.5"></circle>
      <text x="50" y="28" font-size="6" font-family="monospace" font-weight="bold" text-anchor="middle">OFFICIAL STAMP</text>
      <text x="50" y="80" font-size="5" font-family="monospace" font-weight="bold" text-anchor="middle">UGANDA EDUCATION BOARD</text>
      <path d="M 18 50 L 82 50" stroke="currentColor" stroke-width="1.5"></path>
      <text x="50" y="45" font-size="7" font-family="sans-serif" font-weight="900" text-anchor="middle">PASSED</text>
      <text x="50" y="60" font-size="6.5" font-family="sans-serif" font-weight="bold" text-anchor="middle" fill="currentColor" opacity="0.8">HEAD TEACHER</text>
    </svg>`
  },
  {
    id: "stamp-oval-verified",
    name: "Oval Registry Stamp",
    svg: `<svg viewBox="0 0 100 100" class="w-12 h-12 text-indigo-700 font-bold" fill="currentColor">
      <ellipse cx="50" cy="50" rx="46" ry="36" fill="none" stroke="currentColor" stroke-width="3"></ellipse>
      <ellipse cx="50" cy="50" rx="40" ry="30" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="4 2"></ellipse>
      <text x="50" y="32" font-size="6" font-family="monospace" font-weight="extrabold" text-anchor="middle">REGISTRY OFFICE</text>
      <text x="50" y="74" font-size="5" font-family="monospace" font-weight="bold" text-anchor="middle">VERIFIED AS ORIGINAL</text>
      <text x="50" y="54" font-size="9" font-family="sans-serif" font-weight="950" text-anchor="middle" letter-spacing="1">ISSUED</text>
    </svg>`
  },
  {
    id: "stamp-shield-verified",
    name: "Excellence Seal Stamp",
    svg: `<svg viewBox="0 0 100 100" class="w-12 h-12 text-teal-800 font-bold" fill="currentColor">
      <path d="M50 5 L88 20 Q88 55 50 90 Q12 55 12 20 Z" fill="none" stroke="currentColor" stroke-width="3"></path>
      <path d="M50 11 L80 23 Q80 50 50 80 Q20 50 20 23 Z" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="3 1"></path>
      <text x="50" y="40" font-size="6" font-family="sans-serif" font-weight="bold" text-anchor="middle">APPROVED</text>
      <circle cx="50" cy="54" r="6" fill="none" stroke="currentColor" stroke-width="1.5"></circle>
      <text x="50" y="70" font-size="5" font-family="monospace" text-anchor="middle">DEPUTY ACADEMICS</text>
    </svg>`
  }
];

interface SchoolSettingsProps {
  user: SystemUser;
  onSettingsSaved: () => void;
}

export default function SchoolSettingsComponent({ user, onSettingsSaved }: SchoolSettingsProps) {
  const [activeSettingsTab, setActiveSettingsTab] = useState<"identity" | "smtp" | "templates">("identity");

  const [settings, setSettings] = useState<SettingsType>({
    schoolName: "",
    motto: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    logoUrl: "",
    showLogo: true,
    stampUrl: "",
    showStamp: true,
    termName: "TERM 2",
    academicYear: 2024,
    nextTermCommences: "2024-09-02",
    termEndedOn: "2024-08-16",
    smtpHost: "smtp.mailtrap.io",
    smtpPort: 2525,
    smtpUsername: "academix-system-gateway",
    smtpPassword: "smtp-password-token",
    smtpSenderName: "School Administration Terminal",
    smtpSenderEmail: "noreply@sharebility.net",
    smtpSecurity: "STARTTLS",
    emailTemplates: []
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [dragActiveLogo, setDragActiveLogo] = useState(false);
  const [dragActiveStamp, setDragActiveStamp] = useState(false);

  // Load current settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSettings(prev => ({
            ...prev,
            ...data,
            stampUrl: data.stampUrl || prev.stampUrl || "",
            showStamp: data.showStamp !== undefined ? data.showStamp : prev.showStamp,
            nextTermCommences: data.nextTermCommences || prev.nextTermCommences || "2024-09-02",
            termEndedOn: data.termEndedOn || prev.termEndedOn || "2024-08-16",
            smtpHost: data.smtpHost || prev.smtpHost || "smtp.mailtrap.io",
            smtpPort: data.smtpPort || prev.smtpPort || 2525,
            smtpUsername: data.smtpUsername || prev.smtpUsername || "academix-system-gateway",
            smtpPassword: data.smtpPassword || prev.smtpPassword || "smtp-password-token",
            smtpSenderName: data.smtpSenderName || prev.smtpSenderName || "School Administration Terminal",
            smtpSenderEmail: data.smtpSenderEmail || prev.smtpSenderEmail || "noreply@sharebility.net",
            smtpSecurity: data.smtpSecurity || prev.smtpSecurity || "STARTTLS",
            emailTemplates: data.emailTemplates || prev.emailTemplates || []
          }));
        }
      } catch (err) {
        console.error("Failed to fetch settings from API:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Save settings via API
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings.schoolName.trim()) {
      setErrorMsg("School name is a required field.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        onSettingsSaved();
      } else {
        setErrorMsg("Failed to store changes on Academix servers.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error occurred while saving school details.");
    } finally {
      setSaving(false);
    }
  };

  // Convert uploaded image file to Base64 String
  const processImageFile = (file: File, type: "logo" | "stamp") => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("Unrecognized format. Please select an image file (.png, .jpg, .svg).");
      return;
    }

    // Limit to under 1.5MB for local storage compatibility
    if (file.size > 1.5 * 1024 * 1024) {
      setErrorMsg("The image size exceeds the 1.5MB quota.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        if (type === "logo") {
          setSettings(prev => ({
            ...prev,
            logoUrl: e.target!.result as string
          }));
        } else {
          setSettings(prev => ({
            ...prev,
            stampUrl: e.target!.result as string
          }));
        }
        setErrorMsg(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "logo" | "stamp") => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0], type);
    }
  };

  const handleDrag = (e: React.DragEvent, type: "logo" | "stamp") => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      if (type === "logo") setDragActiveLogo(true);
      else setDragActiveStamp(true);
    } else if (e.type === "dragleave") {
      if (type === "logo") setDragActiveLogo(false);
      else setDragActiveStamp(false);
    }
  };

  const handleDrop = (e: React.DragEvent, type: "logo" | "stamp") => {
    e.preventDefault();
    e.stopPropagation();
    if (type === "logo") setDragActiveLogo(false);
    else setDragActiveStamp(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0], type);
    }
  };

  const selectPresetLogo = (presetId: string) => {
    setSettings(prev => ({
      ...prev,
      logoUrl: presetId
    }));
  };

  const selectPresetStamp = (presetId: string) => {
    setSettings(prev => ({
      ...prev,
      stampUrl: presetId
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 font-medium">
        Syncing school configurations and logo assets...
      </div>
    );
  }

  // Check if role is Teacher (Teachers can view but only Admin can edit settings)
  const isViewOnly = user.role === "Teacher";

  return (
    <div className="space-y-6">
      
      {/* Overview Card header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="text-blue-600 animate-spin-slow" size={24} />
            School Details & ERP Settings
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Configure dynamic headers, branding info, terms, and custom logos reflected in all child report cards.
          </p>
        </div>

        {isViewOnly && (
          <div className="px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-700 text-xs font-semibold">
            Role Indicator: View-Only (Read-Only Portal)
          </div>
        )}
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3">
          <CheckCircle className="text-emerald-600 shrink-0" size={18} />
          <p className="text-xs font-semibold">Branding and school parameters stored successfully! Report cards was updated in real-time.</p>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="text-red-600 shrink-0" size={18} />
          <p className="text-xs font-semibold">{errorMsg}</p>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 mb-6 no-print">
        <button
          type="button"
          onClick={() => setActiveSettingsTab("identity")}
          className={`px-4 py-2 border-b-2 font-bold text-xs select-none cursor-pointer transition-all ${
            activeSettingsTab === "identity"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          School branding & ID
        </button>
        <button
          type="button"
          onClick={() => setActiveSettingsTab("smtp")}
          className={`px-4 py-2 border-b-2 font-bold text-xs select-none cursor-pointer transition-all ${
            activeSettingsTab === "smtp"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          SMTP Mail Server
        </button>
        <button
          type="button"
          onClick={() => setActiveSettingsTab("templates")}
          className={`px-4 py-2 border-b-2 font-bold text-xs select-none cursor-pointer transition-all ${
            activeSettingsTab === "templates"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          Email Auto-Templates
        </button>
      </div>

      {activeSettingsTab === "identity" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Logo and stamp settings panels (as a unified side column list) */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Card 1: Logo/Crest */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono flex items-center gap-1">
              <ImageIcon size={14} className="text-blue-500" />
              School Crest / Logo Asset
            </span>

            {/* Logo visualizer */}
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              {settings.logoUrl ? (
                <div className="space-y-3 w-full">
                  <div className="w-24 h-24 mx-auto bg-white border border-slate-200 shadow rounded-xl p-3 flex items-center justify-center">
                    {settings.logoUrl.startsWith("crest-") ? (
                      <div 
                        className="text-blue-700"
                        dangerouslySetInnerHTML={{ 
                          __html: CREST_PRESETS.find(p => p.id === settings.logoUrl)?.svg || "" 
                        }} 
                      />
                    ) : (
                      <img 
                        src={settings.logoUrl} 
                        alt="School logo upload" 
                        className="max-w-full max-h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Crest Is Active</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono truncate">
                      {settings.logoUrl.startsWith("crest-") ? "Built-In Scalable Vector" : "Custom Base64 Picture"}
                    </p>
                  </div>
                  {!isViewOnly && (
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, logoUrl: "" }))}
                      className="text-[10.5px] font-bold text-red-600 mt-2 block hover:underline cursor-pointer mx-auto"
                    >
                      Clear Logo
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-slate-400 space-y-2">
                  <div className="w-16 h-16 bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                    <Upload size={24} />
                  </div>
                  <p className="text-xs font-semibold mt-1">No School Crest Configured</p>
                  <p className="text-[10px] text-slate-400">Default icons will serve inside template headers</p>
                </div>
              )}
            </div>

            {!isViewOnly && (
              <>
                {/* Image Drag and Drop block */}
                <div 
                  onDragEnter={(e) => handleDrag(e, "logo")}
                  onDragOver={(e) => handleDrag(e, "logo")}
                  onDragLeave={(e) => handleDrag(e, "logo")}
                  onDrop={(e) => handleDrop(e, "logo")}
                  className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer select-none relative
                    ${dragActiveLogo ? "border-blue-500 bg-blue-50/50" : "border-slate-200 bg-slate-50/20 hover:bg-slate-50/50"}`}
                >
                  <input
                    type="file"
                    id="settings-logo-input"
                    onChange={(e) => handleFileChange(e, "logo")}
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload size={18} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-slate-700">Drag & Drop Logo Image</p>
                  <p className="text-[9.5px] text-slate-400/90 mt-0.5">Or tap here to browse local storage (PNG, JPG, SVG)</p>
                </div>

                {/* Presets Grid */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-semibold font-mono tracking-wider text-slate-400">
                    Select a Preset Crest
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {CREST_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => selectPresetLogo(preset.id)}
                        className={`p-3 bg-white border rounded-xl flex flex-col items-center justify-center gap-1 text-center hover:bg-slate-50/60 active:scale-[0.98] transition-all cursor-pointer
                          ${settings.logoUrl === preset.id ? "border-blue-500 ring-2 ring-blue-50 ring-offset-0" : "border-slate-200"}`}
                      >
                        <div dangerouslySetInnerHTML={{ __html: preset.svg }} />
                        <span className="text-[9px] font-bold text-slate-600 truncate w-full mt-1">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visibility Checkbox */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <input
                    type="checkbox"
                    id="showLogo-toggle"
                    checked={settings.showLogo}
                    onChange={(e) => setSettings(prev => ({ ...prev, showLogo: e.target.checked }))}
                    className="rounded border-slate-350 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="showLogo-toggle" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    Display school crest in printed report headers
                  </label>
                </div>
              </>
            )}
          </div>

          {/* Card 2: Verification Stamp */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono flex items-center gap-1">
              <Sparkles size={14} className="text-purple-500" />
              School Verification Stamp
            </span>

            {/* Stamp visualizer */}
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
              {settings.stampUrl ? (
                <div className="space-y-3 w-full">
                  <div className="w-24 h-24 mx-auto bg-white border border-slate-200 shadow rounded-full p-2 flex items-center justify-center">
                    {settings.stampUrl.startsWith("stamp-") ? (
                      <div 
                        dangerouslySetInnerHTML={{ 
                          __html: STAMP_PRESETS.find(p => p.id === settings.stampUrl)?.svg || "" 
                        }} 
                      />
                    ) : (
                      <img 
                        src={settings.stampUrl} 
                        alt="School verification stamp upload" 
                        className="max-w-full max-h-full object-contain rounded-full"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Stamp Is Active</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono truncate">
                      {settings.stampUrl.startsWith("stamp-") ? "Official Ink Presets" : "Custom uploaded stamp"}
                    </p>
                  </div>
                  {!isViewOnly && (
                    <button
                      type="button"
                      onClick={() => setSettings(prev => ({ ...prev, stampUrl: "" }))}
                      className="text-[10.5px] font-bold text-red-600 mt-2 block hover:underline cursor-pointer mx-auto"
                    >
                      Clear Stamp
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-slate-400 space-y-2">
                  <div className="w-16 h-16 bg-slate-100 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center mx-auto text-slate-300">
                    <Sparkles size={24} />
                  </div>
                  <p className="text-xs font-semibold mt-1">No Stamp Configured</p>
                  <p className="text-[10px] text-slate-400">Add stamps or select built-in ink seals</p>
                </div>
              )}
            </div>

            {!isViewOnly && (
              <>
                {/* Stamp Drag and Drop block */}
                <div 
                  onDragEnter={(e) => handleDrag(e, "stamp")}
                  onDragOver={(e) => handleDrag(e, "stamp")}
                  onDragLeave={(e) => handleDrag(e, "stamp")}
                  onDrop={(e) => handleDrop(e, "stamp")}
                  className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer select-none relative
                    ${dragActiveStamp ? "border-purple-500 bg-purple-50/50" : "border-slate-200 bg-slate-50/20 hover:bg-slate-50/50"}`}
                >
                  <input
                    type="file"
                    id="settings-stamp-input"
                    onChange={(e) => handleFileChange(e, "stamp")}
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload size={18} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-xs font-bold text-slate-700">Drag & Drop Stamp Image</p>
                  <p className="text-[9.5px] text-slate-400/90 mt-0.5">Or tap here to browse local stamp (PNG, JPG, SVG)</p>
                </div>

                {/* Presets Grid */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-semibold font-mono tracking-wider text-slate-400">
                    Select Official Rubber Presets
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {STAMP_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => selectPresetStamp(preset.id)}
                        className={`p-3 bg-white border rounded-xl flex flex-col items-center justify-center gap-1 text-center hover:bg-slate-50/60 active:scale-[0.98] transition-all cursor-pointer
                          ${settings.stampUrl === preset.id ? "border-purple-500 ring-2 ring-purple-50 ring-offset-0" : "border-slate-200"}`}
                      >
                        <div dangerouslySetInnerHTML={{ __html: preset.svg }} />
                        <span className="text-[9px] font-bold text-slate-600 truncate w-full mt-1">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visibility Checkbox */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <input
                    type="checkbox"
                    id="showStamp-toggle"
                    checked={settings.showStamp}
                    onChange={(e) => setSettings(prev => ({ ...prev, showStamp: e.target.checked }))}
                    className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <label htmlFor="showStamp-toggle" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                    Display verification stamp on report cards
                  </label>
                </div>
              </>
            )}
          </div>

        </div>

        {/* General Forms Details Panel */}
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-5 lg:col-span-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono flex items-center gap-1">
            <Activity size={14} className="text-emerald-500" />
            School Identity & Registration Details
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 mb-1.5">
                School official Name *
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={settings.schoolName}
                onChange={(e) => setSettings(prev => ({ ...prev, schoolName: e.target.value }))}
                placeholder="e.g. SHAREBILITY UGANDA SECONDARY SCHOOL"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white text-xs text-slate-800 disabled:opacity-75 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 mb-1.5">
                Inspiring School Motto
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={settings.motto}
                onChange={(e) => setSettings(prev => ({ ...prev, motto: e.target.value }))}
                placeholder="e.g. Determined to Excel / Knowledge Is Power"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white text-xs text-slate-800 disabled:opacity-75 italic"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <MapPin size={10} /> Physical Address / Mailing Box
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={settings.address}
                onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                placeholder="e.g. Campus Box 25, Wakiso, Kampala, Uganda"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white text-xs text-slate-800 disabled:opacity-75"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <Phone size={10} /> Official Contact Number
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={settings.phone}
                onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="e.g. +256 776 960740"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white text-xs text-slate-800 disabled:opacity-75 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <Mail size={10} /> Registrar Email Address
              </label>
              <input
                type="email"
                disabled={isViewOnly}
                value={settings.email}
                onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                placeholder="e.g. olevel@sharebility.net"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white text-xs text-slate-800 disabled:opacity-75"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <Globe size={10} /> School Web URL Address
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={settings.website}
                onChange={(e) => setSettings(prev => ({ ...prev, website: e.target.value }))}
                placeholder="e.g. www.sharebility.net"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white text-xs text-slate-800 disabled:opacity-75 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <BookOpen size={10} /> Dynamic Active Term Segment
              </label>
              <select
                disabled={isViewOnly}
                value={settings.termName}
                onChange={(e) => setSettings(prev => ({ ...prev, termName: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 text-xs font-semibold text-slate-800 cursor-pointer disabled:opacity-75"
              >
                <option value="TERM 1">TERM 1</option>
                <option value="TERM 2">TERM 2</option>
                <option value="TERM 3">TERM 3</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 mb-1.5">
                Dynamic Current Academic Year
              </label>
              <select
                disabled={isViewOnly}
                value={settings.academicYear}
                onChange={(e) => setSettings(prev => ({ ...prev, academicYear: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 text-xs font-mono font-semibold text-slate-800 cursor-pointer disabled:opacity-75"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono flex items-center gap-1 mb-3">
              <Settings size={14} className="text-blue-500" />
              Academic Term Calendar Schedule (Printed on Report Card)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 mb-1.5">
                  Term Has ended on:
                </label>
                <input
                  type="text"
                  disabled={isViewOnly}
                  value={settings.termEndedOn || ""}
                  onChange={(e) => setSettings(prev => ({ ...prev, termEndedOn: e.target.value }))}
                  placeholder="e.g., 2026-08-16 or August 16, 2026"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white text-xs text-slate-800 disabled:opacity-75 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 mb-1.5">
                  Next Term Commences:
                </label>
                <input
                  type="text"
                  disabled={isViewOnly}
                  value={settings.nextTermCommences || ""}
                  onChange={(e) => setSettings(prev => ({ ...prev, nextTermCommences: e.target.value }))}
                  placeholder="e.g., 2026-09-02 or September 2, 2026"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white text-xs text-slate-800 disabled:opacity-75 font-semibold"
                />
              </div>
            </div>
          </div>

          {!isViewOnly && (
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-blue-500/15 active:scale-[0.98] transition-all cursor-pointer"
              >
                {saving ? (
                  <>Autosaving...</>
                ) : (
                  <>
                    <Save size={14} />
                    Commit School Identity Settings
                  </>
                )}
              </button>
            </div>
          )}

        </form>

      </div>
      )}

      {activeSettingsTab === "smtp" && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6 max-w-4xl no-print">
          <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-600 shrink-0">
              <Server size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Outbound Mail Gateway (SMTP Engine) Settings</h3>
              <p className="text-slate-500 text-xs mt-0.5">
                Configure your school's official transactional mail relay. All automated academic results notifications will route securely via this connection.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 mb-1.5">
                SMTP Relay Server Hostname
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={settings.smtpHost || ""}
                onChange={(e) => setSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                placeholder="e.g. smtp.gmail.com or smtp.mailtrap.io"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white text-xs text-slate-800 disabled:opacity-75 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 mb-1.5">
                SMTP Relay Port
              </label>
              <input
                type="number"
                disabled={isViewOnly}
                value={settings.smtpPort || ""}
                onChange={(e) => setSettings(prev => ({ ...prev, smtpPort: Number(e.target.value) }))}
                placeholder="e.g. 587, 465, 2525"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white text-xs text-slate-800 disabled:opacity-75 font-semibold font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 mb-1.5">
                Connection Transport Security protocol
              </label>
              <select
                disabled={isViewOnly}
                value={settings.smtpSecurity || "STARTTLS"}
                onChange={(e) => setSettings(prev => ({ ...prev, smtpSecurity: e.target.value as any }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 text-xs font-semibold text-slate-800 cursor-pointer disabled:opacity-75"
              >
                <option value="STARTTLS">STARTTLS (Port 587 - Recommended)</option>
                <option value="SSL">SSL / SMTPS (Port 465)</option>
                <option value="None">None (Unencrypted/Intranet Port 25)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 mb-1.5">
                SMTP Gateway Authorized Username
              </label>
              <input
                type="text"
                disabled={isViewOnly}
                value={settings.smtpUsername || ""}
                onChange={(e) => setSettings(prev => ({ ...prev, smtpUsername: e.target.value }))}
                placeholder="e.g. your-api-key or register@school.ug"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white text-xs text-slate-800 disabled:opacity-75"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                SMTP Authorized Password / Secure Token
              </label>
              <input
                type="password"
                disabled={isViewOnly}
                value={settings.smtpPassword || ""}
                onChange={(e) => setSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                placeholder="••••••••••••••••"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white text-xs text-slate-800 disabled:opacity-75 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 mb-1.5">
                  Sender Display Name
                </label>
                <input
                  type="text"
                  disabled={isViewOnly}
                  value={settings.smtpSenderName || ""}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtpSenderName: e.target.value }))}
                  placeholder="e.g. Sharebility Registrar"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white text-xs text-slate-800 disabled:opacity-75 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 mb-1.5">
                  Sender Email Of Record
                </label>
                <input
                  type="email"
                  disabled={isViewOnly}
                  value={settings.smtpSenderEmail || ""}
                  onChange={(e) => setSettings(prev => ({ ...prev, smtpSenderEmail: e.target.value }))}
                  placeholder="e.g. noreply@school.net"
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 focus:bg-white text-xs text-slate-800 disabled:opacity-75 font-semibold"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 border border-slate-150 rounded-xl space-y-1">
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono block">Relay Diagnostics & Safety parameters:</span>
            <p className="text-[10px] text-slate-500 leading-normal">
              Academix connects to the SMTP relay port securely. When emails are dispatched to parent addresses, the backend simulator executes immediate verification using these parameters and validates against standard SPF, DKIM controls to prevent junk routing.
            </p>
          </div>

          {!isViewOnly && (
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-blue-500/15 active:scale-[0.98] transition-all cursor-pointer"
              >
                {saving ? (
                  <>Storing Relay credentials...</>
                ) : (
                  <>
                    <Save size={14} />
                    Commit SMTP Mail Credentials
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      )}

      {activeSettingsTab === "templates" && (() => {
        // Enforce fallback templates on the screen
        const list = settings.emailTemplates && settings.emailTemplates.length > 0
          ? settings.emailTemplates
          : [
              {
                id: "term-report",
                name: "End of Term Report Delivery",
                subject: "Official Academic Report: {STUDENT_NAME} ({CLASS})",
                body: "Dear Parent/Guardian,\n\nPlease find attached the official report card for {STUDENT_NAME} ({CLASS}) for {TERM} {YEAR}.\n\nAcademic Performance Summary:\n- Average Score: {AVERAGE}%\n- Division / Grade Rank: {DIVISION}\n\nTeacher Appraisal Remarks:\n\"{CLASS_TEACHER_REMARKS}\"\n\nKindly note that school commences for next term on {NEXT_TERM_COMMENCES}.\n\nThank you for choosing {SCHOOL_NAME}.\n\nBest regards,\nSchool Administration"
              },
              {
                id: "formative-summary",
                name: "Formative Assessment Summary",
                subject: "Formative Progress Report: {STUDENT_NAME}",
                body: "Dear Parent/Guardian,\n\nWe are presenting the O-Level Formative Performance Summary for {STUDENT_NAME} ({CLASS}) for {TERM} {YEAR}.\n\nThis continuous assessment summary provides feedback on your learner's mastery of competencies and specific Activities of Integration (AOIs).\n\nBest regards,\n{SCHOOL_NAME} Registrar"
              },
              {
                id: "project-work",
                name: "Learner Project Assessment",
                subject: "New Curriculum Project Brief: {STUDENT_NAME}",
                body: "Dear Parent/Guardian,\n\nThis email delivers the Descriptive Report on Project Work for {STUDENT_NAME} in class {CLASS}.\n\nHighlight project details:\n- Student Project Name: {PROJECT_TITLE}\n- Competencies Demonstrated: {PROJECT_SKILLS}\n\nPlease check the attached document for continuous score updates.\n\nBest regards,\n{SCHOOL_NAME} Project Coordinator"
              }
            ];

        // Ensure state contains them so edits are persisted
        if (!settings.emailTemplates || settings.emailTemplates.length === 0) {
          setTimeout(() => {
            setSettings(prev => ({ ...prev, emailTemplates: list }));
          }, 0);
        }

        const [selectedTplId, setSelectedTplId] = useState<string>("term-report");
        const actTpl = list.find(t => t.id === selectedTplId) || list[0];

        const handleFieldEdit = (field: "subject" | "body", value: string) => {
          const mod = list.map(t => {
            if (t.id === selectedTplId) {
              return { ...t, [field]: value };
            }
            return t;
          });
          setSettings(prev => ({ ...prev, emailTemplates: mod }));
        };

        return (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6 max-w-4xl font-sans no-print">
            <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-600 shrink-0">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Broadcasting Mail Templates & Automatic Descriptors</h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Prepare professional message mappings used when parents are notified of terminal grades. These support live metadata placeholders.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 mb-1.5">
                  Select Template Schema to Customize
                </label>
                <select
                  value={selectedTplId}
                  onChange={(e) => setSelectedTplId(e.target.value)}
                  className="w-full sm:w-80 px-3 py-2 border border-slate-250 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50 text-xs font-semibold text-slate-800 cursor-pointer"
                >
                  {list.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 mb-1.5">
                    Email Subject Line Theme
                  </label>
                  <input
                    type="text"
                    disabled={isViewOnly}
                    value={actTpl.subject}
                    onChange={(e) => handleFieldEdit("subject", e.target.value)}
                    placeholder="Subject..."
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-800 disabled:opacity-75 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold font-mono tracking-wider text-slate-400 mb-1.5">
                    Email Message Content Body
                  </label>
                  <textarea
                    rows={8}
                    disabled={isViewOnly}
                    value={actTpl.body}
                    onChange={(e) => handleFieldEdit("body", e.target.value)}
                    placeholder="Template body text..."
                    className="w-full px-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 py-2.5 text-xs text-slate-800 disabled:opacity-75 font-sans leading-relaxed"
                  />
                </div>
              </div>

              {/* Dynamic Key-Value Map variables */}
              <div className="pt-4 border-t border-slate-150 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 font-mono block">
                  Available Dynamic Placeholders Reference List
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { tag: "{STUDENT_NAME}", label: "Student Full Name" },
                    { tag: "{CLASS}", label: "Class Level (e.g., S2 / P4)" },
                    { tag: "{TERM}", label: "Active Term (e.g., TERM 2)" },
                    { tag: "{YEAR}", label: "Academic Year" },
                    { tag: "{AVERAGE}", label: "Average Mark Score" },
                    { tag: "{DIVISION}", label: "Curriculum Performance Division/Rank" },
                    { tag: "{CLASS_TEACHER_REMARKS}", label: "Academics Teacher Remarks" },
                    { tag: "{NEXT_TERM_COMMENCES}", label: "Next Term Commencement Date" },
                    { tag: "{SCHOOL_NAME}", label: "Active School Name" },
                    { tag: "{PROJECT_TITLE}", label: "Mandatory S2/S3 Project Name" },
                    { tag: "{PROJECT_SKILLS}", label: "Main competencies acquired" }
                  ].map(badge => (
                    <div 
                      key={badge.tag} 
                      className="px-2 py-1 bg-slate-50 border border-slate-200/60 rounded-lg text-[10px] font-sans flex items-center gap-1 hover:bg-slate-100 transition-all select-none cursor-help"
                      title={badge.label}
                    >
                      <code className="text-blue-700 font-bold font-mono">{badge.tag}</code>
                      <span className="text-slate-400 font-medium font-sans">| {badge.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {!isViewOnly && (
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={async () => {
                    setSaving(true);
                    try {
                      const res = await fetch("/api/settings", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ emailTemplates: list })
                      });
                      if (res.ok) {
                        setSuccess(true);
                        setTimeout(() => setSuccess(false), 3000);
                        onSettingsSaved();
                      } else {
                        setErrorMsg("Could not save layout templates");
                        setTimeout(() => setErrorMsg(null), 3000);
                      }
                    } catch (err) {
                      setErrorMsg("Relay server connectivity timeout");
                      setTimeout(() => setErrorMsg(null), 3000);
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm shadow-blue-500/15 active:scale-[0.98] transition-all cursor-pointer"
                >
                  {saving ? (
                    <>Saving templates...</>
                  ) : (
                    <>
                      <Save size={14} />
                      Commit Automated Templates configuration
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        );
      })()}

    </div>
  );
}
