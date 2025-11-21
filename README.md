# Dev.ai - Multi-Model AI Chat Interface

A modern, responsive AI chat interface that supports multiple AI models with beautiful UI effects and smooth animations.

## ✨ Features

- 🤖 **Multi-Model Support** - Switch between different AI models seamlessly
- 💬 **Chat History** - Persistent chat history with localStorage
- 🎨 **Beautiful UI** - Modern design with click spark effects and smooth animations
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- 🔒 **Error Handling** - Robust error boundaries and error handling
- ⚡ **Fast Performance** - Optimized builds with code splitting

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd "Dev.ai_With Effects"
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🏗️ Building for Production

### Build Command

```bash
npm run build
```

This will create an optimized production build in the `dist` directory with:
- Minified JavaScript and CSS
- Removed console logs
- Code splitting for optimal loading
- Optimized assets

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally at `http://localhost:4173` for testing.

## 📦 Production Deployment

### Option 1: Static Hosting (Recommended)

The app is a static React application and can be deployed to:

#### Vercel
```bash
npm install -g vercel
vercel
```

#### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### GitHub Pages
1. Update `vite.config.js` to add `base: '/your-repo-name/'`
2. Build: `npm run build`
3. Deploy the `dist` folder to GitHub Pages

### Option 2: Traditional Web Server

1. Build the application:
```bash
npm run build
```

2. Serve the `dist` directory with any web server:
   - **Nginx**: Copy `dist` contents to `/var/www/html/`
   - **Apache**: Copy `dist` contents to your web root
   - **Node.js/Express**: Use `express.static('dist')`

### Option 3: Docker

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t dev-ai .
docker run -p 80:80 dev-ai
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory (optional):
```env
VITE_PUTER_API_KEY=your_api_key_here
VITE_API_BASE_URL=https://api.example.com
```

### API Configuration

The app uses Puter AI by default. Make sure the Puter script is loaded in `index.html`:
```html
<script src="https://js.puter.com/v2/"></script>
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically

## 🛠️ Tech Stack

- **React 19** - UI framework
- **Vite 7** - Build tool and dev server
- **Tailwind CSS 4** - Styling
- **Lucide React** - Icons
- **Puter AI** - AI backend

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🔒 Security Considerations

- All API keys should be stored in environment variables
- Never commit `.env` files to version control
- Use HTTPS in production
- Review and adjust Content Security Policy in `index.html` as needed

## 🐛 Troubleshooting

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

### Runtime Errors
- Check browser console for errors
- Verify Puter AI script is loading correctly
- Check network tab for API call failures

## 📄 License

© 2025 Sunnydev. All rights reserved.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Made with ❤️ by Sunnydev**
