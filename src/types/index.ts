export interface UserPreferences {
  // Travel style
  accommodation: "budget-hostel" | "mid-range-hotel" | "5-star" | "camping" | "homestay" | "";
  pace: "slow-relaxed" | "moderate" | "packed-itinerary" | "";
  wakeTime: "early-bird" | "night-owl" | "flexible" | "";
  tripStyle: "solo-explorer" | "small-group" | "large-group" | "";
  budgetRange: "under-5k" | "5k-15k" | "15k-40k" | "40k-plus" | "";

  // Interests
  travelTypes: string[];       // ["mountains", "beaches", "heritage", "wildlife", "road-trips", "backpacking"]
  skillTags: string[];         // ["pro-rider", "beginner-rider", "mechanic", "photographer", "trekker", "diver"]

  // Personality
  gender: "male" | "female" | "non-binary" | "prefer-not-to-say" | "";
  ageGroup: "18-24" | "25-30" | "31-40" | "41-50" | "50+" | "";
  languages: string[];         // ["hindi", "english", "tamil", "telugu", ...]

  // Food
  diet: "veg" | "non-veg" | "vegan" | "jain" | "";
  cuisines: string[];          // ["indian", "chinese", "italian", "iranian", "continental", "street-food"]

  // Entertainment
  movieGenres: string[];       // ["action", "romance", "horror", "thriller", "suspense", "comedy", "hindi", "english"]
  music: string[];             // ["bollywood", "rock", "classical", "hip-hop", "indie"]

  // Dislikes
  dealbreakers: string[];      // ["smoking", "drinking", "late-nights", "pets", "kids-on-trip"]

  // Profile completeness
  phone?: string;
  dob?: string;                // "YYYY-MM-DD"
  instagram?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  city: string;
  bio: string;
  verified: boolean;
  travelStyle: string;
  budget: string;
  tripsJoined: string[];
  tripsHosted: string[];
  eventsRegistered: string[];
  followers: string[];
  following: string[];
  website?: string;
  preferences?: UserPreferences;
  onboardingDone?: boolean;
}

export interface Trip {
  id: string;
  title: string;
  from?: string;
  fromState?: string;
  destination: string;
  state: string;
  startDate: string;
  endDate: string;
  type: string;
  image: string;
  hostId: string;
  hostName: string;
  rating: number;
  budget: string;
  difficulty: "Easy" | "Moderate" | "Hard";
  totalSpots: number;
  joinedUsers: string[];
  description: string;
  whatToBring: string;
  createdAt: string;
  photoUrl?: string;
  genderPreference?: "Everyone" | "Males Only" | "Females Only" | "Couples" | "Mixed Groups";
  ageGroups?: string[];
}

export interface Event {
  id: string;
  title: string;
  host: string;
  hostId: string;
  date: string;
  location: string;
  maxAttendees: number;
  attendees: string[];
  type: string;
  price: string;
  image: string;
  photoUrl?: string;
  badge: string | null;
  description: string;
}

export interface Post {
  id: string;
  type: "blog" | "photo" | "video";
  authorId: string;
  author: string;
  avatar: string;
  location: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  mediaUrl?: string;
  likes: string[];
  comments: Comment[];
  views: number;
  readTime: string;
  tags: string[];
  createdAt: string;
}

export interface Comment {
  id: string;
  authorId: string;
  author: string;
  avatar: string;
  text: string;
  createdAt: string;
  likes?: string[];
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}
