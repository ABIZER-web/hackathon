import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="bg-[#020817] text-white min-h-screen">
      <section className="flex flex-col items-center justify-center pt-32 pb-20 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-medium mb-10 tracking-widest uppercase">
          ✦ AI-Powered • Computer Vision • Instant Matching
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
          Reunite With <br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            What Matters
          </span>
        </h1>
        
        <p className="text-slate-400 max-w-2xl mx-auto text-lg mb-12 leading-relaxed">
          Advanced AI analyzes your photos and finds perfect matches in our database.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link to="/report-lost" className="bg-orange-600 hover:bg-orange-700 px-10 py-4 rounded-xl font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-all">
            🔍 Report Lost Item <span>→</span>
          </Link>
          <Link to="/browse" className="bg-gradient-to-r from-cyan-600 to-blue-500 px-10 py-4 rounded-xl font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
            🌐 Browse All Items <span>→</span>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-900/30 border-y border-slate-800/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <Stat text="10K+" sub="Items Reunited" />
          <Stat text="95%" sub="Match Accuracy" />
          <Stat text="5K+" sub="Active Users" />
          <Stat text="24/7" sub="AI Monitoring" />
        </div>
      </section>
    </div>
  );
}

function Stat({ text, sub }) {
  return (
    <div>
      <h2 className="text-5xl font-extrabold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">{text}</h2>
      <p className="text-slate-500 mt-2 font-medium">{sub}</p>
    </div>
  );
}