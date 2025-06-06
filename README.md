# Ralph Canvas

Ralph Canvas is a 24-hour evolving visual engine for our agency homepage. It is designed for real-time collaboration, modular extensibility, and high performance from day one.

## Features
- Real-time collaborative canvas state management
- Modular architecture for easy extension
- Database integration (PostgreSQL + TypeORM)
- Performance-focused from the start

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL

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
3. Create a `.env` file in the root directory with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=postgres
   DB_NAME=ralph_canvas
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
│   ├── core/                # Core logic (CanvasStateManager, etc.)
│   ├── database/            # Database integration (TypeORM, entities)
│   ├── types/               # TypeScript types
│   └── ...                  # (visual engine, API, admin, etc. to come)
├── package.json
├── tsconfig.json
└── README.md
```

## Development Guidelines
- Use clear, descriptive commit messages (see below for examples)
- Keep code modular and well-documented
- Prioritize performance and extensibility

### Example Commit Messages
- `feat: initial project setup with canvas state management`
- `feat: three.js visual engine with organic shapes`
- `feat: API routes and admin interface`
- `feat: AI theme processing integration`

---

## License
MIT 