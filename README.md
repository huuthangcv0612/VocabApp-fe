# VocabApp Frontend

A modern React application built with Vite and TypeScript for mastering vocabulary.

## 📦 Project Structure

```
VocabApp-fe/
├── src/
│   ├── assets/          # Images, fonts, icons
│   ├── components/      # Reusable components (Button, Card, etc.)
│   ├── pages/           # Page components (Home, Login, Dashboard, etc.)
│   ├── layouts/         # Layout components (AdminLayout, AuthLayout, etc.)
│   ├── services/        # API calls (axios, fetch, etc.)
│   ├── store/           # Redux / State management
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Shared utility functions
│   ├── constants/       # Constant variables
│   ├── routes/          # Router configuration
│   ├── styles/          # Global CSS/SCSS
│   ├── App.tsx          # Main App component
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── .env                 # Environment variables
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Yarn package manager

### Installation

1. Install dependencies:
```bash
yarn install
```

### Development

Start the development server:
```bash
yarn dev
```

The application will open at `http://localhost:3000`

### Build

Build for production:
```bash
yarn build
```

### Preview

Preview the production build locally:
```bash
yarn preview
```

### Linting

Run ESLint:
```bash
yarn lint
```

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: CSS
- **Code Quality**: ESLint

## 📝 Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=VocabApp
```

## 🎯 Features

- Fast development with Vite
- Type-safe development with TypeScript
- Hot Module Replacement (HMR)
- Path aliases for clean imports
- Modular component architecture

## 📚 Path Aliases

Use convenient path aliases in imports:

```typescript
import Button from '@components/Button'
import { useAuth } from '@hooks/useAuth'
import { API_BASE_URL } from '@constants/api'
```

## 📄 License

MIT
