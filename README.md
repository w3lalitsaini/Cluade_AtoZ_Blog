# AtoZ Blogs — Professional News & Blogging Platform

A large-scale, production-ready news and blogging platform built with the latest modern tech stack. Inspired by professional media websites like BBC, designed for multi-author publishing with full monetization, AI writing tools, and advanced SEO.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | MongoDB + Mongoose |
| Auth | NextAuth v5 (JWT + OAuth) |
| Media | Cloudinary |
| Editor | TipTap Rich Text Editor |
| Animations | Framer Motion |
| Caching | Redis (ioredis) |
| Validation | Zod |
| AI | OpenAI API |
| Email | NodeMailer |

---

## 📁 Project Structure

```
atozblog/
├── app/
│   ├── (public)/          # Public-facing pages
│   │   ├── page.tsx       # Homepage
│   │   ├── article/[slug] # Article detail page
│   │   ├── category/[slug]# Category listing
│   │   └── author/[id]    # Author profile
│   ├── admin/             # Protected admin panel
│   │   ├── dashboard/     # Analytics overview
│   │   ├── posts/         # Post management + editor
│   │   ├── users/         # User management
│   │   ├── ads/           # Ad management
│   │   ├── analytics/     # Site analytics
│   │   ├── newsletter/    # Subscriber management
│   │   ├── media/         # Media library (Cloudinary)
│   │   ├── ai-assistant/  # AI writing tools
│   │   └── settings/      # Site configuration
│   ├── api/               # REST API routes
│   │   ├── posts/         # Post CRUD
│   │   ├── auth/          # Authentication
│   │   ├── ai/generate/   # AI content generation
│   │   ├── newsletter/    # Newsletter subscription
│   │   ├── upload/        # Cloudinary upload
│   │   ├── search/        # Full-text search
│   │   └── sitemap/       # XML sitemap
│   └── auth/              # Login/Register pages
├── components/
│   ├── layout/            # Header, Footer, BreakingNews
│   ├── article/           # ArticleCard (5 variants)
│   ├── admin/             # AdminSidebar, AdminHeader, PostEditor
│   ├── ads/               # AdUnit, StickyBottomAd
│   └── ui/                # ThemeToggle, Pagination, Spinner
├── models/                # Mongoose schemas
│   ├── Post.ts
│   ├── User.ts
│   ├── Category.ts
│   ├── Tag.ts
│   ├── Comment.ts
│   ├── Subscriber.ts
│   ├── Ad.ts
│   ├── Analytics.ts
│   └── SiteSettings.ts
├── lib/
│   ├── auth.ts            # NextAuth config
│   ├── mongodb.ts         # DB connection
│   ├── seo.ts             # SEO utilities + schema generation
│   ├── utils.ts           # Helpers
│   ├── openai.ts          # OpenAI client
│   ├── cloudinary.ts      # Cloudinary config
│   ├── redis.ts           # Redis caching
│   └── email.ts           # Email service
└── .env.example           # Environment variables template
```

---

## ⚙️ Setup & Installation

### 1. Clone & Install

```bash
git clone <repo-url>
cd atozblog
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`:

```env
# Required
MONGODB_URI=mongodb://localhost:27017/atozblog
NEXTAUTH_SECRET=generate-a-strong-secret-here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional but recommended
OPENAI_API_KEY=sk-...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
REDIS_URL=redis://localhost:6379

# AdSense
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-...
```

### 3. Run Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

### 4. Access Admin Panel

Visit: `http://localhost:3000/admin`

