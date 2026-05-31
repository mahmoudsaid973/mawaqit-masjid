# Deployment
This guide will help you deploy the Mawaqit Masjid project to a production environment.
## Prerequisites
* Node.js 16 or higher
* PostgreSQL 13 or higher
* npm 8 or higher
## Deployment Steps
1. Build the application: `npm run build`
2. Create a PostgreSQL database and update the `database` section in `src/db/schema.ts`
3. Deploy the application to a cloud platform (e.g. Vercel, Netlify)
4. Configure environment variables and authentication settings
## Troubleshooting
* If you encounter any issues during deployment, please refer to the [Troubleshooting Guide](docs/TROUBLESHOOTING.md).
