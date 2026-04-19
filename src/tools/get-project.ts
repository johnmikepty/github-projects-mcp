import { graphql } from "../graphql.js";

export async function getProject(token: string, owner: string, projectNumber: number) {
  const query = `
    query GetProject($owner: String!, $projectNumber: Int!) {
      user(login: $owner) {
        projectV2(number: $projectNumber) {
          id
          title
          url
          fields(first: 20) {
            nodes {
              ... on ProjectV2SingleSelectField {
                id
                name
                options { id name }
              }
              ... on ProjectV2Field {
                id
                name
              }
            }
          }
        }
      }
    }
  `;

  const data = await graphql<any>(token, query, { owner, projectNumber });
  const project = data?.user?.projectV2;

  if (!project) throw new Error(`Project #${projectNumber} not found for user ${owner}`);

  return project;
}
