# 🎮 GameVault API

A production-ready REST API for managing video game collections, built with modern backend technologies.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=flat&logo=fastify&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=flat&logo=jest&logoColor=white)

## 🌟 Features

### Core Functionality
- 🔐 **JWT Authentication** - Secure user registration and login
- 📦 **Collection Management** - Add, update, remove games with status tracking (Backlog, Playing, Completed, Dropped)
- ⭐ **Review System** - Rate and review games (1-10 scale)
- 📊 **Statistics** - Personal and global analytics with top genres, playtime tracking
- 🎮 **RAWG API Integration** - Search and fetch data from 500,000+ games

### Performance & Scalability
- ⚡ **Redis Caching** - Multi-level caching for optimal performance
- 🚦 **Rate Limiting** - 100 requests per 15 minutes protection
- 🔄 **Background Jobs** - Async task processing with Bull queues
- 📄 **Pagination** - Efficient data loading for large datasets

### Developer Experience
- 🧪 **Automated Tests** - Integration tests with Jest & Supertest (9 passing tests)
- 📝 **Structured Logging** - Winston logger with file rotation
- 🏥 **Health Checks** - Monitor database, cache, and external APIs
- 📋 **OpenAPI Spec** - Auto-generated API documentation
- 🐳 **Docker Support** - Development and production environments

## 🚀 Tech Stack

| Category | Technology |
|----------|-----------|
| Runtime | Node.js 20+ |
| Language | TypeScript |
| Framework | Fastify |
| Database | PostgreSQL 15 |
| ORM | Prisma |
| Cache | Redis 7 |
| Jobs | Bull |
| Auth | JWT + bcrypt |
| Validation | Zod |
| Testing | Jest + Supertest |
| Logging | Winston |
| Container | Docker |

## 📦 Installation

