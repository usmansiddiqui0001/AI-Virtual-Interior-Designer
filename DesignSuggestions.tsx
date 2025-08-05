
import React from 'react';
import type { DesignPlan, FurnitureSuggestion, ColorPalette } from '../types';

interface DesignSuggestionsProps {
  plan: DesignPlan | null;
  originalImage: string | null;
  generatedImage: string | null;
  onColorChange: (palette: ColorPalette) => void;
  isRegenerating: boolean;
  onSuggestMorePalettes: () => Promise<void>;
  isFetchingPalettes: boolean;
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, children, icon }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg h-full">
    <div className="flex items-center mb-3">
      <div className="w-8 h-8 flex items-center justify-center text-indigo-500">{icon}</div>
      <h3 className="text-xl font-bold text-slate-700 ml-2">{title}</h3>
    </div>
    <div className="text-slate-600 space-y-2">{children}</div>
  </div>
);

const FurnitureCard: React.FC<{ item: FurnitureSuggestion }> = ({ item }) => (
    <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg h-full flex flex-col">
        <div className="flex justify-between items-start mb-2">
            <h4 className="text-lg font-bold text-slate-800 pr-4">{item.name}</h4>
            {item.estimatedPrice > 0 && (
                <p className="text-lg font-semibold text-indigo-600 whitespace-nowrap">
                    ~${item.estimatedPrice.toLocaleString()}
                </p>
            )}
        </div>
        <p className="text-slate-600 text-sm mb-3 flex-grow">{item.description}</p>
        <div className="mt-auto pt-3 border-t border-slate-200">
            <p className="text-xs font-semibold text-indigo-700 uppercase">Placement</p>
            <p className="text-slate-500 text-sm">{item.placement}</p>
        </div>
    </div>
);

const PaletteButton: React.FC<{ palette: ColorPalette; onClick: () => void; disabled: boolean; }> = ({ palette, onClick, disabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="group relative w-full h-28 rounded-xl border-2 border-slate-200 overflow-hidden text-left shadow-sm transition-all duration-200 hover:border-indigo-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-slate-200"
            style={{ backgroundColor: palette.color }}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent p-3 flex flex-col justify-end">
                <p className="text-white font-bold text-sm truncate">{palette.color}</p>
                <p className="text-white/80 text-xs truncate">{palette.accent}</p>
            </div>
            <div 
                className="absolute top-3 right-3 w-8 h-8 rounded-full border-2 border-white/50 shadow-md" 
                style={{ backgroundColor: palette.accent }}
            ></div>
        </button>
    );
};

export const DesignSuggestions: React.FC<DesignSuggestionsProps> = ({ plan, originalImage, generatedImage, onColorChange, isRegenerating, onSuggestMorePalettes, isFetchingPalettes }) => {
  if (!plan) return null;

  return (
    <div className="animate-fade-in">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-700 text-center mb-12">Your Personalized Design Plan ✨</h2>

        {/* Image Comparison Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col">
                <h3 className="text-xl font-bold text-slate-700 mb-3 text-center">Original Room</h3>
                {originalImage ? (
                     <img src={originalImage} alt="Original room" className="rounded-lg object-cover w-full aspect-[16/9] flex-grow" />
                ): <div className="rounded-lg bg-slate-100 aspect-[16/9] flex-grow"></div>}
            </div>
            <div className="bg-white p-4 rounded-xl shadow-lg flex flex-col">
                <h3 className="text-xl font-bold text-slate-700 mb-3 text-center">Your New Design</h3>
                <div className="flex-grow">
                    {generatedImage && !isRegenerating ? (
                        <img src={generatedImage} alt="AI generated design" className="rounded-lg object-cover w-full aspect-[16/9]" />
                    ) : (
                        <div className="aspect-[16/9] bg-slate-100 rounded-lg flex flex-col items-center justify-center">
                            <div className="relative w-12 h-12">
                                <div className="absolute border-2 border-indigo-200 rounded-full w-full h-full"></div>
                                <div className="absolute border-2 border-t-indigo-500 border-l-indigo-500 border-b-transparent border-r-transparent rounded-full w-full h-full animate-spin"></div>
                            </div>
                            <p className="mt-4 text-sm text-slate-500">Generating visualization...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        {/* Designer's Analysis */}
        <div className="mb-12">
            <InfoCard title="Designer's Analysis" icon={<AnalysisIcon />}>
                <p>{plan.analysis}</p>
            </InfoCard>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <InfoCard title="Estimated Budget" icon={<MoneyIcon />}>
                <p className="text-2xl font-bold text-slate-700">
                    ${plan.estimatedCost.min.toLocaleString()} - ${plan.estimatedCost.max.toLocaleString()}
                    <span className="text-sm font-normal text-slate-500 ml-2">{plan.estimatedCost.currency}</span>
                </p>
            </InfoCard>
            <InfoCard title="Color Palette" icon={<PaletteIcon />}>
                <p><strong>Primary:</strong> {plan.wallColor.color}</p>
                <p><strong>Accent:</strong> {plan.wallColor.accent}</p>
            </InfoCard>
            <InfoCard title="Lighting" icon={<LightbulbIcon />}>
                <p>{plan.lighting}</p>
            </InfoCard>
            <InfoCard title="Flooring" icon={<FlooringIcon />}>
                <p>{plan.flooring}</p>
            </InfoCard>
        </div>

        {/* Alternative Colors Section */}
        {plan.alternativePalettes && plan.alternativePalettes.length > 0 && (
            <div className="mb-12">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                     <h3 className="text-2xl font-bold text-slate-700 mb-6 text-center">Not feeling the colors? Try these!</h3>
                     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                        {plan.alternativePalettes.map((palette, index) => (
                           <PaletteButton 
                                key={index}
                                palette={palette}
                                onClick={() => onColorChange(palette)}
                                disabled={isRegenerating || isFetchingPalettes}
                           />
                        ))}
                     </div>
                     <div className="text-center">
                        <button
                            onClick={onSuggestMorePalettes}
                            disabled={isRegenerating || isFetchingPalettes}
                            className="inline-flex items-center justify-center bg-indigo-100 text-indigo-700 font-semibold py-2 px-5 rounded-lg hover:bg-indigo-200 transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isFetchingPalettes ? (
                                <>
                                    <SpinnerIcon />
                                    <span>Fetching Ideas...</span>
                                </>
                            ) : (
                                <span>Suggest More Palettes</span>
                            )}
                        </button>
                     </div>
                </div>
            </div>
        )}

        {/* Furniture & Decor Section */}
        <div>
            <h3 className="text-2xl font-bold text-slate-700 mb-6 text-center">Key Furniture & Decor</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plan.furnitureSuggestions.map((item, index) => (
                    <FurnitureCard key={index} item={item} />
                ))}
            </div>
        </div>
    </div>
  );
};

// SVG Icons
const SpinnerIcon = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);
const MoneyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 6v-1h4a2 2 0 012 2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h4z" />
    </svg>
);
const PaletteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h8a2 2 0 002-2v-4a2 2 0 00-2-2h-8a2 2 0 00-2 2v4a2 2 0 002 2z" />
  </svg>
);
const AnalysisIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const LightbulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);
const FlooringIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 16V8" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 16V8" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16" />
  </svg>
);
