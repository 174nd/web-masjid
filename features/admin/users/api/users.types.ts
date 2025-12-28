export type UserItem = {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export type UsersResponse = {
  status: "success";
  data: UserItem[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

export type CreateUserPayload = {
  name: string;
  username: string;
  password: string;
  email: string;
  role: string;
  isActive: boolean;
};

export type UpdateUserPayload = Partial<CreateUserPayload>;
