# Qwick Bazaar

Qwick Bazaar is a local quick-commerce and service platform built for customers, partners, riders, and property owners. The app is designed to help users discover local services, check availability in their area, explore service locations, and connect with the Qwick Bazaar ecosystem.

Live app: https://rajk14.github.io/qwick-bazaar/

## About The App

Qwick Bazaar brings multiple local services into one simple experience. Customers can browse the platform, check whether services are available in their location, view city-specific service information, explore cart and account pages, and get help through support pages.

The app also includes dedicated sections for business partners, delivery riders, and property owners who want to join or work with Qwick Bazaar.

## What Users Can Do

- Explore Qwick Bazaar services from the homepage
- Check service availability by location
- View city-specific service information
- Browse cart and login pages
- Read blogs and updates
- Contact support
- Review legal and policy information
- Apply as a partner
- Apply as a rider
- Explore property-related opportunities

## Main Sections

### Customers

Customers can explore Qwick Bazaar, check whether the service is available in their area, access cart and login pages, and find support when needed.

### Partners

The partner section is made for local businesses and service providers who want to join Qwick Bazaar and reach more customers.

### Riders

The rider section is designed for people who want to work with Qwick Bazaar for delivery and local service operations.

### Property Owners

The property section helps property owners explore opportunities connected with Qwick Bazaar locations and operations.

### Blog And Support

The app includes blog pages for updates and information, along with support pages to help users understand and use the platform.

## Live Website

The app is live here:

```text
https://rajk14.github.io/qwick-bazaar/
```

## Full-Stack Setup

```powershell
npm install
copy .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

Open:

```text
http://localhost:3000
```

Admin catalog:

```text
http://localhost:3000/admin/catalog
```

## License

This project is licensed under the terms in the `LICENSE` file.
