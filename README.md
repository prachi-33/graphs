# Graph Shortest Path Visualizer

An interactive web application for visualizing shortest path algorithms (Dijkstra and Bellman-Ford) with step-by-step animation.

## Features

- **Interactive Graph Editor**: Add nodes and edges with weights
- **Dijkstra Algorithm**: Visualize Dijkstra's shortest path algorithm
- **Bellman-Ford Algorithm**: Visualize Bellman-Ford's algorithm with negative weight cycle detection
- **Step-by-Step Animation**: Watch each relaxation step in real-time
- **Manual & Auto Modes**: Control animation speed or step through manually
- **Distance Table**: See distance updates at each step
- **Adjacency List Display**: View the graph structure
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- **Frontend**: React 18 + React Router 6 (SPA)
- **Styling**: TailwindCSS 3 + Radix UI components
- **Build**: Vite
- **Testing**: Vitest
- **No Server**: 100% static website

## Development

```bash
# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test

# Type check
npm run typecheck
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Click "New Project" and select your repository
4. Vercel automatically detects Vite configuration
5. Click "Deploy"

### Manual Deployment

```bash
# Build the project
npm run build

# The 'dist' folder contains your static website
# Upload this to any static hosting:
# - Vercel
# - Netlify
# - GitHub Pages
# - AWS S3
# - Any web server
```

### Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

## How to Use

1. **Add Nodes**: Enter a node ID (e.g., "A") and click the + button
2. **Add Edges**: Enter source, destination, and weight (e.g., "A B 5") and click the + button
3. **Select Algorithm**: Choose between Dijkstra or Bellman-Ford
4. **Select Source Node**: Pick the starting node for the algorithm
5. **Click Start**: Watch the visualization play
6. **Manual Mode**: Step through each iteration with Previous/Next buttons
7. **Auto Mode**: Adjust speed with the slider

## File Structure

```
├── client/                 # React frontend
│   ├── pages/             # Page components
│   ├── components/        # UI components
│   ├── lib/               # Utilities and algorithms
│   ├── App.tsx            # Router setup
│   └── global.css         # Tailwind CSS config
├── shared/                # Shared types
├── public/                # Static assets
├── vite.config.ts         # Vite configuration
├── tailwind.config.ts     # Tailwind configuration
├── vercel.json            # Vercel deployment config
└── package.json           # Dependencies
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
