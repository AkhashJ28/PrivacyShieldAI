"use client";

import Link from "next/link";
import { Shield, ArrowRight, UploadCloud, Cpu, AlertTriangle, FileCheck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center">
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-hero-glow -z-10" />

      {/* Navbar Header */}
      <header className="w-full max-w-7xl h-20 flex items-center justify-between px-8 border-b border-white/5 z-10">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary-light" />
          <span className="text-lg font-bold tracking-wider text-white">PrivacyShield AI</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <Link href="/login">
            <Button size="sm" className="bg-primary hover:bg-primary-light text-white rounded-lg">Launch Console</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-6xl text-center pt-24 pb-16 px-6 z-10">
        <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
          Protect the Public,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-light to-accent text-glow">
            Not Profile the Public.
          </span>
        </h1>
        <p className="text-md text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Surveillance systems permanently store identities of millions of innocent people. Our solution ensures footage is privacy-protected by default via automated face-blurring AI workflows.
        </p>
        <div className="flex gap-4 justify-center mb-24">
          <Link href="/login">
            <Button size="lg" className="bg-primary hover:bg-primary-light text-white px-8 py-6 text-md rounded-xl transition-all neon-glow-purple">
              Launch Prototype App <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Section 2: How It Works Workflow */}
        <section id="how-it-works" className="mb-28 text-left scroll-mt-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-white mb-2">How It Works</h2>
            <p className="text-slate-400 text-xs uppercase tracking-widest text-primary-light font-mono">Privacy by Default. Access by Justification.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {[
              { step: "1", title: "Upload Footage", desc: "Authorities upload CCTV video feeds.", icon: <UploadCloud className="w-5 h-5 text-accent" /> },
              { step: "2", title: "AI Processing", desc: "Neural networks blur faces instantly.", icon: <Cpu className="w-5 h-5 text-primary-light" /> },
              { step: "3", title: "Incident Report", desc: "Officers flag target security threats.", icon: <AlertTriangle className="w-5 h-5 text-danger" /> },
              { step: "4", title: "Access Request", desc: "Justification submitted to lift blur filters.", icon: <FileCheck className="w-5 h-5 text-warning" /> },
              { step: "5", title: "Admin Approval", desc: "Commanders review validation requests.", icon: <Shield className="w-5 h-5 text-success" /> },
              { step: "6", title: "Identity Reveal", desc: "Temporary access window opens maps.", icon: <CheckCircle2 className="w-5 h-5 text-white" /> },
            ].map((item, index) => (
              <div key={index} className="glass-card p-5 relative flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center mb-4">{item.icon}</div>
                  <h3 className="text-xs font-bold text-white mb-1">{item.step}. {item.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
