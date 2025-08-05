
import { GoogleGenAI, Type } from "@google/genai";
import type { DesignPlan, RoomDimensions, ColorPalette } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const designPlanSchema = {
  type: Type.OBJECT,
  properties: {
    analysis: {
      type: Type.STRING,
      description: "A brief analysis of the current room's layout, lighting, and existing decor. If room dimensions were provided, mention how they influence the design.",
    },
    wallColor: {
      type: Type.OBJECT,
      description: "Recommendations for the primary wall color palette.",
      properties: {
        color: { type: Type.STRING, description: "The primary wall color suggestion (e.g., 'Soft Off-White')." },
        accent: { type: Type.STRING, description: "An accent wall color suggestion (e.g., 'Charcoal Gray')." },
      },
    },
    lighting: {
      type: Type.STRING,
      description: "Suggestions for lighting fixtures (e.g., 'A large, arched floor lamp and recessed ceiling lights').",
    },
    flooring: {
      type: Type.STRING,
      description: "Recommendations for flooring (e.g., 'Light oak hardwood floors or a large, neutral-toned area rug').",
    },
    furnitureSuggestions: {
      type: Type.ARRAY,
      description: "A list of 3-5 key furniture and decor items, appropriately scaled for the room size if provided.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "The name of the furniture or decor item (e.g., 'Plush Sectional Sofa')." },
          description: { type: Type.STRING, description: "A detailed description of the item's style, material, and color." },
          placement: { type: Type.STRING, description: "Where to place this item in the room." },
          estimatedPrice: { type: Type.NUMBER, description: "An estimated price for this item in USD." },
        },
      },
    },
    estimatedCost: {
        type: Type.OBJECT,
        description: "An estimated budget range for the entire makeover in USD.",
        properties: {
            min: { type: Type.NUMBER, description: "The minimum estimated cost in USD."},
            max: { type: Type.NUMBER, description: "The maximum estimated cost in USD."},
            currency: { type: Type.STRING, description: "The currency, e.g., 'USD'."}
        }
    },
    alternativePalettes: {
      type: Type.ARRAY,
      description: "A list of exactly 3 alternative color palettes that also fit the style. Each should have a primary and an accent color.",
      items: {
        type: Type.OBJECT,
        properties: {
          color: { type: Type.STRING, description: "The alternative primary wall color." },
          accent: { type: Type.STRING, description: "The alternative accent wall color." },
        },
      },
    },
  },
  required: ['analysis', 'wallColor', 'lighting', 'flooring', 'furnitureSuggestions', 'estimatedCost', 'alternativePalettes'],
};

export const generateDesignIdeas = async (base64Image: string, style: string, dimensions: RoomDimensions): Promise<DesignPlan> => {
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image,
    },
  };

  let dimensionText = '';
  if (dimensions && dimensions.width && dimensions.length) {
      const unitName = dimensions.unit === 'ft' ? 'feet' : 'meters';
      dimensionText = ` The user has specified the room is approximately ${dimensions.width} ${unitName} wide by ${dimensions.length} ${unitName} long. Please ensure your furniture suggestions and layout advice are appropriately scaled for a room of this size and explicitly mention this in your analysis.`
  }

  const textPart = {
    text: `You are a world-class AI interior designer. Analyze the provided room image and generate a complete design makeover plan in a friendly and inspiring tone. The user wants a "${style}" style. 
    ${dimensionText}
    Your tasks are:
    1. Briefly analyze the current room's strengths and weaknesses.
    2. Suggest a full makeover based on the selected style, keeping the provided dimensions in mind if available.
    3. Output specific ideas for a primary wall color palette, flooring, and lighting.
    4. Recommend 3-5 key furniture or decor items with detailed descriptions and placement advice, ensuring they are scaled correctly for the room.
    5. Provide a realistic, estimated total budget range (min and max) for the complete makeover. Also, include an estimated price for each recommended furniture item. All monetary values should be in USD.
    6. Also provide exactly 3 alternative color palettes (primary and accent) that would offer a different mood while still fitting the requested style.

    Provide the output in JSON format according to the provided schema. Ensure the descriptions are vivid and helpful.`,
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: designPlanSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    
    if (!parsedJson.furnitureSuggestions || !parsedJson.estimatedCost || !parsedJson.alternativePalettes) {
        throw new Error("AI response is missing required fields like 'furnitureSuggestions', 'estimatedCost', or 'alternativePalettes'.");
    }
    
    return parsedJson as DesignPlan;

  } catch (error) {
    console.error("Error generating design ideas from Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get a valid design plan from the AI: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the AI.");
  }
};


export const generateRedesignedImage = async (designPlan: DesignPlan, style: string, newColors?: ColorPalette): Promise<string> => {
  const furnitureList = designPlan.furnitureSuggestions.map(f => f.name).join(', ');
  const primaryColor = newColors?.color || designPlan.wallColor.color;
  const accentColor = newColors?.accent || designPlan.wallColor.accent;

  const prompt = `A photorealistic, high-quality interior design photograph of a room redesigned in the ${style} style, based on an analysis of a previous photo.
- The primary wall color is ${primaryColor} with an accent wall in ${accentColor}.
- The flooring is ${designPlan.flooring}.
- Key furniture includes: ${furnitureList}. These items should be scaled appropriately for the room's context.
- The lighting style is: ${designPlan.lighting}.
- The overall atmosphere should be bright, inviting, and professionally designed. The image should be from a natural perspective, as if someone is standing in the room. Do not include any text, logos, or watermarks.`;

  try {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      return response.generatedImages[0].image.imageBytes;
    } else {
      throw new Error("The AI did not return any images.");
    }
  } catch (error) {
    console.error("Error generating image from Imagen:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate a redesigned image from the AI: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the image.");
  }
};

const morePalettesSchema = {
    type: Type.ARRAY,
    description: "A list of exactly 3 new and distinct color palettes. Each palette must have a primary and an accent color.",
    items: {
      type: Type.OBJECT,
      properties: {
        color: { type: Type.STRING, description: "The new primary wall color." },
        accent: { type: Type.STRING, description: "The new accent wall color." },
      },
       required: ['color', 'accent'],
    },
};

export const generateMorePalettes = async (designPlan: DesignPlan, style: string): Promise<ColorPalette[]> => {
    const existingPalettes = [designPlan.wallColor, ...designPlan.alternativePalettes]
        .map(p => `- ${p.color} & ${p.accent}`)
        .join('\n');

    const prompt = `You are an AI color consultant for an interior design app. Based on the following design analysis for a "${style}" themed room, please generate exactly 3 new and distinct color palettes.

    **Design Analysis:** ${designPlan.analysis}

    **Important:** The user has already seen the following palettes, so please provide completely different options that suggest different moods (e.g., one calming, one energetic, one sophisticated):
    ${existingPalettes}
    
    Return the output as a JSON array of objects, where each object has a 'color' and 'accent' property, according to the provided schema.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ text: prompt }] },
            config: {
              responseMimeType: "application/json",
              responseSchema: morePalettesSchema,
              temperature: 0.8,
            },
        });

        const jsonText = response.text.trim();
        const parsedJson = JSON.parse(jsonText);
        return parsedJson as ColorPalette[];
    } catch (error) {
        console.error("Error generating more palettes from Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get new palettes from the AI: ${error.message}`);
        }
        throw new Error("An unknown error occurred while fetching new palettes.");
    }
};
