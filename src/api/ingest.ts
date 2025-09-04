import api from "./client";

export type IngestSource = "text" | "file";

export interface IngestTextPayload {
  source: "text";
  text: string;
}

export interface IngestFilePayload {
  source: "file";
  file: File | Blob;
}

export type IngestPayload = IngestTextPayload | IngestFilePayload;

export interface ExtractedFlight {
  airlineIATA: string;
  flightNumber: string;
  departIATA: string;
  arriveIATA: string;
  departDateLocal: string;
  departTimeLocal: string;
  arriveDateLocal: string;
  arriveTimeLocal: string;
  bookingRef?: string;
  passengerNames?: string[];
}

export interface ExtractedHotel {
  name: string;
  address?: string;
  city: string;
  country: string;
  checkInDate: string;
  checkOutDate: string;
  bookingRef?: string;
}

export interface IngestResponse {
  success: boolean;
  source: IngestSource;
  flights: ExtractedFlight[];
  hotels: ExtractedHotel[];
  aiProvider: string;
  aiModel: string;
  usage: {
    subjectId: string;
    monthKey: string;
    aiGenerations: number;
    totalTokens: number;
    costEstimate?: number;
  };
}

/**
 * Process text or file upload to extract structured flight and hotel information
 */
export async function ingestItinerary(source: IngestSource, payload: IngestPayload): Promise<IngestResponse> {
  if (source === "text") {
    const textPayload = payload as IngestTextPayload;
    return api.post("/api/ingest/itinerary", textPayload).then(r => r.data);
  } else {
    // File upload using FormData
    const filePayload = payload as IngestFilePayload;
    const formData = new FormData();
    formData.append('source', 'file');
    formData.append('file', filePayload.file);
    return api.post("/api/ingest/itinerary", formData, { 
      headers: { "Content-Type": "multipart/form-data" } 
    }).then(r => r.data);
  }
}

/**
 * Process text itinerary (convenience function)
 */
export async function ingestItineraryFromText(text: string): Promise<IngestResponse> {
  return api.post("/api/ingest/itinerary", { source: "text", text }).then(r => r.data);
}

/**
 * Process file itinerary (convenience function)
 */
export async function ingestItineraryFromFile(form: FormData): Promise<IngestResponse> {
  return api.post("/api/ingest/itinerary", form, { 
    headers: { "Content-Type": "multipart/form-data" } 
  }).then(r => r.data);
}

/**
 * Process text itinerary (legacy function)
 */
export async function ingestTextItinerary(text: string): Promise<IngestResponse> {
  return ingestItinerary("text", { source: "text", text });
}

/**
 * Process file itinerary (legacy function)
 */
export async function ingestFileItinerary(file: File | Blob): Promise<IngestResponse> {
  return ingestItinerary("file", { source: "file", file });
}