### Prerequisites
- Node.js 20+
- Docker Desktop
- RAWG API Key (free at https://rawg.io/apidocs)

### Quick Start
```bash
# Clone the repository
git clone <your-repo-url>
cd gamevault/apps/api

# Install dependencies
npm install

# Start Docker services (PostgreSQL + Redis)
docker-compose up -d

# Configure environment variables
cp .env.example .env
# Edit .env with your RAWG_API_KEY

# Push database schema
npm run db:push

# Generate Prisma client
npm run db:generate

# Start development server
npm run dev
```

The API will be available at `http://localhost:3001`

## 🔧 Environment Variables
```env
# Database
DATABASE_URL="postgresql://gamevault:dev123@localhost:5432/gamevault"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Server
PORT=3001
NODE_ENV="development"

# RAWG API
RAWG_API_KEY="your-rawg-api-key"

# Frontend (optional)
FRONTEND_URL="http://localhost:3000"
```

## 📚 API Documentation

### Base URL
```
http://localhost:3001
```

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "gamer123",
  "password": "securepassword"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Game Endpoints

#### Search Games
```http
GET /api/games/search?q=zelda&page=1
```

#### Get Game Details
```http
GET /api/games/:id
```

### Collection Endpoints

#### Get User Collection
```http
GET /api/collection?status=PLAYING&limit=20&offset=0
Authorization: Bearer <token>
```

#### Add Game to Collection
```http
POST /api/collection
Authorization: Bearer <token>
Content-Type: application/json

{
  "rawgId": 3328,
  "status": "PLAYING",
  "playtime": 15
}
```

#### Update Game in Collection
```http
PATCH /api/collection/:gameId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "COMPLETED",
  "playtime": 50
}
```

#### Remove Game from Collection
```http
DELETE /api/collection/:gameId
Authorization: Bearer <token>
```

### Review Endpoints

#### Create Review
```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "gameId": "uuid-here",
  "rating": 9,
  "content": "Amazing game!"
}
```

#### Get Reviews for a Game
```http
GET /api/reviews/game/:gameId?limit=20&offset=0
```

#### Get User's Reviews
```http
GET /api/reviews/me
Authorization: Bearer <token>
```

### Stats Endpoints

#### Get User Stats
```http
GET /api/stats/me
Authorization: Bearer <token>
```

#### Get Global Stats
```http
GET /api/stats/global
```

### Health Check
```http
GET /health
GET /health/detailed
```

## 🧪 Testing
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage
- **Overall Coverage**: 22%
- **Auth Routes**: 67%
- **Collection Routes**: 49%
- **9 passing integration tests**

## 📊 Project Structure
```
apps/api/
├── src/
│   ├── __tests__/           # Integration tests
│   │   └── integration/
│   ├── config/              # Configuration files
│   │   ├── env.ts          # Environment variables
│   │   ├── logger.ts       # Winston logger
│   │   ├── prisma.ts       # Prisma client
│   │   ├── queue.ts        # Bull queues
│   │   └── redis.ts        # Redis client
│   ├── middlewares/         # Custom middlewares
│   │   ├── auth.middleware.ts
│   │   └── rateLimit.middleware.ts
│   ├── routes/              # API routes
│   │   ├── auth.routes.ts
│   │   ├── collection.routes.ts
│   │   ├── games.routes.ts
│   │   ├── health.routes.ts
│   │   ├── reviews.routes.ts
│   │   └── stats.routes.ts
│   ├── types/               # TypeScript definitions
│   └── server.ts            # Entry point
├── prisma/
│   └── schema.prisma        # Database schema
├── logs/                    # Log files
├── .env                     # Environment variables
├── docker-compose.yml       # Docker services
├── Dockerfile               # Production image
├── jest.config.js           # Jest configuration
├── tsconfig.json            # TypeScript config
└── package.json
```

## 🐳 Docker

### Development
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f
```

### Production
```bash
# Build production image
docker build -t gamevault-api .

# Run production container
docker run -p 3001:3001 --env-file .env gamevault-api
```

## 🚀 Deployment

### Railway

1. Install Railway CLI
```bash
npm install -g @railway/cli
```

2. Login and initialize
```bash
railway login
railway init
```

3. Add PostgreSQL and Redis
```bash
railway add --plugin postgresql
railway add --plugin redis
```

4. Set environment variables
```bash
railway variables set JWT_SECRET="your-secret"
railway variables set RAWG_API_KEY="your-key"
```

5. Deploy
```bash
railway up
```

### Render

1. Create new Web Service
2. Connect your GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add PostgreSQL and Redis add-ons
6. Configure environment variables

## 🔒 Security Features

- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Rate limiting per IP
- ✅ Input validation with Zod
- ✅ SQL injection protection (Prisma ORM)
- ✅ CORS configuration
- ✅ Environment variables for secrets

## 📈 Performance Optimizations

- Redis caching for expensive queries
- Database query optimization with Prisma
- Pagination for large datasets
- Connection pooling
- Async job processing
- Compressed responses

## 🐛 Known Issues & Limitations

- Swagger UI temporarily disabled due to version conflicts
- Rate limiting is IP-based (can be bypassed with proxies)
- No image upload to cloud storage yet (local only)

## 🗺️ Roadmap

- [ ] Add image upload to Cloudinary
- [ ] Implement email notifications
- [ ] Add social features (friends, activity feed)
- [ ] Create admin dashboard
- [ ] Add more comprehensive tests (E2E)
- [ ] Implement GraphQL endpoint
- [ ] Add WebSocket support for real-time updates

## 📝 License

MIT

## 👤 Author

**Your Name**
- Portfolio: [your-portfolio.com]
- GitHub: [@yourusername]
- LinkedIn: [Your LinkedIn]

## 🙏 Acknowledgments

- [RAWG API](https://rawg.io) for game data
- [Fastify](https://fastify.io) for the amazing framework
- [Prisma](https://prisma.io) for the excellent ORM

---

Made with ❤️ and ☕