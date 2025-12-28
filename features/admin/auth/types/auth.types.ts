export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    name: string;
    username: string;
    role: "ADMIN" | "SUPER_ADMIN";
  };
};
