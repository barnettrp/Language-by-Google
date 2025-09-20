# Development Setup Guide

## Quick setup that'll make your life easier

### Must-have VS Code extensions

Install these once and you're cruising:

- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
- **HTML CSS Support** (`ecmel.vscode-html-css`)
- **ESLint** (`dbaeumer.vscode-eslint`)
- **Prettier – Code formatter** (`esbenp.prettier-vscode`)
- **VS Code Live Server** (`ritwickdey.liveserver`) or use Vite dev server
- **Firebase Explorer** (`jsayol.firebase-explorer`) — optional, convenient
- **Vercel** (`vercel.vercel-vscode`) — optional, deploy/inspect without leaving the editor

> **Note**: The project includes a `.vscode/extensions.json` file that will automatically suggest these extensions when you open the workspace.

### Workspace Settings

The project includes preconfigured workspace settings (`.vscode/settings.json`) with:

- Format on save enabled
- Prettier as default formatter
- Consistent line endings (LF)
- ESLint validation for JavaScript and HTML
- Tailwind CSS IntelliSense enhancements

### Development Options

#### Option 1: Vite Development Server (Recommended)

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

#### Option 2: Live Server (Alternative)

1. Open your project folder in VS Code
2. Right-click `public/index.html` → "Open with Live Server"
3. This serves over HTTP and fixes module import issues

### VS Code Tasks

The project includes predefined tasks (`.vscode/tasks.json`):

- **Start Development Server** (`Ctrl+Shift+P` → "Tasks: Run Task" → "Start Development Server")
- **Build for Production**
- **Preview Production Build**

You can also use `Ctrl+Shift+B` to run the default build task (Start Development Server).

### Code Quality Tools

#### ESLint Configuration

- Modern ESLint flat config format (`eslint.config.js`)
- Configured for modern JavaScript (ES2021+) with module support
- Browser globals included (window, document, fetch, etc.)
- Firebase globals added

Run linting:
```bash
npm run lint        # Check for issues
npm run lint:fix    # Auto-fix issues where possible
```

#### Prettier Configuration

- Consistent code formatting (`.prettierrc`)
- Single quotes, semicolons, 2-space indentation
- Line width of 100 characters

Run formatting:
```bash
npm run format      # Format all files in public/
```

### Environment Setup

1. Copy environment variables template:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase and Gemini API credentials in the `.env` file

3. The development server will automatically load these variables

### Build and Deploy

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to Vercel (if Vercel CLI is installed)
vercel
```

### Troubleshooting

- **ESLint errors**: Most can be auto-fixed with `npm run lint:fix`
- **Formatting issues**: Run `npm run format` to auto-format code
- **Module import errors**: Use the Vite dev server instead of Live Server
- **Environment variables**: Check that `.env` file exists and contains required variables

### Nice-to-have Additions

- **Vercel CLI**: `npm i -g vercel` for terminal deployment
- **Dev Containers**: Future enhancement for consistent development environments
- **Additional ESLint rules**: Can be customized in `eslint.config.js`