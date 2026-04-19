import { graphql } from "../graphql.js";

export async function createIssue(
  token: string,
  owner: string,
  repo: string,
  title: string,
  body?: string
) {
  // 1. Get repo node ID
  const repoQuery = `
    query GetRepo($owner: String!, $repo: String!) {
      repository(owner: $owner, name: $repo) { id }
    }
  `;
  const repoData = await graphql<any>(token, repoQuery, { owner, repo });
  const repositoryId: string = repoData?.repository?.id;
  if (!repositoryId) throw new Error(`Repository ${owner}/${repo} not found`);

  // 2. Create issue
  const mutation = `
    mutation CreateIssue($repositoryId: ID!, $title: String!, $body: String) {
      createIssue(input: { repositoryId: $repositoryId, title: $title, body: $body }) {
        issue {
          number
          title
          url
          state
        }
      }
    }
  `;

  const data = await graphql<any>(token, mutation, { repositoryId, title, body });
  return data?.createIssue?.issue;
}