The first user to register can be manually promoted to `admin` in MongoDB:
```js
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

---

## 🎨 Features

### Public Site
- ✅ Professional news homepage with hero, featured grid, trending sidebar
- ✅ Breaking news scrolling ticker
- ✅ Article detail with full rich text, author box, related articles
- ✅ Category pages with article grid
- ✅ Author profile pages
- ✅ Full-text search
- ✅ Dark mode / Light mode toggle
- ✅ Newsletter signup
- ✅ Social sharing
- ✅ Responsive design (mobile-first)

### Admin Panel
- ✅ Dashboard with stats (posts, users, views, comments, subscribers)
- ✅ Rich text post editor (TipTap) with image upload
- ✅ Post SEO panel (meta title, description, focus keyword, SEO score)
- ✅ User management with roles (admin/editor/author/user)
- ✅ Ad management (header, sidebar, in-article, footer, sticky)
- ✅ Newsletter subscriber management with export
- ✅ Media library with Cloudinary integration
- ✅ Site settings (name, logo, SEO defaults, social links, ad codes)
- ✅ Analytics overview with top posts and category stats
- ✅ AI Writing Assistant (titles, outlines, full articles, SEO, tags)

### SEO
- ✅ Dynamic meta tags + OpenGraph + Twitter Cards
- ✅ JSON-LD structured data (Article, WebSite, BreadcrumbList)
- ✅ Auto sitemap generation
- ✅ Canonical URLs
- ✅ SEO score indicator in editor
- ✅ Keyword density analysis
- ✅ Auto slug generation
- ✅ Readability analysis

### Monetization
- ✅ Google AdSense Auto Ads support
- ✅ Manual ad placement system (6 positions)
- ✅ Custom HTML ad codes
- ✅ Ad scheduling (start/end dates)
- ✅ Impression + click tracking
- ✅ Affiliate and sponsored post support

### Authentication
- ✅ Email/password with bcrypt hashing
- ✅ Google OAuth
- ✅ GitHub OAuth
- ✅ JWT sessions
- ✅ Role-based access control
- ✅ Admin-protected routes

### AI Writing Assistant
- ✅ Generate blog titles (10 variations)
- ✅ Create article outlines
- ✅ Write full articles
- ✅ Rewrite/improve content
- ✅ SEO optimization suggestions
- ✅ Generate tags
- ✅ Write excerpts/meta descriptions

---

## 🔐 User Roles

| Role | Permissions |
|------|------------|
| **Admin** | Full access — posts, users, ads, settings, analytics |
| **Editor** | Approve posts, manage comments, categories, tags |
| **Author** | Create/edit own posts, access media library |
| **User** | Comment, like, bookmark, follow authors |

---

## 📊 Database Models

### Post
Fields: title, slug, excerpt, content, featuredImage, author, category, tags, status, publishedAt, isBreaking, isFeatured, isEditorsPick, viewCount, likeCount, readingTime, seo (metaTitle, metaDescription, focusKeyword, score), allowComments, sponsored

### User
Fields: name, email, password (hashed), image, bio, role, isVerified, savedPosts, following, followers, socialLinks, twoFactorEnabled

### Category
Fields: name, slug, description, image, color, parentCategory, isActive, postCount, metaTitle

### Ad
Fields: name, type (adsense/banner/affiliate/sponsored), position (6 positions), code, isActive, startDate, endDate, targeting (categories/tags/devices), impressions, clicks

### SiteSettings
Fields: siteName, siteUrl, logo, favicon, themeColor, googleAnalyticsId, adsenseClientId, socialLinks, emailSettings, headerScripts, footerScripts, maintenanceMode

---

## 🌐 API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | List posts with filters & pagination |
| POST | `/api/posts` | Create new post (auth required) |
| POST | `/api/ai/generate` | AI content generation |
| POST | `/api/newsletter` | Subscribe to newsletter |
| POST | `/api/upload` | Upload to Cloudinary |
| GET | `/api/search` | Full-text search |
| GET | `/api/sitemap` | XML sitemap |
| POST | `/api/auth/register` | Create account |

---

## 🚢 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Docker
```bash
docker build -t atozblog .
docker run -p 3000:3000 --env-file .env atozblog
```

---

## 📝 License

MIT License - AtoZ Blogs © 2025
