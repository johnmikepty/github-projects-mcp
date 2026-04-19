import { graphql } from "../graphql.js";
import { getProject } from "./get-project.js";
import { listProjectItems } from "./list-items.js";

export async function moveProjectItem(
  token: string,
  owner: string,
  projectNumber: number,
  issueNumber: number,
  targetStatus: string
) {
  // 1. Get project metadata (id, Status field id, option ids)
  const project = await getProject(token, owner, projectNumber);
  const projectId: string = project.id;

  const statusField = project.fields.nodes.find(
    (f: any) => f.name === "Status"
  );
  if (!statusField) throw new Error(`No "Status" field found in project #${projectNumber}`);

  const option = statusField.options?.find(
    (o: any) => o.name.toLowerCase() === targetStatus.toLowerCase()
  );
  if (!option) {
    const available = statusField.options?.map((o: any) => o.name).join(", ");
    throw new Error(`Status "${targetStatus}" not found. Available: ${available}`);
  }

  // 2. Find the project item ID for the given issue number
  const items = await listProjectItems(token, owner, projectNumber);
  const item = items.find((i: any) => i.number === issueNumber);
  if (!item) throw new Error(`Issue #${issueNumber} not found in project #${projectNumber}`);

  // 3. Update the Status field
  const mutation = `
    mutation MoveItem($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
      updateProjectV2ItemFieldValue(input: {
        projectId: $projectId
        itemId: $itemId
        fieldId: $fieldId
        value: { singleSelectOptionId: $optionId }
      }) {
        projectV2Item { id }
      }
    }
  `;

  await graphql(token, mutation, {
    projectId,
    itemId: item.itemId,
    fieldId: statusField.id,
    optionId: option.id,
  });

  return {
    success: true,
    message: `Issue #${issueNumber} moved to "${option.name}" in project #${projectNumber}`,
  };
}
