# Database Setup & Usage

This directory contains the Prisma database configuration and helper functions for the Odysync server.

## Models

### UsageMeter
Tracks monthly usage metrics for users:
- `subjectId`: User or app identifier
- `monthKey`: Month in YYYY-MM format (e.g., "2025-01")
- `aiGenerations`: Number of AI generations
- `flightResolves`: Number of flight resolutions
- `airportQueries`: Number of airport queries
- Unique constraint on `(subjectId, monthKey)`

### Trial
Manages user trial periods:
- `subjectId`: User identifier
- `startedAt`: Trial start date
- `endsAt`: Trial end date
- Unique constraint on `subjectId`

### ProviderUsage
Tracks API usage costs:
- `provider`: Service provider (e.g., "openai", "amadeus")
- `endpoint`: API endpoint used
- `units`: Number of units consumed
- `costCents`: Cost in cents
- `subjectId`: Optional user attribution

### FlightSegment
Stores flight information:
- `tripId`: Reference to trip/timer
- `carrier`: Airline code
- `number`: Flight number
- `departIATA`/`arriveIATA`: Airport codes
- `departTime`/`arriveTime`: Flight times
- `status`: Flight status

### HotelStay
Stores hotel booking information:
- `tripId`: Reference to trip/timer
- `name`: Hotel name
- `address`, `city`, `country`: Optional location details
- `checkInDate`/`checkOutDate`: Stay dates

## Helper Functions

### `upsertUsageMeter(subjectId, monthKey, updates)`
Creates or updates usage metrics for a user in a specific month.

### `insertProviderUsage(data)`
Records API usage and costs for billing/tracking.

### `getCurrentMonthKey()`
Returns current month in YYYY-MM format.

### `isTrialActive(subjectId)`
Checks if a user's trial is currently active.

### `getUsageSummary(subjectId, monthKey)`
Gets usage summary for a user in a specific month.

## Usage Examples

```typescript
import { 
  upsertUsageMeter, 
  insertProviderUsage, 
  getCurrentMonthKey,
  isTrialActive 
} from './db';

// Track AI generation usage
await upsertUsageMeter('user123', '2025-01', {
  aiGenerations: 1
});

// Record OpenAI API usage
await insertProviderUsage({
  provider: 'openai',
  endpoint: 'chat/completions',
  units: 150,
  costCents: 2, // $0.02
  subjectId: 'user123'
});

// Check trial status
const hasActiveTrial = await isTrialActive('user123');

// Get current month key
const monthKey = getCurrentMonthKey(); // "2025-01"
```

## Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Create and apply migrations
npm run migrate:dev

# Deploy migrations to production
npm run migrate:deploy

# Open Prisma Studio (database browser)
npm run db:studio
```

## Environment Variables

Ensure `DATABASE_URL` is set in your `.env` file:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/odysync"
```

## Migration

When you make changes to the schema:

1. Update `prisma/schema.prisma`
2. Run `npm run migrate:dev` to create and apply migration
3. Run `npm run db:generate` to regenerate the client
4. Test your changes

## Notes

- All costs are stored in cents to avoid floating-point precision issues
- Month keys use YYYY-MM format for easy querying and sorting
- Unique constraints ensure data integrity
- Indexes are added for common query patterns
