# 🛰️ Sentry AI — NSFW Content Intelligence & Surveillance Platform

Sentry AI is a powerful platform for **detecting**, **analyzing**, and **visualizing** NSFW (Not Safe For Work) content across Instagram. It uses a combination of scraping, deep learning, and interactive data visualization to reveal potentially explicit content shared online — and **where** it's coming from.

### 🏠 Homepage

![WhatsApp Image 2025-06-09 at 18 51 40_baf3a616](https://github.com/user-attachments/assets/c4159aa4-ad02-41a4-a0e7-6a1771bfeed2)

&nbsp;

### 🌍 GlobalView

An interactive 3D Earth displaying flagged accounts and content by geographic origin.

![WhatsApp Image 2025-06-09 at 18 52 05_e07e1a0c](https://github.com/user-attachments/assets/b7b82971-f570-418d-a8ef-19360784efb8)

&nbsp;

### 📊 Dashboard

Displays all scraped and NSFW-flagged content as reviewable post cards with insights.

![WhatsApp Image 2025-06-09 at 18 52 20_bff12f6e](https://github.com/user-attachments/assets/e68734f1-0331-4254-8b9d-a6778d7d53ae)

&nbsp;

### ℹ️ About Page

Provides a detailed explanation of how the system works, including the scraping logic, nudity scoring system, and review process.

![WhatsApp Image 2025-06-09 at 18 52 37_361feac1](https://github.com/user-attachments/assets/e82ef526-966a-4d62-89ca-dcf7971064fb)

---

## 🚀 Features

- 🔍 **Seed-based Account Scanning**: Begin with known NSFW accounts and grow outward.
- 🌐 **Geolocation Visuals**: Pinpoint where flagged accounts are located via 3D globe.
- 🧠 **Deep Learning Detection**: Uses TensorFlow model for nudity scoring on images & videos.
- 🧾 **Smart Caption Scoring**: NLP-based tag/emoji parsing to assist classification.
- 🧑‍💻 **Google Login & Contribution**: Users can request new accounts for investigation and review flagged content.
- 📊 **User Review Metrics**: Track how many posts you've added or labeled accurately.

---

## ⚙️ Tech Stack

- **Frontend**: React, Tailwind CSS, React Three Fiber (3D Globe)
- **Backend**: FastAPI, SQLite, Firebase Auth, Playwright
- **AI Models**: TensorFlow NSFW Classifier (GantMan)
- **Hosting**: Vercel/Netlify + Railway/Fly.io (or self-hosted)

---

## 🛠️ Installation

```bash
# Clone repository
git clone https://github.com/yourusername/sentry-ai.git
cd sentry-ai

# Set up backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate (Windows)
pip install -r requirements.txt

# Set up frontend
cd ../frontend
npm install
npm run dev
