# Airports API

The airports API provides endpoints for airport schedule lookup and flight search using AeroDataBox via RapidAPI.

## Endpoints

### GET /api/airports/:iata/schedule

Get airport schedule with arrivals and departures for a specific time window.

**Path Parameters:**
- `iata`: 3-letter airport IATA code (e.g., "LHR", "JFK")

**Query Parameters:**
- `offsetMinutes`: Minutes offset from current time (default: -120, negative = past, positive = future)
- `durationMinutes`: Duration of time window in minutes (default: 720 for paid users, 240 for free users)
- `direction`: "Arrival", "Departure", or "Both" (default: "Both")

**Entitlement-Based Gating:**
- **Free Users**: Maximum 240 minutes (4 hours) time window
- **Paid Users**: Maximum 720 minutes (12 hours) time window

**Response:**
```json
{
  "iata": "LHR",
  "arrivals": [
    {
      "carrier": "BA",
      "number": "123",
      "depart": {
        "iata": "JFK",
        "timeScheduled": "2025-01-03T14:30:00Z",
        "terminal": "5",
        "gate": "A12"
      },
      "arrive": {
        "iata": "LHR",
        "timeScheduled": "2025-01-04T02:45:00Z",
        "terminal": "3",
        "gate": "B15"
      },
      "status": "On Time",
      "raw": { /* raw AeroDataBox response */ }
    }
  ],
  "departures": [
    {
      "carrier": "EY",
      "number": "011",
      "depart": {
        "iata": "LHR",
        "timeScheduled": "2025-01-03T18:30:00Z",
        "terminal": "3",
        "gate": "A12"
      },
      "arrive": {
        "iata": "AUH",
        "timeScheduled": "2025-01-04T06:45:00Z",
        "terminal": "1",
        "gate": "B15"
      },
      "status": "On Time",
      "raw": { /* raw AeroDataBox response */ }
    }
  ],
  "entitlements": {
    "isPaid": false,
    "maxDuration": 240,
    "actualDuration": 240
  },
  "usage": {
    "subjectId": "user123",
    "monthKey": "2025-01",
    "airportQueries": 1
  }
}
```

**Features:**
- Real-time airport schedule data via AeroDataBox
- Entitlement-based time window gating
- Normalized flight data with carrier, number, terminals, gates
- Usage tracking and provider cost monitoring
- Automatic time window adjustment based on user entitlements

### GET /api/airports/search

Search for flights between two airports on a specific date.

**Query Parameters:**
- `origin`: Origin airport IATA code (required)
- `destination`: Destination airport IATA code (required)
- `date`: Flight date in YYYY-MM-DD format (optional, defaults to today)
- `limit`: Maximum number of results (optional, defaults to 10, max 25)

**Response:**
```json
{
  "origin": "LHR",
  "destination": "JFK",
  "date": "2025-01-03",
  "flights": [
    {
      "carrier": "BA",
      "number": "123",
      "depart": { /* departure details */ },
      "arrive": { /* arrival details */ },
      "status": "On Time"
    }
  ],
  "count": 1,
  "source": "aviationstack",
  "aviationStackAvailable": true,
  "cached": true
}
```

**Features:**
- Multi-provider flight search (AviationStack + AeroDataBox fallback)
- Smart provider selection based on availability
- Result caching and usage optimization
- Fallback to AeroDataBox when AviationStack unavailable

---

# Flights API

The flights API provides endpoints for resolving flight information and checking flight status using AeroDataBox via RapidAPI.

## Endpoints

### POST /api/flights/resolve

Resolve flight information by flight number and date.

**Request Body:**
```json
{
  "airlineIATA": "EY",
  "flightNumber": "011",
  "departDateLocal": "2025-12-27T18:30:00Z",
  "tripId": "optional-trip-id"
}
```

