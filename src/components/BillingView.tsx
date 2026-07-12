import React, { useState } from "react";
import { 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Ticket, 
  HelpCircle, 
  X, 
  Loader2, 
  ExternalLink,
  Info
} from "lucide-react";
import { UserProfile } from "../types";

interface BillingViewProps {
  profile: UserProfile | null;
  onNavigate: (page: string) => void;
  onRedeemPromoCode?: (code: string) => Promise<{ success: boolean; error?: string; plan?: string }>;
}

export default function BillingView({ profile, onNavigate, onRedeemPromoCode }: BillingViewProps) {
  const [code, setCode] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const currentPlan = profile?.plan || "Free Tier";

  const tiers = [
    { 
      name: "Free Tier", 
      price: "$0", 
      tokens: "50K standard", 
      active: currentPlan === "Free Tier",
      description: "Baseline simulation credits for testing workflows.",
      features: [
        "50,000 standard tokens included",
        "Core workspace simulation access",
        "Standard autonomous agent speed",
        "Row-level secure isolation",
        "Oversight by CEO Elena"
      ]
    },
    { 
      name: "Scale-Up Company", 
      price: "$499", 
      tokens: "5M premium", 
      active: currentPlan === "Scale-Up Company",
      description: "Unleash customized autonomous staff for fast-paced pipelines.",
      features: [
        "5,000,000 premium tokens included",
        "Prioritized processing speed",
        "Unlock full Custom AI Employee creator",
        "24/7 dedicated system execution",
        "Visual analytics & metrics dashboard"
      ]
    },
    { 
      name: "Venture Corporate", 
      price: "$1,499", 
      tokens: "Unlimited", 
      active: currentPlan === "Venture Corporate",
      description: "Infinite scale, zero constraints for advanced agency execution.",
      features: [
        "Unlimited language processing tokens",
        "Parallelized multi-agent execution pipeline",
        "Advanced neural long-term memories",
        "Dedicated expert enterprise workspace architect",
        "Advanced API access log streaming"
      ]
    }
  ];

  const handleOpenUpgrade = (planName: string) => {
    setMessage(null);
    setCode("");
    setIsModalOpen(true);
  };

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    if (!onRedeemPromoCode) return;

    setLoading(true);
    setMessage(null);

    const res = await onRedeemPromoCode(code);
    setLoading(false);

    if (res.success) {
      setMessage({
        type: "success",
        text: `Success! Your workspace has been upgraded to the "${res.plan}" plan.`
      });
      setCode("");
    } else {
      setMessage({
        type: "error",
        text: res.error || "Failed to redeem code. Please verify and try again."
      });
    }
  };

  // WhatsApp redirection url creator
  const getWhatsAppLink = () => {
    const phoneNumber = "918400815008"; // Standard WhatsApp helper number
    const text = encodeURIComponent("HELLO I WANT TO UPGRADE MY SUBSCRIPTION");
    return `https://wa.me/${phoneNumber}?text=${text}`;
  };

  return (
    <div className="space-y-6" id="billing-view">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Corporate Subscriptions</h2>
          <p className="text-xs text-[#A1A1AA] font-light mt-1">Manage processing credits, billing timelines, and language processing quotas.</p>
        </div>
        
        <div className="bg-[#18181B] border border-[#27272A] px-4 py-2 rounded-xl flex items-center gap-2">
          <span className="text-[10px] text-[#71717A] font-mono uppercase">Current Subscription:</span>
          <span className="text-xs font-bold text-white bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase">
            {currentPlan}
          </span>
        </div>
      </div>

      {/* Subscription cards layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier, idx) => (
          <div 
            key={idx}
            className={`border rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${
              tier.active 
                ? "border-indigo-500 bg-indigo-500/[0.02] shadow-[0_0_20px_-5px_rgba(99,102,241,0.15)]" 
                : "border-[#27272A] bg-[#18181B] hover:border-[#3f3f46]"
            }`}
          >
            {tier.active && (
              <span className="absolute top-4 right-4 bg-indigo-500 text-white text-[9px] font-bold font-mono px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> ACTIVE PLAN
              </span>
            )}

            <div>
              <h3 className="font-bold text-white text-base tracking-tight">{tier.name}</h3>
              <p className="text-[#71717A] text-[11px] font-light mt-1 min-h-[32px]">{tier.description}</p>
              
              <div className="flex items-baseline my-5">
                <span className="text-3xl font-bold text-white tracking-tight font-sans">{tier.price}</span>
                <span className="text-[10px] text-[#71717A] font-mono ml-1.5">/ month</span>
              </div>

              <ul className="space-y-3 mb-6 border-t border-[#27272A] pt-4">
                {tier.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-start space-x-2 text-[11px] text-[#A1A1AA] font-light leading-relaxed">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button 
              onClick={() => handleOpenUpgrade(tier.name)}
              disabled={tier.active}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                tier.active 
                  ? "bg-[#09090B] border border-[#27272A] text-[#71717A] cursor-not-allowed" 
                  : "bg-white hover:bg-neutral-200 text-black font-bold shadow-md hover:scale-[1.01] active:scale-[0.99]"
              }`}
            >
              {tier.active ? "Active Plan" : "Upgrade Plan"}
            </button>
          </div>
        ))}
      </div>

      {/* Upgrade Code Verification Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#000000]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Close Button */}
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-[#71717A] hover:text-white hover:bg-[#27272A] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Modal Heading */}
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Redeem Workspace Code</h4>
                <p className="text-[11px] text-[#A1A1AA] font-light">Enter your activation key to unlock premium workforce quotas.</p>
              </div>
            </div>

            {/* Status Messages */}
            {message && (
              <div className={`p-3 rounded-xl text-xs mb-4 flex items-start gap-2 border ${
                message.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                  : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              }`}>
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{message.text}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRedeem} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-[#71717A] uppercase">Activation License Code</label>
                <input 
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter activation key..."
                  className="w-full bg-[#09090B] border border-[#27272A] focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-colors placeholder:text-[#3F3F46]"
                  disabled={loading}
                />
              </div>

              <button 
                type="submit"
                disabled={loading || !code.trim()}
                className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying License...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Redeem Code & Upgrade</span>
                  </>
                )}
              </button>
            </form>

            {/* How to Buy Code Button Redirect */}
            <div className="mt-5 pt-4 border-t border-[#27272A] text-center space-y-2">
              <p className="text-[10px] text-[#71717A]">Don't have an activation license code yet?</p>
              
              <a 
                href={getWhatsAppLink()}
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium underline transition-all hover:gap-2"
              >
                <span>How to buy code</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
