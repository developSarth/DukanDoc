# DukanDoc 🇮🇳
**Your AI Business Setup Guide for India (Currently Maharashtra)**

Starting a business in India shouldn't feel like navigating a maze of obscure municipal portals, paperwork, and middlemen. 

**DukanDoc** is an intelligent compliance guide built for Indian entrepreneurs. Tell it what kind of business you're launching and where, and it instantly maps out your complete compliance roadmap — including Central, State, and Municipal licenses (FSSAI, GST, Udyam MSME, Shop & Establishment Gumasta, BMC Health Trade permits), official government fees, exact timelines, official portal links, YouTube video walkthroughs, and verified local experts.

**Deployed Link : http://13.203.197.156/ **
---

## ✨ Key Features

- 📋 **Personalized Compliance Checklist**: Dynamic requirement mapping tailored to your business type, scale, and location.
- 🏛️ **Official Portals & Transparent Fees**: Direct links to government filing portals (*Aaple Sarkar*, *FoSCoS*, *Mahagst*, *GSTN*) with zero hidden broker markups.
- 📺 **Step-by-Step Video Walkthroughs**: Curated YouTube guides inside each document dossier to help you apply yourself.
- 📅 **Deadline & Reminder Tracking**: Progress tracking with custom filing deadlines and status indicators.
- 🤝 **Local Expert Directory**: Connect directly with verified local Chartered Accountants, advocates, and filing agents near your shop.
- 🌐 **Multilingual**: Full support for English, Hindi (**हिंदी**), and Marathi (**मराठी**).
- 🧭 **Guided Onboarding**: A gentle, skippable walkthrough highlighting key platform workflows.

---

## 🚀 Running Locally

### 1. Clone the Repository
```bash
git clone https://github.com/developSarth/DukanDoc.git
cd DukanDoc
```

### 2. Frontend Setup (React + Vite)
```bash
# Install dependencies
npm install

# Start the Vite dev server
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 3. Backend Setup (FastAPI + Python)
In a separate terminal:
```bash
# Navigate to backend
cd backend

# Install Python requirements
pip install -r requirements.txt

# Start the API server
python server.py
```
The backend will boot on **[http://localhost:8000](http://localhost:8000)**.

### 4. Environment Variables
Create a `.env` file in the project root:
```env
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
SERPAPI_KEY=your_serpapi_key_here
```
*(See `.env.example` for reference.)*

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Date-fns
- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pandas, OpenPyXL
- **AI & Integrations**: OpenAI GPT-4o-mini, Google Places API
- **Deployment**: AWS EC2 (Ubuntu), Nginx reverse proxy

---

## 🤝 Contributing & Feedback

Got ideas to improve compliance workflows for local shops? Found an outdated government fee or portal link? PRs and issues are warmly welcomed!

Made with ❤️ for entrepreneurs across India.
