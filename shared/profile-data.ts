export interface ProfileData {
  user: { id: string; name: string; image: string | null };
}

export interface ProfileUserRecord {
  id: string;
  name: string;
  image: string | null;
}
