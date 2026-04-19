import { graphql } from "../graphql.js";
import { getProject } from "./get-project.js";

export async function addIssueToProject(
  token: string,
  owner: string,
  projectNumber: number,
  issueNodeId: string
) {
  const project = await getProject(token, owner, projectNumber);

  const mutation = `
    mutation AddToProject($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
        item { id }
      }
    }
  `;

  const data = await graphql<any>(token, mutation, {
    projectId: project.id,
    contentId: issueNodeId,
  });

  return {
    success: true,
    itemId: data?.addProjectV2ItemById?.item?.id,
    message: `Issue added to project #${projectNumber}`,
  };
}
