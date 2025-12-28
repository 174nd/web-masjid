export type NewsTag = {
  id: number;
  name: string;
  createdAt: string;
};

export type NewsSimpleTag = {
  id: number;
  name: string;
};

export type NewsTagRelation = {
  tag_id: number;
  tags: {
    name: string;
    tag_id: number;
  };
};

export type NewsSlug = {
  slug: string;
  news_slug_id: number;
};

export type NewsUser = {
  name: string;
  email: string;
  user_id: number;
};

export type NewsListItem = {
  id: number;
  coverUrl: string | null;
  title: string;
  description: string;
  isPinned: boolean;
  userId: number;
  createdAt: string;
  users?: NewsUser;
  newsSlug?: NewsSlug[];
  newsTags?: NewsTagRelation[];
};

export type NewsDetail = {
  id: number;
  coverUrl: string | null;
  title: string;
  description: string;
  content: string;
  isPinned: boolean;
  userId: number;
  createdAt: string;
  slug: string;
  tags: NewsSimpleTag[];
};

export type NewsListParams = {
  page: number;
  limit: number;
  q?: string;
};

export type NewsListResponse = {
  status: "success";
  data: NewsListItem[];
  message: string;
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
};

export type NewsTagsResponse = {
  status: "success";
  data: NewsTag[];
  message: string;
};

export type NewsDetailResponse = {
  status: "success";
  data: NewsDetail;
  message: string;
};

export type CreateNewsPayload = {
  title: string;
  description: string;
  tags: number[];
  coverDataUri: string | null;
  content: string;
  isPinned: boolean;
};

export type UpdateNewsPayload = {
  title: string;
  description: string;
  tags: number[];
  coverDataUri?: string | null;
  content: string;
  isPinned: boolean;
};

export type CreateNewsResponse = {
  status: "success";
  data: NewsDetail;
  message: string;
};

export type UpdateNewsResponse = CreateNewsResponse;

export type DeleteNewsResponse = {
  status: "success";
  data: { id: number };
  message: string;
};
