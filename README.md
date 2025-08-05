# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

# 🏠 AI Virtual Interior Designer

An AI-powered web tool that allows users to upload a room photo and select a design style like **Modern**, **Minimal**, or **Royal**. The tool then generates personalized interior makeover suggestions — including wall colors, furniture layout, lighting, and décor ideas.

---

## ✨ Features

- 📷 Upload your room photo (bedroom, living room, etc.)
- 🎨 Choose from design styles: Modern, Minimal, or Royal
- 🧠 AI generates:
  - Wall color suggestions
  - Furniture layout ideas
  - Lighting and decor tips
- 🛋️ Product recommendations (optional)

---

## 🛠️ Built With

- **React.js** + **TailwindCSS**
- **Google Gemini AI** or **OpenAI GPT-4 Vision API**
- **Cloudinary** / **Firebase** for image upload (optional)
- **Vercel** or **Netlify** for deployment

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ai-virtual-interior-designer.git
cd ai-virtual-interior-designer
