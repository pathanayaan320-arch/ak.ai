import React from "react";
import { Shield, ArrowLeft, Lock, Database, Eye } from "lucide-react";

interface PrivacyPolicyViewProps {
  onBack?: () => void;
}

export default function PrivacyPolicyView({ onBack }: PrivacyPolicyViewProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 text-slate-100 font-sans" id="privacy-policy-container">
      {onBack && (
        <button 
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs text-teal-400 hover:text-white transition-colors mb-8 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl"
          id="btn-privacy-back"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Workspace</span>
        </button>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-8 mb-10">
        <div>
          <div className="inline-flex items-center space-x-2 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full text-[10px] font-mono text-teal-400 uppercase tracking-widest mb-3">
            <Lock className="w-3 h-3" />
            <span>Cryptographic Trust</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-500 mt-2 font-mono">LAST REVISED: JULY 11, 2026</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <Shield className="w-10 h-10 text-teal-400" />
          <div>
            <div className="text-xs font-bold text-white font-mono">AES-256 Vault</div>
            <div className="text-[10px] text-slate-400 mt-0.5">End-to-End User Isolation</div>
          </div>
        </div>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-slate-300 font-light">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-teal-400" />
            <span>1. Introduction & Scope</span>
          </h2>
          <p>
            Welcome to <strong>AK.AI</strong> ("we", "our", "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy governs our practices concerning data collection, transmission, encryption, and storage when using the AK.AI Platform—including the Multi-Agent corporate workspaces, the CEO coordination channels, and our specialized Instagram Comment-to-DM Private Replies Automation systems.
          </p>
          <p>
            By accessing or using our services, you consent to the collection, transfer, storage, disclosure, and other uses of your information as described in this policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-teal-400" />
            <span>2. Information We Collect</span>
          </h2>
          <p>
            To provide our advanced agentic experiences and automation pipelines, we collect both public-facing profile metadata and secure workspace variables:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-400 text-xs">
            <li>
              <strong className="text-slate-200">Account Credentials:</strong> Email address, cryptographically hashed passwords, and full names registered via standard registration, or profile metadata returned from Google OAuth.
            </li>
            <li>
              <strong className="text-slate-200">Workspace Databases:</strong> Customized AI Employee specifications, prompt strategies, files generated in your vaults, logs, memories, and multi-agent chats. All workspace rows are physically partitioned with firestore security rules.
            </li>
            <li>
              <strong className="text-slate-200">Meta/Instagram Integration Variables:</strong> If you connect an Instagram page for DM Automation, we retrieve long-lived Page Access Tokens, Webhook verification payloads, comment activity feeds, and sender usernames.
            </li>
            <li>
              <strong className="text-slate-200">Billing Metadata:</strong> Promotional tokens redeemed and service tier configuration. Actual payment operations are isolated with secure processing partners.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-teal-400" />
            <span>3. How We Secure and Encrypt Your Data</span>
          </h2>
          <p>
            Security is not an afterthought at AK.AI. We implement rigid technical guards to prevent access to your proprietary business processes:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-400 text-xs">
            <li>
              <strong className="text-slate-200">AES-256-CBC Encryption:</strong> Sensitive third-party credentials, including Meta/Instagram Page Access Tokens and proprietary API tokens, are encrypted server-side using AES-256-CBC cipher blocks before they are written to our database.
            </li>
            <li>
              <strong className="text-slate-200">Firebase Row-Level Isolation:</strong> We leverage active Firestore security rules to prevent read/write overlap. Only authenticated clients matching the exact authenticated User ID can read or update document rows.
            </li>
            <li>
              <strong className="text-slate-200">No Key Exposure in Browser:</strong> High-risk secrets (including Gemini API Keys, encryption handshakes, and Meta Client Secrets) reside exclusively in secure server-side environment containers and are never exposed to client browsers.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-400" />
            <span>4. Meta Graph API and Instagram DM Policy Compliance</span>
          </h2>
          <p>
            When utilizing the Instagram Comment-to-DM module:
          </p>
          <p className="text-xs text-slate-400">
            - We only monitor comment payloads on authorized Instagram Business pages linked explicitly to your workspace.<br />
            - Access tokens retrieved during authentication are strictly used to dispatch user-requested Private Replies and Comment Likes.<br />
            - No chat logs, DM payloads, or user profiles are sold, leased, or transmitted to external advertising networks. Your customer interactions are completely private.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-teal-400" />
            <span>5. Cookies and Local Client-Side Cache</span>
          </h2>
          <p>
            We use essential local browser caches (such as <code>localStorage</code>) to maintain active session identifiers, cache theme options, and verify authentication state without executing redundant roundtrips to Firestore. We do not use third-party tracking pixels or telemetry engines to spy on your general internet behavior.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-400" />
            <span>6. Your Rights & Choice</span>
          </h2>
          <p>
            You retain absolute command over your company. You can delete customized AI Employees, erase Files Vault documents, clean conversation transcripts, or completely disconnect Instagram access tokens from your integrations dashboard in real-time.
          </p>
          <p>
            For any queries, security audits, or requests regarding data deletion, please contact our administrative suite directly at: <a href="mailto:pathanayaan320@gmail.com" className="text-teal-400 hover:underline">pathanayaan320@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
