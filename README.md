# Qwick Bazaar

Qwick Bazaar is a multi-page local commerce website built with plain HTML and JavaScript. It includes customer-facing pages for shopping, serviceability, location coverage, partner onboarding, rider onboarding, property listings, support, legal information, and blog content.

Live site: https://rajk14.github.io/qwick-bazaar/

Repository: https://github.com/rajk14/qwick-bazaar

## Tech Stack

### Frontend

- HTML5
- CSS inside page files
- Vanilla JavaScript
- Static JSON data

### Backend

- No backend server is required for the current version.
- The site is deployed as a static frontend.
- Future backend integration can be added with APIs for authentication, cart checkout, orders, partner onboarding, location serviceability, and blog/admin management.

### Deployment

- GitHub Pages
- GitHub Actions workflow for Pages deployment
- `.nojekyll` enabled for direct static asset serving

## Features

- Homepage for Qwick Bazaar services
- Location and serviceability pages
- Shopping cart page
- Login page UI
- Partner onboarding page
- Rider onboarding page
- Property page
- Blog listing and blog post pages
- Support and legal pages
- Shared JavaScript utilities through `shared.js`
- Location data stored in `quickbazar/location-data.json`

## Project Structure

```text
.
├── .github/workflows/pages.yml
├── quickbazar/
│   └── location-data.json
├── about.html
├── bhagalpur.html
├── blog.html
├── blog-db.js
├── blog-post.html
├── cart.html
├── index.html
├── legal.html
├── location.html
├── login.html
├── partner.html
├── property.html
├── rider.html
├── serviceability.html
├── shared.js
├── support.html
├── .nojekyll
├── LICENSE
└── README.md
```

## Run Locally

Because this is a static website, it can be opened directly in a browser.

Open:

```text
index.html
```

Recommended local server:

```powershell
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## GitHub Pages Deployment

The site is deployed through GitHub Pages.

Deployment workflow:

```text
.github/workflows/pages.yml
```

The live URL is:

```text
https://rajk14.github.io/qwick-bazaar/
```

## Suggested Full-Stack Roadmap

The current project is frontend-only. To make it a complete full-stack application, the next backend pieces can be added:

- User authentication and session handling
- Product catalog API
- Cart and checkout API
- Order creation and tracking
- Partner registration backend
- Rider registration backend
- Location and serviceability API
- Admin dashboard for products, orders, riders, and partners
- Database for users, products, orders, locations, partners, and blog posts

Possible backend stack options:

- Node.js, Express, and MongoDB
- Node.js, Express, and PostgreSQL
- Next.js with API routes
- Firebase or Supabase for faster backend setup

## License

This project is licensed under the terms in the `LICENSE` file.
