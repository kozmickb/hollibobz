import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import pdf from "pdf-parse";
import { dispatchWithCheapestFirst } from "../../ai/providerRouter";
import { 
  incrUsage, 
  recordProviderUsage 
} from "../../db";
import { 
  attachSubjectId,
  getSubjectId 
} from "../../middleware/subject";
import { 
  getPlan,
  checkMonthlyUsageLimit,
  LIMIT_RULES
} from "../../middleware/entitlement";

export const ingestRouter = Router();

// Apply subject ID middleware
ingestRouter.use(attachSubjectId);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Max 10MB
  },
  fileFilter: (req, file, cb) => {
    // Only allow specific MIME types as requested
    const allowedMimeTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'text/plain'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Please upload PDF, PNG, JPEG, or plain text files.`));
    }
  }
});

// Helper function to extract text from different file types
async function extractTextFromFile(file: Express.Multer.File): Promise<string> {
  const { mimetype, buffer } = file;
  
  switch (mimetype) {
    case 'text/plain':
      return buffer.toString('utf-8');
      
    case 'application/pdf':
      try {
        const data = await pdf(buffer);
        return data.text;
      } catch (error) {
        throw new Error('Failed to parse PDF file. The PDF may be corrupted or password-protected.');
      }
      
    case 'image/png':
    case 'image/jpeg':
      // Check if Tesseract is available (optional OCR)
      try {
        // For now, return a friendly message since Tesseract is not installed
        throw new Error('OCR processing is not currently available. Please provide a text version of your itinerary.');
      } catch (error) {
        throw new Error('OCR processing is not currently available. Please provide a text version of your itinerary.');
      }
      
    default:
      throw new Error(`Unsupported file type: ${mimetype}`);
  }
}

// Schema for the expected AI response
const FlightSchema = z.object({
  airlineIATA: z.string().length(2).toUpperCase(),
  flightNumber: z.string(),
  departIATA: z.string().length(3).toUpperCase(),
  arriveIATA: z.string().length(3).toUpperCase(),
  departDateLocal: z.string(),
  departTimeLocal: z.string(),
  arriveDateLocal: z.string(),
  arriveTimeLocal: z.string(),
  bookingRef: z.string().optional(),
  passengerNames: z.array(z.string()).optional()
});

const HotelSchema = z.object({
  name: z.string(),
  address: z.string().optional(),
  city: z.string(),
  country: z.string(),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  bookingRef: z.string().optional()
});

const IngestResponseSchema = z.object({
  flights: z.array(FlightSchema),
  hotels: z.array(HotelSchema)
});

/**
 * POST /api/ingest/itinerary
 * Process text or file upload to extract structured flight and hotel information
 * Accepts multipart with field "file" and text with field "text"
 */
ingestRouter.post("/itinerary", upload.single('file'), async (req, res, next) => {
  try {
    const subjectId = getSubjectId(req);
    const plan = await getPlan(req);
    const { text } = req.body;
    const file = req.file;

    // Check monthly AI generation limits
    const usageCheck = await checkMonthlyUsageLimit(req, 'aiGenerations');
    if (!usageCheck.allowed) {
      return res.status(429).json({
        error: "Monthly limit exceeded",
        message: `You have reached your monthly limit of ${usageCheck.limit} AI generations. Current usage: ${usageCheck.current}`,
        usage: {
          current: usageCheck.current,
          limit: usageCheck.limit,
          plan
        }
      });
    }

    // Validate input - must have either text or file
    if (!text && !file) {
      return res.status(400).json({
        error: "Missing input",
        message: "Either 'text' field or 'file' field is required"
      });
    }

    if (text && file) {
      return res.status(400).json({
        error: "Multiple inputs",
        message: "Please provide either 'text' or 'file', not both"
      });
    }

    let contentToProcess: string;
    let source: string;

    if (text) {
      // Process text input
      if (typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({
          error: "Invalid text input",
          message: "Text field must be a non-empty string"
        });
      }
      contentToProcess = text.trim();
      source = "text";
    } else if (file) {
      // Process file input
      source = "file";
      
      // Enforce file size limits based on plan
      const maxFileSize = LIMIT_RULES.fileSizeLimit(plan);
      if (file.size > maxFileSize) {
        return res.status(413).json({
          error: "File too large",
          message: `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds your plan limit (${Math.round(maxFileSize / 1024 / 1024)}MB)`,
          usage: {
            fileSize: file.size,
            maxFileSize,
            plan
          }
        });
      }

      // Check MIME type
      const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return res.status(415).json({
          error: "Unsupported file type",
          message: `File type '${file.mimetype}' is not supported. Please upload PDF, PNG, JPEG, or plain text files.`,
          supportedTypes: allowedMimeTypes
        });
      }

      try {
        contentToProcess = await extractTextFromFile(file);
      } catch (extractError) {
        if (extractError instanceof Error) {
          if (extractError.message.includes('OCR processing is not currently available')) {
            return res.status(415).json({
              error: "OCR not available",
              message: extractError.message
            });
          }
          return res.status(422).json({
            error: "File processing failed",
            message: extractError.message
          });
        }
        throw extractError;
      }
    } else {
      return res.status(400).json({
        error: "No valid input",
        message: "No valid text or file input provided"
      });
    }

    // Log request (without sensitive content)
    console.log('🔍 Itinerary ingest request:', {
      source,
      contentLength: contentToProcess.length,
      subjectId,
      plan,
      fileType: file?.mimetype
    });

    // Create strict system prompt for AI extraction
    const systemPrompt = `You are an expert travel itinerary parser. Extract flight and hotel information from the provided text and return ONLY a valid JSON object with this exact structure:

{
  "flights": [
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
  ],
  "hotels": [
    {
      "name": "hotel name",
      "address": "optional full address",
      "city": "city name",
      "country": "country name",
      "checkInDate": "YYYY-MM-DD",
      "checkOutDate": "YYYY-MM-DD",
      "bookingRef": "optional booking reference"
    }
  ]
}

CRITICAL RULES:
- Return ONLY the JSON object, no other text, no markdown, no explanations
- Use exact field names and formats shown above
- If no flights or hotels found, return empty arrays: {"flights": [], "hotels": []}
- Dates must be in YYYY-MM-DD format
- Times must be in HH:MM format (24-hour)
- Airport codes must be 3-letter IATA codes
- Airline codes must be 2-letter IATA codes
- If information is missing, omit the field or use empty string
- Do not include any explanatory text or markdown formatting
- Do not include booking references or passenger names in logs`;

    // Call AI service
    const aiResponse = await dispatchWithCheapestFirst({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: contentToProcess }
      ],
      model: "gpt-3.5-turbo", // Use cheaper model for this task
      temperature: 0.1, // Low temperature for consistent structured output
      maxTokens: 2000,
      userId: subjectId
    });

    // Parse AI response
    let parsedData;
    try {
      // Clean the response to remove any markdown formatting
      let cleanContent = aiResponse.content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      parsedData = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('❌ Failed to parse AI response as JSON:', aiResponse.content.substring(0, 200) + '...');
      return res.status(422).json({
        error: "Failed to parse AI response",
        message: "The AI service returned an invalid response format. Please try again or contact support."
      });
    }

    // Validate the parsed data with Zod
    const validationResult = IngestResponseSchema.safeParse(parsedData);
    if (!validationResult.success) {
      console.error('❌ AI response validation failed:', validationResult.error.issues);
      return res.status(422).json({
        error: "Invalid AI response format",
        message: "The AI service returned data in an unexpected format. Please try again or contact support.",
        details: validationResult.error.issues
      });
    }

    const validatedData = validationResult.data;

    // Update usage metrics
    try {
      // Increment AI generations count
      await incrUsage(subjectId, {
        aiGenerations: 1
      });

      // Record AI provider usage
      await recordProviderUsage({
        provider: "ai",
        endpoint: "/api/ingest/itinerary",
        units: aiResponse.usage.totalTokens,
        costCents: Math.round((aiResponse.costEstimate || 0) * 100), // Convert to cents
        subjectId
      });

      console.log('✅ Usage metrics updated for subject:', subjectId);
    } catch (usageError) {
      console.error('❌ Error updating usage metrics:', usageError);
      // Continue with the response even if usage tracking fails
    }

    // Return clean response with flights and hotels
    res.json({
      flights: validatedData.flights,
      hotels: validatedData.hotels,
      source,
      aiProvider: aiResponse.provider,
      aiModel: aiResponse.model,
      usage: {
        subjectId,
        plan,
        aiGenerations: 1,
        totalTokens: aiResponse.usage.totalTokens,
        costEstimate: aiResponse.costEstimate
      }
    });

  } catch (error) {
    console.error('❌ Itinerary ingest error:', error);
    
    // Handle multer errors
    if (error instanceof Error && error.message.includes('File too large')) {
      return res.status(413).json({
        error: "File too large",
        message: "File size exceeds the 10MB limit"
      });
    }
    
    if (error instanceof Error && error.message.includes('Unsupported file type')) {
      return res.status(415).json({
        error: "Unsupported file type",
        message: error.message
      });
    }
    
    // Handle other errors
    next(error);
  }
});