**Response:**
```json
{
  "success": true,
  "flight": {
    "carrier": "EY",
    "number": "011",
    "depart": {
      "iata": "LHR",
      "timeScheduled": "2025-12-27T18:30:00Z",
      "terminal": "3",
      "gate": "A12"
    },
    "arrive": {
      "iata": "AUH",
      "timeScheduled": "2025-12-28T06:45:00Z",
      "terminal": "1",
      "gate": "B15"
    },
    "status": "On Time",
    "raw": { /* raw AeroDataBox response */ }
  },
  "tripId": "optional-trip-id",
  "usage": {
    "subjectId": "user123",
    "monthKey": "2025-01",
    "flightResolves": 1
  }
}
```

**Features:**
- Validates airline IATA code (2-3 uppercase letters)
- Validates flight number (digits only)
- Parses and validates date format
- If `tripId` provided, upserts `FlightSegment` in database
- Updates usage metrics (`UsageMeter.flightResolves`)
- Records provider usage (`ProviderUsage`)

### GET /api/flights/status

Get current flight status by carrier, number, and date.

**Query Parameters:**
- `carrier`: Airline IATA code (e.g., "EY")
- `number`: Flight number (e.g., "011")
- `date`: Flight date (e.g., "2025-12-27")

**Response:**
```json
{
  "success": true,
  "flight": {
    "carrier": "EY",
    "number": "011",
    "depart": { /* departure details */ },
    "arrive": { /* arrival details */ },
    "status": "On Time",
    "raw": { /* raw AeroDataBox response */ }
  },
  "usage": {
    "subjectId": "user123",
    "monthKey": "2025-01",
    "provider": "aerodatabox"
  }
}
```

**Features:**
- Records provider usage for billing/tracking
- Returns normalized flight data
- Handles date parsing and validation

### GET /api/flights/trip/:tripId

Get all resolved flights for a specific trip.

**Response:**
```json
{
  "success": true,
  "tripId": "trip123",
  "flights": [
    {
      "id": "flight1",
      "tripId": "trip123",
      "carrier": "EY",
      "number": "011",
      "departIATA": "LHR",
      "arriveIATA": "AUH",
      "departTime": "2025-12-27T18:30:00Z",
      "arriveTime": "2025-12-28T06:45:00Z",
      "status": "On Time"
    }
  ],
  "count": 1
}
```

## Entitlements & Usage Limits

### Free Users
- Limited to one resolved flight per trip
- Must provide `tripId` for flight resolution
- Usage is tracked and limited

### Paid Users
- Unlimited flight resolutions
- No `tripId` requirement
- Full access to all features

## Environment Variables

Required environment variables for AeroDataBox integration:

```bash
AERODATABOX_RAPIDAPI_HOST=aerodatabox.p.rapidapi.com
AERODATABOX_RAPIDAPI_KEY=your-rapidapi-key-here
```

## Usage Tracking

All API calls automatically track:

1. **UsageMeter**: Monthly usage metrics per user
2. **ProviderUsage**: API provider costs and usage
3. **FlightSegment**: Stored flight information when `tripId` provided

## Error Handling

- **400**: Missing or invalid parameters
- **404**: Flight not found
- **500**: Internal server error

## Rate Limiting

- AeroDataBox API calls are tracked per user
- Free users have stricter limits
- All usage is logged for billing and analytics

---

# Ingest API

The ingest API provides endpoints for processing text or file uploads to extract structured flight and hotel information using AI.

## Endpoints

### POST /api/ingest/itinerary

Process text or file upload to extract structured flight and hotel information.

**Request Body (Text Mode):**
```json
{
  "source": "text",
  "text": "Your flight itinerary text here..."
}
```

**Request Body (File Mode):**
```
Content-Type: multipart/form-data
- source: "file"
- file: [binary file upload]
```

