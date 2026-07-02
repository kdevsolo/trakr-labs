import * as z from 'zod';

export const GithubRepoRefSchema = z.object({
  owner: z.string(),
  name: z.string(),
  defaultBranch: z.string(),
});

export const GithubConnectionSchema = z.object({
  connected: z.boolean(),
  installed: z.boolean(),
  repo: GithubRepoRefSchema.nullable(),
});

export const AvailableRepoSchema = z.object({
  owner: z.string(),
  name: z.string(),
  repoId: z.number().int(),
  defaultBranch: z.string(),
  private: z.boolean(),
});

export const AvailableReposSchema = z.array(AvailableRepoSchema);

export const LinkRepoSchema = z.object({
  repoOwner: z.string().min(1),
  repoName: z.string().min(1),
});

export const InstallUrlResponseSchema = z.object({
  url: z.string(),
});

export type GithubRepoRef = z.infer<typeof GithubRepoRefSchema>;
export type GithubConnection = z.infer<typeof GithubConnectionSchema>;
export type AvailableRepo = z.infer<typeof AvailableRepoSchema>;
export type AvailableRepos = z.infer<typeof AvailableReposSchema>;
export type LinkRepoInput = z.infer<typeof LinkRepoSchema>;
export type InstallUrlResponse = z.infer<typeof InstallUrlResponseSchema>;
