export interface AuthUser {
  bouncer_code: string;
  bouncer_name: string;
  apt_code: string;
}

export interface Apartment {
  apt_code: string;
  apt_name: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
  apartment: Apartment;
}
