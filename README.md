# Chatter

Chatter is a modern publishing platform built for writers and readers who value thoughtful, long-form content. Inspired by platforms like Medium and Hashnode, Chatter combines content creation, social engagement, personalized discovery, and creator analytics into a single experience.

## Live Demo

https://capstone-project-chatter-publishing.vercel.app
---

## Features

### Authentication

* Email & Password Authentication
* Protected Routes
* Persistent Login Sessions
* User Profiles

### Content Creation

* Rich Markdown Editor
* Draft Saving
* Publish Articles
* Cover Image Support
* Reading Time Estimation
* Tag System

### Content Discovery

* Explore Page
* Search Articles
* Trending Articles
* Trending Topics
* Personalized Following Feed
* Tag Filtering

### Social Features

* Like Articles
* Comment on Articles
* Bookmark Articles
* Follow Authors
* Notifications System

### Creator Dashboard

* Total Views
* Total Likes
* Total Comments
* Total Bookmarks
* Follower Statistics
* Analytics Dashboard

### Additional Pages

* About Page
* Privacy Policy
* Terms & Conditions
* Custom 404 Page

### Responsive Design

* Mobile Optimized
* Tablet Optimized
* Desktop Optimized
* Dark Mode Support

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* React Router

### Styling

* Tailwind CSS v4

### Backend

* Supabase

### Database

* PostgreSQL (Supabase)

### Authentication

* Supabase Auth

### Storage

* Supabase Storage

### Analytics & Charts

* Recharts

### Testing

* Vitest
* React Testing Library
* Playwright

---

## Project Structure

```bash
src/
├── components/
├── context/
├── layouts/
├── lib/
├── pages/
├── routes/
├── test/
├── tests/
├── utils/
└── App.tsx
```

---

## Installation


```bash
git clone https://github.com/DeeNero1811/CAPSTONE-PROJECT--Chatter-Publishing-Platform.git
```

Navigate into the project:

```bash
cd chatter
```

Install dependencies:

```bash
npm install
```

Create a .env file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the development server:

```bash
npm run dev
```

---

## Available Scripts

Run development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Run unit and component tests:

```bash
npm test
```

Run Playwright tests:

```bash
npx playwright test
```

---

## Testing

The project includes:

* Unit Tests
* Component Tests
* End-to-End Tests

Testing tools:

* Vitest
* React Testing Library
* Playwright

---

## Accessibility

Chatter follows accessibility best practices including:

* Semantic HTML
* Keyboard Navigation
* Skip Links
* Responsive Design
* Dark Mode Support

---

## Future Improvements

* Real-time comments
* AI-powered content recommendations
* Creator monetization
* Multi-language support
* Advanced analytics

---

## Author

Developed by Olalude Nurudeen Olamilekan

Capstone Project — AltSchool Africa Frontend Engineering Program

---

## License

This project is for educational and portfolio purposes.
