import React, { useState } from 'react';

const STEPS = [
  {
    number: "01",
    icon: "🌐",
    title: "Open Google AI Studio",
    description: "Go to aistudio.google.com in any browser. This is Google's official platform for creating AI keys.",
    link: "https://aistudio.google.com/app/apikey",
    linkText: "Open Google AI Studio →",
    color: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-500/30",
    numColor: "text-blue-400",
  },
  {
    number: "02",
    icon: "🔑",
    title: "Sign In with Google",
    description: "Click 'Sign In' on the top right. Use any Google account — your personal Gmail works perfectly. No payment or credit card needed.",
    color: "from-purple-500/20 to-purple-600/10",
    border: "border-purple-500/30",
    numColor: "text-purple-400",
  },
  {
    number: "03",
    icon: "➕",
    title: "Click 'Create API Key'",
    description: "On the left side, click 'Get API Key' or 'Create API Key'. Choose 'Create API key in new project'. A key like AIzaSy... will be generated instantly.",
    color: "from-amber-500/20 to-amber-600/10",
    border: "border-amber-500/30",
    numColor: "text-amber-400",
  },
  {
    number: "04",
    icon: "📋",
    title: "Copy the Key",
    description: "Click the copy icon next to your key. It starts with 'AIzaSy'. This key is FREE — Google gives generous free usage limits, enough for any student.",
    color: "from-green-500/20 to-green-600/10",
    border: "border-green-500/30",
    numColor: "text-green-400",
  },
  {
    number: "05",
    icon: "🔒",
    title: "Paste in Nebula Settings",
    description: "Go to Nebula → Settings (top right). Paste your key in the 'Gemini API Key' box and click 'Secure & Save Key'. That's it — your AI features are now active!",
    color: "from-rose-500/20 to-rose-600/10",
    border: "border-rose-500/30",
    numColor: "text-rose-400",
  },
];

const SAFETY_PROOFS = [
  {
    icon: "🔐",
    title: "AES-256-GCM Military Encryption",
    detail: "The moment you hit 'Save', your key is encrypted using AES-256-GCM — the same algorithm used by banks and government agencies. The raw key string is never stored in our database.",
  },
  {
    icon: "🚫",
    title: "We Never See Your Key",
    detail: "Our backend decrypts your key in server memory only for the milliseconds needed to make your AI request. It is then immediately wiped from memory. No logs, no storage, no human can read it.",
  },
  {
    icon: "🛡️",
    title: "Zero-Trust Architecture",
    detail: "Every single request to the AI is verified using your personal session token. No other user can ever access your key or your AI usage — complete isolation.",
  },
  {
    icon: "📊",
    title: "Your Key = Your Quota",
    detail: "Your API key is linked only to your Google account's free quota. Nebula cannot use your key to bill you, share it with others, or run it beyond your requests.",
  },
  {
    icon: "🌐",
    title: "HTTPS Everywhere",
    detail: "All communication between your browser and our server is encrypted over HTTPS/TLS. No one can intercept your key while it's being saved.",
  },
  {
    icon: "🗑️",
    title: "Delete Anytime",
    detail: "You can delete your API key from Nebula Settings at any time with one click. It is permanently and instantly wiped from our database.",
  },
];

const FAQS = [
  {
    q: "Can Nebula use my key without my permission?",
    a: "No. Your key is encrypted and only used when you personally trigger an action (like generating notes). It cannot be used by anyone else or by Nebula for any other purpose."
  },
  {
    q: "Does it cost money to use the Gemini API key?",
    a: "No! Google provides a very generous free tier (1 million tokens/day for Gemini Flash). For normal student usage — notes, flashcards, revision packs — you will almost never hit the free limit."
  },
  {
    q: "What if I accidentally share my key?",
    a: "Go to Google AI Studio → your key → click 'Delete' or 'Regenerate'. Then save the new key in Nebula Settings. The old key is immediately invalidated by Google."
  },
  {
    q: "Why do I need to provide my own key?",
    a: "Nebula uses a 'Bring Your Own Key' model so that your AI usage is completely private, isolated, and free. We don't want to store your data on our servers or charge you for AI usage."
  },
  {
    q: "Can I use Nebula without an API key?",
    a: "Yes! The PYQ Hub (Previous Year Questions) works 100% without any API key. You can practice thousands of questions for free without adding any key."
  },
];

