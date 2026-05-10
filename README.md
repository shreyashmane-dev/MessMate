# <div align="center">🥘 MessMate</div>

<div align="center">
  <img src="./messmate_readme_banner_1778412364055.png" alt="MessMate Banner" width="100%" style="border-radius: 24px; margin-bottom: 20px;" />
</div>

<div align="center">
  <h3>Connecting Students with Quality Meals through Technology</h3>
  
  [![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
  [![Firebase](https://img.shields.io/badge/Firebase-Realtime-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)
  [![Typescript](https://img.shields.io/badge/Typescript-Ready-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
</div>

---

## 🚀 Overview

**MessMate** is a premium, glassmorphic web application designed to bridge the gap between mess owners and students. Whether you are a student looking for the perfect meal plan or an owner wanting to digitize your operations, MessMate provides a seamless, interactive, and high-performance experience.

---

## ✨ Key Features

<div align="center">
  <img src="./messmate_features_illustration_1778412547714.png" alt="Features" width="80%" style="border-radius: 20px; margin: 20px 0;" />
</div>

### 🎯 For Students
- **Interactive Map Discovery**: Find messes near you with a high-performance Leaflet-based map.
- **Smart Filtering**: Filter by Food Type (Veg/Non-Veg), Gender (Boys/Girls/Co-ed), and Price Range.
- **Join Requests**: Send instant queries and join requests to mess owners with one click.
- **Real-time Availability**: See live seat availability and capacity before you visit.
- **Verified Reviews**: Read and write reviews to build a trusted community.

### 💼 For Mess Owners
- **Dynamic Dashboard**: Manage your listings, photos, and contact info in a sleek interface.
- **Weekly Menu Manager**: Publish your daily schedule and special items for students to see.
- **Request Management**: Accept or reject student join requests in real-time.
- **Analytics & Visibility**: Get your mess discovered by thousands of students in your city.

---

## 🛠️ Tech Stack

- **Core**: Next.js 15+ (App Router, Turbopack)
- **Styling**: Tailwind CSS + Framer Motion for smooth animations
- **Database**: Firebase Firestore (Real-time synchronization)
- **Authentication**: Firebase Auth (Google & Email Login)
- **Storage**: Cloudinary (High-performance image optimization)
- **Maps**: React-Leaflet for interactive geographic discovery

---

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shreyashmane-dev/MessMate.git
   cd MessMate
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file with the following keys:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_id
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

---

## 🛡️ Security
MessMate implements strict **Firestore Security Rules** ensuring that:
- User profiles are private and only accessible by the owner.
- Mess listings can only be edited/deleted by the verified owner.
- Private communications (requests) are restricted to the involved parties.

---

## 🎨 Design Philosophy
MessMate follows a **Premium Dark/Glassmorphic** aesthetic, utilizing:
- Subtle gradients and blur effects.
- Micro-animations for button interactions.
- High-fidelity 3D renders for a modern look.

---

<div align="center">
  <p>Made with ❤️ by <b>Shreyash Mane</b></p>
  <p><i>Transforming the way students eat.</i></p>
</div>
