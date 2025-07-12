# MedChain Project Structure

## Essential Files Only

### Core Application Files
- `client/` - React frontend application
- `server/` - Express.js backend application
- `shared/` - Shared TypeScript schemas and types
- `medchain.db` - SQLite database file

### Configuration Files
- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `drizzle.config.ts` - Drizzle ORM configuration
- `components.json` - shadcn/ui component configuration

### Documentation Files
- `README.md` - Project overview and setup instructions
- `replit.md` - Project architecture and user preferences
- `MEDICINE_DATABASE_SUMMARY.md` - Database reference for 55 medicines
- `LICENSE` - Project license file

### Development Files
- `node_modules/` - npm dependencies (auto-generated)
- `package-lock.json` - Dependency lock file
- `.env` - Environment variables
- `.gitignore` - Git ignore rules
- `.replit` - Replit configuration

## Removed Files (Cleanup)
- All duplicate setup guides and documentation
- Multiple database configuration files
- Temporary database scripts
- Attached assets folder with paste files
- Migration files folder
- Setup utility scripts

## Key Benefits of Cleanup
1. **Cleaner Repository**: Easier to navigate and understand
2. **Faster Development**: Less clutter and confusion
3. **Better Maintainability**: Only essential files remain
4. **Improved Performance**: Reduced file scanning overhead
5. **Clear Documentation**: Focused on essential project information

The project now contains only the files necessary for the MedChain healthcare supply chain platform to function properly.