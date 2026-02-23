import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, MessageCircle, Users, Zap, Globe, Shield, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen relative overflow-hidden text-white font-sans">
      {/* Background */}
      <div className="fixed inset-0 z-[-1] bg-black">
        <div className="mesh-gradient-bg opacity-80" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        {/* Animated Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/30 rounded-full blur-[100px] animate-blob filter mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/30 rounded-full blur-[100px] animate-blob animation-delay-2000 filter mix-blend-screen"></div>
        <div className="absolute top-[40%] left-[40%] w-96 h-96 bg-pink-600/20 rounded-full blur-[100px] animate-blob animation-delay-4000 filter mix-blend-screen"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-0 px-6 py-4 flex justify-between items-center backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-brand-primary via-brand-secondary to-brand-accent flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-gray-400">CircleSfera</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/accounts/login" className="px-5 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors">
            Log In
          </Link>
          <Link to="/accounts/emailsignup" className="px-5 py-2 text-sm font-medium bg-white text-black rounded-full hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="container mx-auto px-6 pt-32 pb-16 md:pt-48 md:pb-24 flex flex-col items-center text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel border border-white/10 mb-8 animate-float">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-secondary"></span>
          </span>
          <span className="text-xs font-medium tracking-wide uppercase text-white/70">Social Reimagined</span>
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 leading-[1.1] drop-shadow-2xl">
          Share Your <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-linear-to-r from-brand-secondary via-brand-primary to-brand-blue animate-gradient-x">
            Universe
          </span>
        </h1>

        <p className="max-w-2xl text-lg md:text-xl text-white/60 mb-10 leading-relaxed font-light">
          Connect with friends, share your moments, and explore a world of creativity. 
          Experience a social platform designed for distinct visual storytelling.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link to="/accounts/emailsignup" className="group relative px-8 py-4 bg-white text-black font-bold rounded-full overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95">
            <span className="relative z-10 flex items-center justify-center gap-2">
              Get Started 
              <Zap className="w-4 h-4 fill-black group-hover:rotate-12 transition-transform" />
            </span>
          </Link>
          <Link to="/explore" className="px-8 py-4 glass-panel rounded-full text-white font-medium hover:bg-white/10 transition-all hover:scale-105 active:scale-95 border border-white/10 hover:border-white/30">
            Explore Demo
          </Link>
        </div>

        {/* Dynamic Mockup */}
        <div className="mt-24 relative w-full max-w-5xl aspect-video glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden group animate-float-delayed">
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/90 z-10"></div>
            
            {/* Animated Grid simulating feed */}
            <div className="absolute inset-0 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity duration-700">
               <div className="grid grid-cols-3 gap-6 p-8 w-full h-full transform group-hover:scale-105 transition-transform duration-1000">
                  <div className="col-span-1 space-y-6 pt-12">
                      <div className="glass-panel h-48 rounded-2xl w-full bg-white/5 animate-pulse-slow"></div>
                      <div className="glass-panel h-72 rounded-2xl w-full bg-white/5"></div>
                  </div>
                  <div className="col-span-1 space-y-6">
                      <div className="glass-panel h-full rounded-2xl w-full border border-brand-primary/30 shadow-[0_0_30px_rgba(131,58,180,0.15)] bg-linear-to-b from-white/10 to-transparent">
                          {/* Fake Post Content */}
                          <div className="p-4 flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-600"></div>
                              <div className="h-3 w-24 bg-gray-600 rounded-full"></div>
                          </div>
                      </div>
                  </div>
                  <div className="col-span-1 space-y-6 pt-24">
                       <div className="glass-panel h-64 rounded-2xl w-full bg-white/5"></div>
                       <div className="glass-panel h-40 rounded-2xl w-full bg-white/5 animate-pulse-slow"></div>
                  </div>
               </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-10 z-20 text-left">
                <h3 className="text-3xl font-bold mb-3 tracking-tight">Immersive Feed</h3>
                <p className="text-white/70 max-w-lg text-lg">Experience content like never before with our seamless, glass-morphic interface that puts visuals first.</p>
            </div>
        </div>
      </main>

      {/* Marquee Section */}
      <section className="py-12 border-y border-white/5 bg-black/50 backdrop-blur-sm overflow-hidden">
        <div className="flex gap-16 animate-marquee whitespace-nowrap">
           <span className="text-2xl font-bold text-white/30 tracking-widest uppercase">Community</span>
           <span className="text-2xl font-bold text-white/30 tracking-widest uppercase">•</span>
           <span className="text-2xl font-bold text-white/30 tracking-widest uppercase">Creativity</span>
           <span className="text-2xl font-bold text-white/30 tracking-widest uppercase">•</span>
           <span className="text-2xl font-bold text-white/30 tracking-widest uppercase">Connection</span>
           <span className="text-2xl font-bold text-white/30 tracking-widest uppercase">•</span>
           <span className="text-2xl font-bold text-white/30 tracking-widest uppercase">Innovation</span>
           <span className="text-2xl font-bold text-white/30 tracking-widest uppercase">•</span>
           <span className="text-2xl font-bold text-white/30 tracking-widest uppercase">Expression</span>
           <span className="text-2xl font-bold text-white/30 tracking-widest uppercase">•</span>
           {/* Duplicate for seamless loop */}
           <span className="text-2xl font-bold text-white/30 tracking-widest uppercase">Community</span>
           <span className="text-2xl font-bold text-white/30 tracking-widest uppercase">•</span>
           <span className="text-2xl font-bold text-white/30 tracking-widest uppercase">Creativity</span>
           <span className="text-2xl font-bold text-white/30 tracking-widest uppercase">•</span>
           <span className="text-2xl font-bold text-white/30 tracking-widest uppercase">Connection</span>
           <span className="text-2xl font-bold text-white/30 tracking-widest uppercase">•</span>
           <span className="text-2xl font-bold text-white/30 tracking-widest uppercase">Innovation</span>
           <span className="text-2xl font-bold text-white/30 tracking-widest uppercase">•</span>
           <span className="text-2xl font-bold text-white/30 tracking-widest uppercase">Expression</span>
        </div>
      </section>

      {/* How It Works - Interactive Tabs */}
      <InteractiveFeatures />

      {/* Features Grid */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
             <h2 className="text-3xl md:text-5xl font-bold mb-4">Everything you need</h2>
             <p className="text-white/50">Built for modern creators</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Camera className="w-8 h-8 text-brand-secondary" />}
              title="Capture Moments"
              description="Share your life in high definition. Filters, editing tools, and stories that disappear after 24 hours."
            />
            <FeatureCard 
              icon={<Users className="w-8 h-8 text-brand-primary" />}
              title="Build Community"
              description="Create circles, join groups, and connect with people who share your passions and interests."
            />
            <FeatureCard 
              icon={<MessageCircle className="w-8 h-8 text-brand-blue" />}
              title="Real-time Chat"
              description="Stay in touch with friends and family using our secure, instant messaging system."
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white/5 relative">
         <div className="container mx-auto px-6 max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Frequently Asked Questions</h2>
            <div className="space-y-4">
                <FAQItem question="Is CircleSfera free to use?" answer="Yes, CircleSfera is completely free for all users. We believe in open connection for everyone." />
                <FAQItem question="How do I verify my account?" answer="Currently, verification is invite-only for notable creators and public figures." />
                <FAQItem question="Can I download my data?" answer="Absolutely. We provide tools to export all your posts and data at any time." />
                <FAQItem question="Is there a mobile app?" answer="We are currently mobile-first web optimized, with native apps coming to iOS and Android later this year." />
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-brand-primary/20 pointer-events-none"></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">Ready to join the Circle?</h2>
          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
            Join thousands of creators and start sharing your journey today.
          </p>
          <Link to="/accounts/emailsignup" className="inline-flex items-center justify-center px-10 py-5 bg-linear-to-r from-brand-secondary to-brand-primary text-white font-bold text-lg rounded-full shadow-[0_0_50px_rgba(131,58,180,0.5)] hover:shadow-[0_0_80px_rgba(131,58,180,0.7)] hover:scale-105 transition-all">
            Create Your Account
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black text-sm">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-white/40">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
             <span className="font-bold text-white/60">CircleSfera</span>
             <span>&copy; 2026</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-white transition-colors">Guidelines</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Sub-components

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className="glass-panel p-8 rounded-3xl border border-white/5 hover:border-brand-primary/30 transition-all duration-500 group hover:-translate-y-2 hover:bg-white/5">
    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 group-hover:bg-brand-primary/20">
      {icon}
    </div>
    <h3 className="text-2xl font-bold mb-4 group-hover:text-brand-primary transition-colors">{title}</h3>
    <p className="text-white/60 leading-relaxed">{description}</p>
  </div>
);

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="glass-panel rounded-xl overflow-hidden border border-white/5 transition-all">
            <button type="button" 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/5 transition-colors"
            >
                <span className="font-medium text-lg">{question}</span>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>
            <div className={`px-6 text-gray-400 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>
                {answer}
            </div>
        </div>
    )
}

const InteractiveFeatures = () => {
    const [activeTab, setActiveTab] = useState('connect');
    
    const tabs = [
        { id: 'connect', label: 'Connect', icon: <Globe className="w-4 h-4"/>, title: "Global Network", desc: "Instantly connect with creators from around the world without borders." },
        { id: 'create', label: 'Create', icon: <Sparkles className="w-4 h-4"/>, title: "Powerful Tools", desc: "Built-in professional editing suites for your photos and stories." },
        { id: 'share', label: 'Share', icon: <Shield className="w-4 h-4"/>, title: "Private Circles", desc: "Share intimately with Close Friends or broadcast to the entire world." }
    ];

    return (
        <section className="py-24 container mx-auto px-6">
            <div className="glass-panel rounded-3xl p-2 md:p-4 border border-white/10 max-w-5xl mx-auto flex flex-col md:flex-row overflow-hidden min-h-[500px]">
                {/* Sidebar / Tabs */}
                <div className="w-full md:w-1/3 p-4 md:p-8 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-white/5">
                    <h3 className="font-bold mb-4 text-gray-400 uppercase tracking-widest text-xs">How it Works</h3>
                    {tabs.map(tab => (
                        <button type="button"
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`p-4 rounded-xl text-left transition-all duration-300 flex items-center gap-3 group ${activeTab === tab.id ? 'bg-white/10 border border-white/10 shadow-lg' : 'hover:bg-white/5 border border-transparent'}`}
                        >
                            <div className={`p-2 rounded-lg ${activeTab === tab.id ? 'bg-brand-primary text-white' : 'bg-white/5 text-gray-400 group-hover:text-white'}`}>
                                {tab.icon}
                            </div>
                            <div>
                                <span className={`block font-bold ${activeTab === tab.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{tab.label}</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="w-full md:w-2/3 p-8 md:p-12 relative flex items-center justify-center bg-black/20">
                    {tabs.map(tab => (
                        <div 
                            key={tab.id}
                            className={`absolute inset-0 p-12 flex flex-col justify-center transition-all duration-500 transform ${activeTab === tab.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}
                        >
                            <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-brand-primary to-brand-blue flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(64,93,230,0.3)]">
                                {tab.icon}
                            </div>
                            <h2 className="text-4xl font-bold mb-4">{tab.title}</h2>
                            <p className="text-xl text-gray-400 leading-relaxed">
                                {tab.desc}
                            </p>
                            
                            {/* Abstract visual for the tab */}
                            <div className="mt-8 h-40 w-full glass-panel rounded-xl border border-white/5 relative overflow-hidden">
                                 <div className={`absolute inset-0 opacity-20 bg-linear-to-r ${activeTab === 'connect' ? 'from-blue-500' : activeTab === 'create' ? 'from-purple-500' : 'from-pink-500'} to-transparent`}></div>
                                 <div className="absolute inset-0 flex items-center justify-center">
                                     <div className="w-full h-px bg-white/10"></div>
                                     <div className="absolute w-px h-full bg-white/10"></div>
                                 </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default LandingPage;
