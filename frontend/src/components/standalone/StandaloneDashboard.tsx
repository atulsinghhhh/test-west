import { useEffect, useState } from "react";
import { Loader2, TrendingUp, AlertTriangle, CheckCircle, Brain, Calendar, Target } from "lucide-react";
import { useAuth } from "../../context/AuthProvider";

interface AnalysisData {
  motivation: string;
  strengths: string[];
  weaknesses: string[];
  trend: string;
  subjectInsights: { subject: string; insight: string }[];
  mistakePatterns: string[];
  suggestedFocusAreas: string[];
  weeklyPlan: string[];
  positiveNote: string;
}

export default function StandaloneDashboard() {
  const {baseurl} = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`${baseurl}/standalone/dashboard-analysis`, {
            method: 'GET',
            credentials: 'include' 
        });
        
        if (!response.ok) {
            throw new Error("Failed to fetch analysis");
        }
        
        const data = await response.json();
        if (data.success) {
            setAnalysis(data.analysis);
        } else {
            throw new Error(data.message || "Failed to load data");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-400">Analyzing your performance...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-lg text-red-400 flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        <span>Error: {error}</span>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-6">
      {/* Welcome & Motivation */}
      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-800/50 rounded-2xl p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Your Personal Coach Report</h2>
        <p className="text-lg text-blue-100 italic">"{analysis.motivation}"</p>
        <div className="mt-4 flex items-center gap-2 text-sm text-blue-300">
            <TrendingUp className="h-4 w-4" />
            <span>Current Trend: <span className="font-semibold text-white">{analysis.trend}</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 text-green-400 mb-4">
            <CheckCircle className="h-5 w-5" />
            <h3 className="font-semibold text-lg">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {analysis.strengths.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-300">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 text-red-400 mb-4">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="font-semibold text-lg">Areas for Improvement</h3>
          </div>
          <ul className="space-y-2">
            {analysis.weaknesses.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-300">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Subject Insights */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-2 text-purple-400 mb-4">
          <Brain className="h-5 w-5" />
          <h3 className="font-semibold text-lg">Subject Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.subjectInsights.map((item, i) => (
            <div key={i} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <h4 className="font-semibold text-purple-300 mb-1">{item.subject}</h4>
              <p className="text-sm text-gray-400">{item.insight}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Plan */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 text-blue-400 mb-4">
            <Calendar className="h-5 w-5" />
            <h3 className="font-semibold text-lg">7-Day Plan</h3>
          </div>
          <ul className="space-y-3">
            {analysis.weeklyPlan.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                <span className="px-2 py-0.5 rounded border border-blue-500/30 text-blue-400 text-xs shrink-0">Day {i + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Focus Areas & Mistakes */}
        <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-2 text-yellow-400 mb-4">
                    <Target className="h-5 w-5" />
                    <h3 className="font-semibold text-lg">Focus Areas</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                {analysis.suggestedFocusAreas.map((item, i) => (
                    <span key={i} className="px-3 py-1 rounded-full bg-yellow-900/20 text-yellow-300 text-sm border border-yellow-900/30">
                    {item}
                    </span>
                ))}
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
                    Common Mistake Patterns
                </h3>
                <ul className="space-y-1">
                {analysis.mistakePatterns.map((item, i) => (
                    <li key={i} className="text-sm text-gray-400">• {item}</li>
                ))}
                </ul>
            </div>
        </div>
      </div>

      {/* Positive Note */}
      <div className="text-center p-6 text-gray-400 italic border-t border-gray-800">
        "{analysis.positiveNote}"
      </div>
    </div>
  );
}
