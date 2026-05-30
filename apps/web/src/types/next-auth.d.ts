import "next-auth";
import "next-auth/jwt";

type Role = "USER" | "EDITOR" | "ADMIN";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
  }
}
