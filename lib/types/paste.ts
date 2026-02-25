export interface Paste {
  id: string;
  content: string;
  language?: string | null;
  expiresAt?: string;
  createdAt: string;
}
