/**
 * Schema for an Event object.
 * Matches the backend EventService return type.
 */
export interface Event {
  id: string;
  title: string;
  date: string; // ISO 8601 date string
  location: string;
  description?: string;
  imageUrl?: string;
}

/**
 * Schema for a Khutbah Topic object.
 * Matches the backend KhutbahTopicService return type.
 */
export interface KhutbahTopic {
  id: string;
  title: string;
  speaker?: string;
  dateAdded: string; // ISO 8601 date string
  tags?: string[];
}
