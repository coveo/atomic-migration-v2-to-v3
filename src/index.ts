import { waitForAtomic } from "./utils/atomic";
import { getSampleSearchEngineConfiguration } from "@coveo/headless";
async function main() {
  await waitForAtomic();
  const searchInterface: HTMLAtomicSearchInterfaceElement =
    document.querySelector("atomic-search-interface")!;

  const organizationId = process.env.ORGANIZATION_ID!;
  const platformEnvironment = (process.env.PLATFORM_ENVIRONMENT || "prod") as "prod" | "stg" | "dev" | "hipaa"
  const accessToken = process.env.API_KEY!;
  await searchInterface.initialize({
    accessToken,
    organizationId,
    environment: platformEnvironment,
  });
  console.log("The sample config would be", getSampleSearchEngineConfiguration())

  searchInterface.executeFirstSearch();
}

main();
