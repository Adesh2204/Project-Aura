# Project Aura – Personal Safety Assistant

**Project Aura** is a modern web application designed to improve **personal safety**.  
It allows users to manage emergency contacts, store profile details, and trigger **voice-activated emergency support** — all in a clean, responsive interface.

---

## 🚀 Features

- 🔐 **Secure Authentication** (Supabase Auth)  
- 👤 **User Profile Management** (name, phone, details)  
- 📞 **Emergency Contacts** (add trusted people + default “911”)  
- 🎙 **Voice-Activated Assistance** (custom commands)  
- 📱 **Responsive UI** for mobile & desktop  

---

## 🛠 Tech Stack

- **Frontend**: React (Vite) + TypeScript + Tailwind CSS  
- **Backend**: Supabase (Auth, Database, Storage)  

---

## ⚡ Installation, Setup & Run

Follow these steps to get the project running locally:

```bash
# 1. Clone the repository
git clone https://github.com/Adesh2204/Project-Aura.git
cd Project-Aura

# 2. Install dependencies
npm install
# or
yarn

# 3. Create environment file
# In the root folder, create a file named `.env.local`
# and add the following :

VITE_SUPABASE_URL=https://ppqcrsmtijnbbxqizgvr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwcWNyc210aWpuYmJ4cWl6Z3ZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMzAwMTcsImV4cCI6MjA3MTYwNjAxN30.84AC8pI219Glh4aj22wbqLi-n-zdFO6QYsrHS0q9gHc

# 4. Start the development server
npm run dev
# or
yarn dev

