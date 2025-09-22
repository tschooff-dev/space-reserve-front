import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

// Sanity configuration
export const config = {
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "tv46avri",
  apiVersion: "2024-01-01", // Use current date (YYYY-MM-DD) to target the latest API version
  useCdn: process.env.NODE_ENV === "production", // `false` if you want to ensure fresh data
};

// Set up the client for fetching data in the getProps page functions
export const sanityClient = createClient(config);

// Set up the client for fetching data in the getProps page functions
export const writeClient = createClient({
  ...config,
  token: process.env.SANITY_API_TOKEN,
});

// Helper function for generating Image URLs
const builder = imageUrlBuilder(sanityClient);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  return builder.image(source);
}

// GROQ queries
export const queries = {
  // Get all hotels
  getAllHotels: `*[_type == "hotel" && isActive == true] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    description,
    "heroImage": heroImage.asset->url,
    "heroImageAlt": heroImage.alt,
    contactInfo,
    amenities[]->{
      _id,
      type,
      displayName,
      description,
      "layoutImage": layoutImage.asset->url,
      "layoutImageAlt": layoutImage.alt,
      timeSlots,
      maxReservations,
      seatingLayout,
      specialInstructions
    }
  }`,

  // Get hotel by slug
  getHotelBySlug: `*[_type == "hotel" && slug.current == $slug && isActive == true][0] {
    _id,
    name,
    "slug": slug.current,
    description,
    "heroImage": heroImage.asset->url,
    "heroImageAlt": heroImage.alt,
    contactInfo,
    amenities[]->{
      _id,
      type,
      displayName,
      description,
      "layoutImage": layoutImage.asset->url,
      "layoutImageAlt": layoutImage.alt,
      timeSlots,
      maxReservations,
      seatingLayout,
      specialInstructions
    }
  }`,

  // Get all amenities
  getAllAmenities: `*[_type == "amenity" && isActive == true] | order(displayName asc) {
    _id,
    type,
    displayName,
    description,
    "layoutImage": layoutImage.asset->url,
    "layoutImageAlt": layoutImage.alt,
    timeSlots,
    maxReservations,
    seatingLayout,
    specialInstructions
  }`,

  // Get amenity by type
  getAmenityByType: `*[_type == "amenity" && type == $type && isActive == true][0] {
    _id,
    type,
    displayName,
    description,
    "layoutImage": layoutImage.asset->url,
    "layoutImageAlt": layoutImage.alt,
    timeSlots,
    maxReservations,
    seatingLayout,
    specialInstructions
  }`,
};

// Types for TypeScript
export interface Hotel {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  heroImage?: string;
  heroImageAlt?: string;
  contactInfo?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  amenities?: Amenity[];
}

export interface Amenity {
  _id: string;
  type: string;
  displayName: string;
  description?: string;
  layoutImage?: string;
  layoutImageAlt?: string;
  timeSlots: string[];
  maxReservations: number;
  seatingLayout: {
    totalSeats: number;
    seatsPerSide: number;
    seatNumbering: "alphabetical-number" | "sequential" | "custom";
  };
  specialInstructions?: string;
}
