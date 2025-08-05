
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { StyleSelector } from './components/StyleSelector';
import { DimensionsInput } from './components/DimensionsInput';
import { Loader } from './components/Loader';
import { DesignSuggestions } from './components/DesignSuggestions';
import { generateDesignIdeas, generateRedesignedImage, generateMorePalettes } from './services/geminiService';
import { DESIGN_STYLES } from './constants';
import type { DesignPlan, RoomDimensions, ColorPalette } from './types';

const App: React.FC = () => {
  const [selectedStyle, setSelectedStyle] = useState<string>(DESIGN_STYLES[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null); // base64
  const [imagePreview, setImagePreview] = useState<string | null>(null); // object URL
  const [roomDimensions, setRoomDimensions] = useState<RoomDimensions>({ width: '', length: '', unit: 'ft' });
  const [designPlan, setDesignPlan] = useState<DesignPlan | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null); // data URL for AI image
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [isFetchingPalettes, setIsFetchingPalettes] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = useCallback((file: File) => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    
    setImagePreview(URL.createObjectURL(file));
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      setUploadedImage(base64String);
    };
    reader.onerror = (err) => {
      console.error("Error reading file:", err);
      setError("Failed to read the image file.");
    };
  }, [imagePreview]);

  const handleGenerateClick = useCallback(async () => {
    if (!uploadedImage || !selectedStyle) {
      setError("Please upload an image and select a style.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setDesignPlan(null);
    setGeneratedImage(null);

    let newPlan: DesignPlan | null = null;
    try {
      newPlan = await generateDesignIdeas(uploadedImage, selectedStyle, roomDimensions);
      setDesignPlan(newPlan);

      const imageBytes = await generateRedesignedImage(newPlan, selectedStyle);
      setGeneratedImage(`data:image/jpeg;base64,${imageBytes}`);

    } catch (err) {
      console.error(err);
      if (newPlan) {
        setError("I've created the design plan, but couldn't visualize the room. You can still see the ideas below!");
      } else {
        setError("Sorry, I couldn't generate ideas. The AI might be busy. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [uploadedImage, selectedStyle, roomDimensions]);

  const handleColorChange = useCallback(async (newColors: ColorPalette) => {
    if (!designPlan) return;

    setIsRegenerating(true);
    setGeneratedImage(null); // Clear old image to show loader
    setError(null);

    const updatedPlan = { ...designPlan, wallColor: newColors };
    setDesignPlan(updatedPlan);

    try {
        const imageBytes = await generateRedesignedImage(updatedPlan, selectedStyle, newColors);
        setGeneratedImage(`data:image/jpeg;base64,${imageBytes}`);
    } catch (err) {
        console.error("Failed to regenerate image with new colors", err);
        setError("Sorry, I couldn't update the design with the new colors.");
    } finally {
        setIsRegenerating(false);
    }
  }, [designPlan, selectedStyle]);

  const handleSuggestMorePalettes = useCallback(async () => {
    if (!designPlan) return;
    setIsFetchingPalettes(true);
    setError(null);
    try {
      const newPalettes = await generateMorePalettes(designPlan, selectedStyle);
      setDesignPlan(prevPlan => {
        if (!prevPlan) return null;
        const existingPalettes = prevPlan.alternativePalettes.map(p => JSON.stringify(p));
        const uniqueNewPalettes = newPalettes.filter(p => !existingPalettes.includes(JSON.stringify(p)));
        return {
          ...prevPlan,
          alternativePalettes: [...prevPlan.alternativePalettes, ...uniqueNewPalettes],
        };
      });
    } catch (err) {
      console.error("Failed to fetch more palettes", err);
      setError("Sorry, couldn't fetch more color ideas right now. Please try again in a bit.");
    } finally {
      setIsFetchingPalettes(false);
    }
  }, [designPlan, selectedStyle]);


  const handleReset = useCallback(() => {
    setSelectedStyle(DESIGN_STYLES[0]);
    setUploadedImage(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setRoomDimensions({ width: '', length: '', unit: 'ft' });
    setDesignPlan(null);
    setGeneratedImage(null);
    setError(null);
    setIsLoading(false);
    setIsRegenerating(false);
    setIsFetchingPalettes(false);
  }, [imagePreview]);

  const isButtonDisabled = !uploadedImage || isLoading;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        {!designPlan && !isLoading && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-700 mb-2">Upload Your Room, Reimagine Your Space</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">Let our AI give you a complete interior design makeover. Start by uploading a photo of your room and choosing your favorite design style.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              <ImageUploader onImageUpload={handleImageUpload} imagePreview={imagePreview} />
              <div className="flex flex-col space-y-6">
                 <StyleSelector
                  selectedStyle={selectedStyle}
                  onStyleChange={setSelectedStyle}
                />
                 <DimensionsInput 
                  dimensions={roomDimensions}
                  onDimensionsChange={setRoomDimensions}
                />
                 <button
                  onClick={handleGenerateClick}
                  disabled={isButtonDisabled}
                  className={`w-full text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 ${
                    isButtonDisabled
                      ? 'bg-indigo-300 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl'
                  }`}
                >
                  Generate Makeover Ideas
                </button>
              </div>
            </div>

            {error && <div className="mt-6 text-center text-red-500 bg-red-100 p-3 rounded-lg">{error}</div>}
          </div>
        )}
        
        {isLoading && <Loader />}

        {designPlan && (
           <div className="max-w-7xl mx-auto">
            {error && <div className="mb-6 text-center text-yellow-700 bg-yellow-100 p-3 rounded-lg">{error}</div>}
            <DesignSuggestions 
                plan={designPlan} 
                originalImage={imagePreview} 
                generatedImage={generatedImage}
                onColorChange={handleColorChange}
                isRegenerating={isRegenerating}
                onSuggestMorePalettes={handleSuggestMorePalettes}
                isFetchingPalettes={isFetchingPalettes}
            />
            <div className="text-center mt-12">
              <button 
                onClick={handleReset} 
                className="bg-slate-600 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:bg-slate-700 transition-colors duration-300">
                  Start a New Project
              </button>
            </div>
          </div>
        )}
      </main>
      <footer className="text-center p-4 text-slate-400 text-sm">
        <p>Powered by AI. Designs are for inspiration.</p>
      </footer>
    </div>
  );
};

export default App;
