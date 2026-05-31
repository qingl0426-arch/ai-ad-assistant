# AI Ad Assistant

AI-powered advertising analysis assistant built with Next.js 15.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS v4
- **UI**: shadcn/ui + Radix Primitives
- **Icons**: Lucide React
- **Theme**: next-themes (dark mode)
- **Lint**: ESLint + Prettier

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # Lint check
npm run format       # Format code
npm run format:check # Check formatting
```

## Project Structure

```
src/
├── app/               # App Router pages
│   ├── layout.tsx     # Root layout (ThemeProvider)
│   ├── page.tsx       # Home page
│   └── globals.css    # Tailwind + shadcn theme
├── components/
│   └── ui/            # shadcn/ui primitives
├── lib/
│   └── utils.ts       # cn() helper
├── hooks/
│   └── index.ts       # Shared hooks
└── types/
    └── index.ts       # TypeScript types
```

## Add shadcn Components

```bash
npx shadcn@latest add dialog
npx shadcn@latest add table
npx shadcn@latest add tabs
```

## Environment

Copy `.env.local.example` to `.env.local` and fill in values:

```bash
cp .env.local.example .env.local
```
