# Reverie - Blogging Platform

## Introduction

Reverie is a multi-user, full-stack blogging platform built with Next.js and Supabase. A modern blogging solution that enables users to create, publish, and manage beautiful blog posts with ease.

## 💻 Frontend

Built with Next.js App Router, featuring a modern and responsive design that works seamlessly across all devices.

## 🧰 Backend

Powered by Supabase for authentication, database, and storage, providing a robust and scalable backend infrastructure.

## 💾 Database Schema

The application uses Supabase PostgreSQL database with Row Level Security (RLS) policies for secure data access.

## 📚 Tech Stacks

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: HeadlessUI, Radix-UI, Shadcn-UI
- **Backend**: Supabase (Auth, Database, Storage)
- **Editor**: TipTap (WYSIWYG)
- **Forms**: React Hook Form with Zod validation
- **Icons**: HeroIcons & Lucide Icons
- **Analytics**: Vercel Analytics

## ⌨️ Code Quality

- [TypeScript](https://www.typescriptlang.org/)
- [Prettier](https://prettier.io/)
- [ESLint](https://eslint.org/)

## 📈 Miscellaneous

- [Vercel Analytics](https://vercel.com/analytics)

# ⚙️ Getting Started

## Requirements

To run this app locally you need

- [Node.js (Version: >=18.x)](https://nodejs.org/en/download/)
- Node Package Manager NPM - included in Node.js
- [Supabase Account](https://supabase.com/) (for database and authentication)

## Developer Quickstart

Want to get up and running quickly? Follow these steps:

- Clone the repository to your local device.

  ```sh
  git clone <your-repo-url>
  ```

- Set up your [Supabase Project](https://supabase.com/docs/guides/database)
- Set up your `.env` file using the recommendations in the `.env.example` file.
- Run `npm install` in the root directory
  ```sh
  npm install
  ```
- Run `npm run dev` in the root directory
  ```sh
  npm run dev
  ```

That's it! You should now be able to access the app at http://localhost:3000

Admin dashboard will also be available on http://localhost:3000/editor/posts

## License

Licensed under the [MIT license](https://github.com/shadcn/taxonomy/blob/main/LICENSE.md).
