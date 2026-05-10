# 🍱 MessMate - Smart Mess Finder

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Store-orange?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Images-blueviolet?style=for-the-badge&logo=cloudinary)](https://cloudinary.com/)

**MessMate** is a premium, high-performance platform designed to bridge the gap between mess owners and students. Whether you're looking for a hygienic meal near your college or you're an owner looking to manage your listings and requests, MessMate provides a seamless, real-time experience.

---

## ✨ Key Features

### 👨‍🎓 For Students
- **Interactive Map Search**: Pin-point messes on a live map with real-time pricing and ratings.
- **Live Seat Tracking**: See exactly how many seats are available in real-time before you visit.
- **Favorites & Reviews**: Save your favorite spots and read honest feedback from other students.
- **Join Requests**: Send instant queries or joining requests directly to mess owners.
- **Daily Menus**: Check what's cooking today before you step out.

### 👨‍🍳 For Owners
- **Powerful Dashboard**: Track your listings, average ratings, and student reviews in one place.
- **Mess Management**: Create, edit, and delete mess listings with ease.
- **Request Manager**: View and manage student joining requests in a dedicated tab.
- **Image Gallery**: Upload and manage high-quality photos of your mess using Cloudinary.
- **Location Pinning**: Set your exact mess location on the map for easy discovery.

---

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS
- **Backend**: Firebase Firestore (NoSQL Database)
- **Auth**: Firebase Authentication (Email & Google Login)
- **Storage**: Cloudinary (Optimized Image Delivery)
- **Maps**: Leaflet & OpenStreetMap
- **State Management**: Zustand
- **Animations**: Framer Motion & Lucide Icons

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- Firebase Project
- Cloudinary Account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shreyashmane-dev/MessMate.git
   cd MessMate
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file with your credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_id

   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

---

## 🎨 Design Philosophy
MessMate uses a **Premium Glassmorphic Design** with:
- **Vibrant Color Palettes**: Soft reds and deep slates for a modern feel.
- **Micro-Animations**: Smooth transitions using Framer Motion.
- **Responsive Layout**: Optimized for Mobile, Tablet, and Desktop.

---

## 📞 Support
Developed with ❤️ by **Shreyash Mane**. 
For queries, reach out via the platform's request system.
