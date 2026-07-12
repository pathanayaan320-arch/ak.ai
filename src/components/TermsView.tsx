import React from "react";
import { Scale, ArrowLeft, ShieldAlert, Sparkles, HelpCircle } from "lucide-react";

interface TermsViewProps {
  onBack?: () => void;
}

export default function TermsView({ onBack }: TermsViewProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-16 text-slate-100 font-sans" id="terms-view-container">
      {onBack && (
        <button 
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs text-teal-400 hover:text-white transition-colors mb-8 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl"
          id="btn-terms-back"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Workspace</span>
        </button>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-8 mb-10">
        <div>
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-[10px] font-mono text-indigo-400 uppercase tracking-widest mb-3">
            <Scale className="w-3 h-3" />
            <span>EXECUTIVE AGREEMENT</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Terms of Service</h1>
          <p className="text-xs text-slate-500 mt-2 font-mono">LAST UPDATED: JULY 11, 2026</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <ShieldAlert className="w-10 h-10 text-indigo-400" />
          <div>
            <div className="text-xs font-bold text-white font-mono">Regulatory Code</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Compliant Operations</div>
          </div>
        </div>
      </div>

      <div className="space-y-8 text-sm leading-relaxed text-slate-300 font-light">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>1. Acceptance of Terms</span>
          </h2>
          <p>
            By accessing or using the <strong>AK.AI</strong> platform, tools, and custom multi-agent environments, you agree to be bound by these Terms of Service. If you do not agree to all of the terms, you are prohibited from using or accessing our systems.
          </p>
          <p>
            We reserve the right to amend, change, or rewrite segments of these terms at our sole discretion. Continuous participation on the platform signifies approval of revised terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span>2. Corporate Workspace & Simulated Agency Code of Conduct</span>
          </h2>
          <p>
            AK.AI supplies an autonomous framework where simulated employees (e.g. Elena, Julian, Sarah) assist with task lists and product generations.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-400 text-xs">
            <li>
              You own all intellectual property rights to custom scripts, marketing files, and design token parameters assembled on your specific account database.
            </li>
            <li>
              You agree not to use the multi-agent simulator to generate threat blueprints, system exploitation models, hate speech, or illicit contents.
            </li>
            <li>
              Simulated employees cannot be held legally liable for business failures, bugs in drafted typescript, or budget misalignment. All autonomous work should be reviewed by an authorized human operator.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            <span>3. Meta Developer & Instagram Automation Policy</span>
          </h2>
          <p>
            Users leveraging the Comment-to-DM Private Reply module must ensure strict compliance with Meta Developer Policies:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-400 text-xs">
            <li>
              <strong className="text-slate-200">Anti-Spam Standards:</strong> You shall not configure automation rules to blast promotional loops, spam comments, or unsolicited link cycles. Doing so may trigger automated page bans from Meta, for which AK.AI bears no liability.
            </li>
            <li>
              <strong className="text-slate-200">Page Authenticity:</strong> You must possess legitimate commercial authority over connected Instagram Business Accounts and Facebook Pages.
            </li>
            <li>
              <strong className="text-slate-200">Rate Limits:</strong> Automation run cycles are subject to Graph API rate limits. Any intentional attempts to bypass API barriers will result in instant workspace termination.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>4. Subscriptions, Credits & Refund Policies</span>
          </h2>
          <p>
            Certain workspace expansions, standard token limits, and hiring slots require an active Subscription plan:
          </p>
          <p className="text-xs text-slate-400">
            - Subscription fees are charged on a monthly pre-pay schedule.<br />
            - Unused premium tokens do not roll over to subsequent calendar billing periods.<br />
            - Promotion coupons or test credits are non-transferable, carry zero physical monetary value, and can be cancelled by our operations desk at any time without warning.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-400" />
            <span>5. Disclaimer of Warranties</span>
          </h2>
          <p className="italic text-slate-400 text-xs">
            The platform is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, whether express or implied. While we strive to maintain 99.9% database availability, we do not guarantee uninterrupted server uptime, flawless file generation by AI agents, or absence of occasional API handshakes failures.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            <span>6. Termination of Access</span>
          </h2>
          <p>
            We reserve the right, without prior notification or liability, to suspend or terminate your workspace access if we detect breach of Meta policies, data scraping attempts, or harassment of our support services.
          </p>
          <p>
            If you have any questions or require formal business cooperation regarding these Terms of Service, please contact our legal desk at: <a href="mailto:pathanayaan320@gmail.com" className="text-indigo-400 hover:underline">pathanayaan320@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