function HelpChat() {
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "👋 Hi! I'm the Nebula Help Assistant. Ask me anything about how to copy your API key, how Nebula keeps it safe, or how to use any feature!"
    }
  ]);
  const [input, setInput] = useState("");

  const getBotReply = (question) => {
    const q = question.toLowerCase();
    if (q.includes("copy") || q.includes("api key") || q.includes("get key") || q.includes("create key")) {
      return "📋 To copy your API key:\n1. Go to aistudio.google.com\n2. Sign in with your Google account\n3. Click 'Get API Key' → 'Create API key in new project'\n4. Copy the key starting with 'AIzaSy...'\n5. Go to Nebula Settings → paste and click 'Secure & Save Key'";
    }
    if (q.includes("safe") || q.includes("secure") || q.includes("privacy") || q.includes("harm") || q.includes("trust") || q.includes("steal")) {
      return "🔒 Your API key is 100% safe in Nebula! It is encrypted using AES-256-GCM (military-grade encryption) before being stored. We never see the raw key. It is only decrypted in server memory for the milliseconds needed to make your AI request, then immediately wiped. No one else can access it.";
    }
    if (q.includes("cost") || q.includes("money") || q.includes("free") || q.includes("pay") || q.includes("charge")) {
      return "💚 It's completely FREE! Google provides a generous free tier for the Gemini API (1 million tokens/day on Gemini Flash). Normal student usage — generating notes, flashcards, mind maps — uses very little quota. You will almost never hit the free limit.";
    }
    if (q.includes("pyq") || q.includes("previous year") || q.includes("without key") || q.includes("no api")) {
      return "✅ Yes! You can use the PYQ Hub (Previous Year Questions) completely without any API key. Just navigate to 'PYQ Hub' in the sidebar and start practicing thousands of real exam questions for FREE.";
    }
    if (q.includes("delete") || q.includes("remove key") || q.includes("lost") || q.includes("compromised")) {
      return "🗑️ To delete your key from Nebula: go to Settings → click the red trash icon next to your key. To invalidate it on Google's side: go to aistudio.google.com → find your key → click Delete or Regenerate.";
    }
    if (q.includes("note") || q.includes("mind map") || q.includes("revision") || q.includes("generate")) {
      return "📚 To generate Notes/Mind Maps/Revision Packs:\n1. Go to 'Subjects' in the sidebar\n2. Click on a subject → then a topic\n3. Click 'Actions ⚡' button on the topic card\n4. Choose 'View Notes', 'Mind Map', or 'Quick Revision'\nNote: AI generation takes 15-30 seconds, please wait!";
    }
    if (q.includes("language") || q.includes("hindi") || q.includes("hinglish")) {
      return "🌐 Nebula supports English, Hindi, and Hinglish! Go to Settings → scroll to 'Preferences' → select your language → click Save. All AI-generated content will switch to your preferred language.";
    }
    if (q.includes("login") || q.includes("sign up") || q.includes("register") || q.includes("account")) {
      return "👤 To create an account: go to the Nebula homepage → click 'Register' → fill in your details. It's completely free. After logging in, you'll have your own private dashboard!";
    }
    return "🤔 I'm not sure about that specific question. Here are things I can help with:\n- How to copy your Gemini API key\n- Is my API key safe in Nebula?\n- How to generate notes/mind maps\n- Using PYQ Hub without an API key\n- How to change language\nTry asking one of these!";
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = { from: "user", text: input };
    const reply = { from: "bot", text: getBotReply(input) };
    setMessages((prev) => [...prev, userMsg, reply]);
    setInput("");
  };

  return (
    <div className="arc-card-elevated rounded-2xl overflow-hidden flex flex-col" style={{ height: "420px" }}>
      {/* Chat header */}
      <div className="px-5 py-4 flex items-center gap-3 border-b" style={{ borderColor: "var(--arc-border)", background: "rgba(0,0,0,0.3)" }}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm">🤖</div>
        <div>
          <p className="font-bold text-sm" style={{ color: "var(--arc-text-hero)" }}>Nebula Help Assistant</p>
          <p className="text-xs text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span> Online</p>
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] text-xs leading-relaxed px-4 py-2.5 rounded-2xl whitespace-pre-wrap ${
              msg.from === "user"
                ? "bg-blue-600 text-white rounded-br-sm"
                : "bg-white/5 text-slate-200 border border-white/10 rounded-bl-sm"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      {/* Input */}
      <div className="px-4 py-3 flex gap-2 border-t" style={{ borderColor: "var(--arc-border)" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask anything about the app or API key..."
          className="flex-1 text-xs px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}

function SummaryPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="max-w-5xl mx-auto space-y-16 p-1 pb-20">
      {/* Decorative glows */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 bg-amber-500/8 blur-[120px] rounded-full pointer-events-none" />

      {/* ─── HERO ─── */}
      <div className="text-center space-y-4 pt-8">
        <h1 className="arc-font-display text-4xl md:text-5xl font-black arc-text-gradient tracking-tight">
          What is Nebula?
        </h1>
        <p className="text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--arc-text-secondary)" }}>
          Your ultimate AI-powered Study Command Center — designed to transform the way you learn, practice, and track your progress.
        </p>
      </div>

      {/* ─── HOW IT WORKS ─── */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold arc-font-display text-center" style={{ color: "var(--arc-text-hero)" }}>
          🚀 How It Works
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: "📚", title: "Topic Academy", desc: "Organise your subjects into topics. AI generates comprehensive study notes instantly." },
            { icon: "🧠", title: "Visual Mind Maps", desc: "Visualise complex topics with colourful, floating mind maps generated in seconds." },
            { icon: "⚡", title: "Quick Revision", desc: "Get summaries, flashcards, and concept maps for any topic, ready to revise fast." },
            { icon: "🎯", title: "Elite Challenges", desc: "Attempt hard-level MCQs, earn XP, and unlock badges as you master topics." },
            { icon: "📝", title: "PYQ Hub", desc: "Practice thousands of previous year questions for free — no API key needed." },
            { icon: "🌐", title: "Multilingual", desc: "Study in English, Hindi, or Hinglish. AI generates content in your preferred language." },
          ].map((item) => (
            <div key={item.title} className="arc-card-elevated p-6 space-y-3">
              <span className="text-3xl">{item.icon}</span>
              <h3 className="font-bold text-base" style={{ color: "var(--arc-gold-400)" }}>{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-300">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── API KEY GUIDE ─── */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold arc-font-display" style={{ color: "var(--arc-text-hero)" }}>
            🔑 How to Get & Use Your Free API Key
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Follow these 5 simple steps. The key is completely <strong className="text-green-400">FREE</strong> and takes less than 2 minutes to set up.
          </p>
        </div>

        <div className="space-y-4">
          {STEPS.map((step, i) => (
            <div
              key={step.number}
              className={`rounded-2xl p-5 border bg-gradient-to-r ${step.color} ${step.border} flex gap-5 items-start`}
            >
              <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${step.numColor} bg-black/20 border border-white/10`}>
                {step.number}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{step.icon}</span>
                  <h3 className="font-bold text-sm text-white">{step.title}</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>
                {step.link && (
                  <a
                    href={step.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs font-bold text-blue-400 hover:text-blue-300 underline transition-colors"
                  >
                    {step.linkText}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── API SAFETY PROOF ─── */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold arc-font-display" style={{ color: "var(--arc-text-hero)" }}>
            🛡️ Is It Safe to Add My API Key?
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            <strong className="text-green-400">100% Yes.</strong> Nebula uses enterprise-grade security that is more secure than most apps you use daily. Here is exactly what happens to protect you:
          </p>
        </div>

        {/* Safety verdict box */}
        <div className="rounded-2xl border border-green-500/30 bg-green-900/20 p-6 flex items-start gap-4">
          <span className="text-4xl shrink-0">✅</span>
          <div>
            <h3 className="font-black text-green-400 text-lg">Verdict: Completely Safe</h3>
            <p className="text-sm text-green-200/80 mt-1 leading-relaxed">
              Your key is <strong>never stored as plain text</strong>. It is encrypted the moment you click Save, lives only as an unreadable encrypted blob in the database, and is decrypted in secure memory <em>only</em> during your AI request — then immediately cleared. No Nebula staff, developer, or other user can ever read it.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAFETY_PROOFS.map((proof) => (
            <div key={proof.title} className="arc-card-elevated p-5 space-y-2 border border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-xl">{proof.icon}</span>
                <h3 className="font-bold text-sm text-white">{proof.title}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{proof.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── FAQ ─── */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold arc-font-display text-center" style={{ color: "var(--arc-text-hero)" }}>
          ❓ Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="arc-card-elevated rounded-2xl border border-white/5 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left px-5 py-4 flex justify-between items-center gap-3"
              >
                <span className="text-sm font-semibold text-white">{faq.q}</span>
                <span className="text-slate-400 text-lg shrink-0 transition-transform" style={{ transform: openFaq === i ? "rotate(45deg)" : "rotate(0)" }}>+</span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── HELP CHAT ─── */}
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold arc-font-display" style={{ color: "var(--arc-text-hero)" }}>
            💬 Still Need Help? Ask Here!
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Can't figure something out? Chat with our built-in Help Assistant below — it can answer any question about using Nebula or setting up your API key!
          </p>
        </div>
        <HelpChat />
      </div>

      {/* ─── WHY USEFUL ─── */}
      <div className="p-8 rounded-3xl border shadow-lg" style={{ background: "rgba(212, 175, 55, 0.05)", borderColor: "rgba(212,175,55,0.2)" }}>
        <h2 className="text-2xl font-bold arc-font-display mb-6" style={{ color: "var(--arc-text-hero)" }}>
          💡 Why is Nebula Useful for You?
        </h2>
        <ul className="space-y-5">
          {[
            { icon: "⚡", title: "Saves Time", body: "Stop manually searching for study materials. Nebula generates highly tailored notes, flashcards, and quizzes in seconds." },
            { icon: "🛡️", title: "Secure BYOK System", body: "Bring Your Own Key means maximum privacy. Your data is completely isolated and your Gemini API key is encrypted with military-grade AES-256-GCM." },
            { icon: "📈", title: "Gamified Progress", body: "Studying shouldn't be boring. Track your learning streaks, earn XP, and unlock badges as you master new topics." },
            { icon: "🆓", title: "Completely Free to Start", body: "No subscriptions, no credit cards. The PYQ Hub works 100% free. AI features need only a free Google API key." },
          ].map((item) => (
            <li key={item.title} className="flex gap-4 items-start">
              <span className="text-2xl mt-1 flex-shrink-0">{item.icon}</span>
              <p className="text-sm md:text-base leading-relaxed text-slate-200">
                <strong className="text-white">{item.title}:</strong> {item.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SummaryPage;
