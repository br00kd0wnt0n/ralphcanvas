# Ralph Canvas

Ralph Canvas is a 24-hour evolving visual engine for our agency homepage. It is designed for real-time collaboration, modular extensibility, and high performance from day one.

## Features
- Real-time collaborative canvas state management with Supabase
- Enhanced particle system with organic shapes and dynamic interactions
- Modular architecture for easy extension
- Next.js 14 App Router for modern API and routing
- Performance-focused from the start
- TypeScript for type safety and better developer experience

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Supabase account
- Git

### Setup
1. Clone the repository:
   ```sh
   git clone https://github.com/br00kd0wnt0n/ralphcanvas.git
   cd ralphcanvas
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env.local` file in the root directory with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NODE_ENV=development
   ```
4. Run the development server:
   ```sh
   npm run dev
   ```

## Project Structure
```
ralphcanvas/
├── src/
│   ├── app/                 # Next.js 14 App Router pages and API routes
│   │   ├── api/            # API endpoints
│   │   └── page.tsx        # Main page component
│   ├── components/         # React components
│   │   ├── canvas/        # Canvas-related components
│   │   │   ├── EnhancedParticleSystem.tsx
│   │   │   └── CanvasStateManager.tsx
│   │   └── ui/            # UI components
│   ├── core/              # Core logic and state management
│   ├── lib/               # Shared utilities
│   │   └── supabase.ts    # Supabase client configuration
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── public/                # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

## Key Components

### Enhanced Particle System
- Dynamic particle generation and management
- Organic shape rendering
- Real-time state synchronization
- Performance optimized for large particle counts

### Canvas State Management
- Real-time state synchronization with Supabase
- Efficient state updates and conflict resolution
- Type-safe state management
- Modular design for easy extension

### API Routes
- RESTful endpoints using Next.js 14 App Router
- Type-safe API responses
- Efficient data fetching and caching
- Secure authentication and authorization

## Development Guidelines
- Use clear, descriptive commit messages (see below for examples)
- Keep code modular and well-documented
- Prioritize performance and extensibility
- Follow TypeScript best practices
- Write tests for critical functionality

### Example Commit Messages
- `feat: migrate from TypeORM to Supabase for state management`
- `feat: implement enhanced particle system with organic shapes`
- `feat: add Next.js 14 App Router API endpoints`
- `refactor: improve canvas state management performance`
- `fix: resolve particle system rendering issues`

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
MIT 