**Supported File Types:**
- `text/plain` - Plain text files
- `text/html` - HTML files
- `application/pdf` - PDF files (OCR support coming soon)
- `image/jpeg`, `image/jpg`, `image/png` - Images (OCR support coming soon)
- `application/msword` - Word documents
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` - Word documents

**Response:**
```json
{
  "success": true,
  "source": "text",
  "flights": [
    {
      "airlineIATA": "EY",
      "flightNumber": "011",
      "departIATA": "LHR",
      "arriveIATA": "AUH",
      "departDateLocal": "2025-12-27",
      "departTimeLocal": "18:30",
      "arriveDateLocal": "2025-12-28",
      "arriveTimeLocal": "06:45",
      "bookingRef": "ABC123",
      "passengerNames": ["John Doe", "Jane Doe"]
    }
  ],
  "hotels": [
    {
      "name": "Grand Hotel Abu Dhabi",
      "address": "123 Corniche Road",
      "city": "Abu Dhabi",
      "country": "UAE",
      "checkInDate": "2025-12-28",
      "checkOutDate": "2025-01-04",
      "bookingRef": "HOTEL456"
    }
  ],
  "aiProvider": "openai",
  "aiModel": "gpt-3.5-turbo",
  "usage": {
    "subjectId": "user123",
    "monthKey": "2025-01",
    "aiGenerations": 1,
    "totalTokens": 150,
    "costEstimate": 0.0003
  }
}
```

**Features:**
- Accepts text input or file uploads
- Uses AI to extract structured flight and hotel data
- Validates extracted data against schemas
- Updates usage metrics (`UsageMeter.aiGenerations`)
- Records AI provider usage (`ProviderUsage`)
- File size limit: 10MB
- Currently supports text files (PDF/OCR support coming soon)

## Data Schemas

### Flight Schema
```json
{
  "airlineIATA": "2-letter airline code",
  "flightNumber": "flight number",
  "departIATA": "3-letter departure airport",
  "arriveIATA": "3-letter arrival airport",
  "departDateLocal": "YYYY-MM-DD",
  "departTimeLocal": "HH:MM (24-hour)",
  "arriveDateLocal": "YYYY-MM-DD",
  "arriveTimeLocal": "HH:MM (24-hour)",
  "bookingRef": "optional booking reference",
  "passengerNames": ["optional passenger names"]
}
```

### Hotel Schema
```json
{
  "name": "hotel name",
  "address": "optional full address",
  "city": "city name",
  "country": "country name",
  "checkInDate": "YYYY-MM-DD",
  "checkOutDate": "YYYY-MM-DD",
  "bookingRef": "optional booking reference"
}
```

## Error Handling

- **400**: Invalid request format or missing parameters
- **422**: File processing errors, unsupported file types, AI parsing failures
- **500**: Internal server errors

### Common 422 Errors
```json
{
  "error": "File type not yet supported",
  "message": "Currently only text files are supported. PDF and image OCR support coming soon.",
  "supportedTypes": ["text/plain", "text/html"],
  "receivedType": "application/pdf"
}
```

```json
{
  "error": "File too large",
  "message": "File size must be under 10MB"
}
```

```json
{
  "error": "Failed to parse AI response",
  "message": "The AI service returned an invalid response format. Please try again or contact support."
}
```

## AI Integration

The ingest API uses the existing AI proxy system with:
- **Model**: `gpt-3.5-turbo` (cost-effective for structured extraction)
- **Temperature**: 0.1 (low for consistent output)
- **Max Tokens**: 2000
- **System Prompt**: Detailed instructions for extracting structured data

## Usage Tracking

All ingest operations automatically track:
1. **UsageMeter**: Monthly AI generation counts per user
2. **ProviderUsage**: AI service costs and token usage
3. **Cost Estimation**: Token-based cost calculations

## Future Enhancements

- **PDF Processing**: Direct PDF text extraction
- **Image OCR**: Text extraction from screenshots and images
- **Email Parsing**: Direct email attachment processing
- **Booking Integration**: Direct flight/hotel booking from extracted data
