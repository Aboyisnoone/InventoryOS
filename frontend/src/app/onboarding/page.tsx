"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { useMutation } from "@apollo/client/react";
import { GENERATE_AI_CONFIGURATION, APPROVE_CONFIGURATION } from "@/graphql/operations";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiConfig, setAiConfig] = useState<any>(null);

  const [generateAI] = useMutation(GENERATE_AI_CONFIGURATION);
  const [approveConfig] = useMutation(APPROVE_CONFIGURATION);

  const categories = [
    "Retail Store",
    "Grocery Store",
    "Pharmacy",
    "Clothing Store",
    "Electronics Shop",
    "Hardware Store",
    "Restaurant/Cafe",
    "Warehouse",
    "Other"
  ];

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    try {
      const { data } = await generateAI({
        variables: {
          description: `A ${category} named ${businessName}`
        }
      });
      // The backend returns a stringified JSON
      const parsedConfig = JSON.parse(data.generateAIConfiguration);
      setAiConfig(parsedConfig);
      setStep(3);
    } catch (err) {
      console.error("AI Generation failed:", err);
      alert("Failed to generate workspace configuration. Using default template.");
      setAiConfig({
        inventory_fields: ["SKU", "Barcode", "Product Name", "Purchase Price", "Selling Price", "Quantity"],
        requires_expiry_tracking: false,
        requires_batch_tracking: false
      });
      setStep(3);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async () => {
    try {
      await approveConfig({
        variables: {
          configSchema: aiConfig
        }
      });
      localStorage.setItem("has_business", "true");
      alert("Workspace Approved! The dashboard will now reflect these settings.");
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Failed to approve configuration.");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center pt-16 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden">
        
        {/* Progress Bar */}
        <div className="h-2 flex w-full">
          <div className={`h-full bg-indigo-600 transition-all duration-500 ease-out ${step === 1 ? 'w-1/3' : step === 2 ? 'w-2/3' : 'w-full'}`} />
          <div className="flex-1 bg-zinc-100" />
        </div>

        <div className="p-10">
          
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">Let's create your workspace</h2>
              <p className="text-zinc-500 mb-8">What is the name of your business?</p>
              
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Acme Corporation"
                className="w-full px-5 py-4 text-lg border border-zinc-300 rounded-xl text-zinc-900 font-semibold placeholder-zinc-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition mb-8"
                autoFocus
              />
              
              <button
                onClick={() => setStep(2)}
                disabled={!businessName.trim()}
                className="w-full bg-indigo-600 disabled:bg-zinc-300 hover:bg-indigo-700 text-white font-semibold py-4 px-4 rounded-xl transition flex justify-center items-center"
              >
                Continue <ChevronRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          )}

          {/* STEP 2: Category & AI Trigger */}
          {step === 2 && !isGenerating && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">What type of business is {businessName}?</h2>
              <p className="text-zinc-500 mb-8">Our AI will automatically build the perfect inventory schema for your category.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-4 py-4 rounded-xl border text-sm font-medium transition text-left ${
                      category === c 
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700" 
                      : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              
              <button
                onClick={handleGenerateAI}
                disabled={!category}
                className="w-full bg-zinc-900 disabled:bg-zinc-300 hover:bg-zinc-800 text-white font-semibold py-4 px-4 rounded-xl transition flex justify-center items-center shadow-md shadow-zinc-900/20"
              >
                <Sparkles className="mr-2 w-5 h-5 text-indigo-400" /> Let Gemini build my workspace
              </button>
            </div>
          )}

          {/* GENERATING STATE */}
          {isGenerating && (
            <div className="py-20 flex flex-col items-center justify-center animate-in fade-in duration-500 text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                <Sparkles className="w-16 h-16 text-indigo-600 animate-bounce relative z-10" />
              </div>
              <h3 className="text-xl font-bold text-zinc-900 mt-8 mb-2">Gemini is analyzing {category}...</h3>
              <p className="text-zinc-500 max-w-sm">Designing the optimal database schema, inventory fields, and dashboard for your business.</p>
            </div>
          )}

          {/* STEP 3: Review Configuration */}
          {step === 3 && aiConfig && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">Workspace Generated!</h2>
                  <p className="text-sm text-zinc-500">Review Gemini's recommendations below.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Inventory Fields */}
                <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-200">
                  <h3 className="font-semibold text-zinc-900 mb-3 flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mr-2" /> Required Inventory Fields
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(aiConfig.inventory_fields || []).map((field: string) => (
                      <span key={field} className="px-3 py-1 bg-white border border-zinc-200 rounded-full text-xs font-medium text-zinc-700">
                        {field}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tracking Toggles */}
                <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-200 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-zinc-900 text-sm">Expiry Tracking</h3>
                      <p className="text-xs text-zinc-500">Track expiration dates and get alerts.</p>
                    </div>
                    <div className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 cursor-pointer ${aiConfig.requires_expiry_tracking ? 'bg-emerald-500' : 'bg-zinc-300'}`} onClick={() => setAiConfig({...aiConfig, requires_expiry_tracking: !aiConfig.requires_expiry_tracking})}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${aiConfig.requires_expiry_tracking ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>
                  <div className="w-full h-px bg-zinc-200" />
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-zinc-900 text-sm">Batch Tracking</h3>
                      <p className="text-xs text-zinc-500">Track manufacturer lot/batch numbers.</p>
                    </div>
                    <div className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 cursor-pointer ${aiConfig.requires_batch_tracking ? 'bg-emerald-500' : 'bg-zinc-300'}`} onClick={() => setAiConfig({...aiConfig, requires_batch_tracking: !aiConfig.requires_batch_tracking})}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${aiConfig.requires_batch_tracking ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-zinc-100">
                <button
                  onClick={handleApprove}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-4 rounded-xl transition flex justify-center items-center shadow-lg shadow-indigo-600/20"
                >
                  Approve & Create Workspace
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
