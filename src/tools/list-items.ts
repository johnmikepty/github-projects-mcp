import { graphql } from "../graphql.js";

export async function listProjectItems(token: string, owner: string, projectNumber: number) {
  const query = `
    query ListProjectItems($owner: String!, $projectNumber: Int!) {
      user(login: $owner) {
        projectV2(number: $projectNumber) {
          id
          title
          items(first: 100) {
            nodes {
              id
              fieldValues(first: 10) {
                nodes {
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    name
                    field { ... on ProjectV2SingleSelectField { name } }
                  }
                  ... on ProjectV2ItemFieldTextValue {
                    text
                    field { ... on ProjectV2Field { name } }
                  }
                }
              }
              content {
                ... on Issue {
                  number
                  title
                  state
                  url
                }
                ... on PullRequest {
                  number
                  title
                  state
                  url
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await graphql<any>(token, query, { owner, projectNumber });
  const items = data?.user?.projectV2?.items?.nodes ?? [];

  return items.map((item: any) => {
    const statusField = item.fieldValues?.nodes?.find(
      (fv: any) => fv?.field?.name === "Status"
    );
    return {
      itemId: item.id,
      number: item.content?.number,
      title: item.content?.title,
      state: item.content?.state,
      url: item.content?.url,
      status: statusField?.name ?? "No status",
    };
  });
}
