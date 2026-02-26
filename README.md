# OmniForm
One profile, every form — role-based digital form management and autofill.

## 1) Project Title and One-Line Description
**OmniForm**: A role-based platform where admins build reusable forms, users autofill and submit quickly, and organizations review submissions.

## 2) Problem Statement
People repeatedly enter the same personal details across different forms, which is slow and error-prone. Organizations also lack a simple shared workflow to design forms and process submissions efficiently.

## 3) Solution Overview
OmniForm provides a centralized profile + dynamic form builder workflow. Admins create organizations, tags, and reusable components; users fill forms with autofill support; organizations review submissions in a structured dashboard.

## 4) Unique Selling Proposition
Unlike static form tools, OmniForm combines reusable admin components, profile-based autofill, and role-based review in one flow. It also supports rich field types (image/map/select/combobox/checkbox/radio) with cloud media handling.

## 5) Tech Stack
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB (Mongoose)
- Auth: Clerk
- Media Storage: ImageKit
- Hosting: Vercel (frontend), Render (backend)

## 6) Setup Instructions
### Backend
1. `cd src/omniform-backend`
2. `npm install`
3. Configure backend `.env`
4. `npm run dev`

### Frontend
1. `cd src/omniform-frontend`
2. `npm install`
3. Configure frontend `.env`
4. `npm run dev`

## 7) Environment Variables
### Backend (`src/omniform-backend`)
- `MONGO_URI`
- `CLERK_SECRET_KEY`
- `FRONTEND_URL`
- `CORS_ORIGINS`
- `IMAGEKIT_PUBLIC_KEY`
- `IMAGEKIT_PRIVATE_KEY`
- `IMAGEKIT_URL_ENDPOINT`
- `PORT`

### Frontend (`src/omniform-frontend`)
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_API_URL`

## 8) Deployment Link
- Frontend: https://clash-a-thon-e-xe-omni-form.vercel.app/
- Backend: https://clashathon-exe-omniform.onrender.com/

## 9) Team Members
- Neek Kafle — Full-stack development
- Sulav Giri, Milan Timalsena — Frontend/UI
- Prashan Mainali — Backend/API
- Sneya Agrawal — Documentation and Business Aspects
