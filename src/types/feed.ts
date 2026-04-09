export interface FeedItem {
  id: string;
  type: string;
  detail: string | null;
  trackName: string;
  trackArtist: string;
  userName: string | null;
  userImage: string | null;
  createdAt: string;
}
