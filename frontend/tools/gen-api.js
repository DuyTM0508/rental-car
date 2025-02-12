import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs-extra";

async function generateApi() {
  const apiFolder = "./src/apis";

  const { urlPath, apiName, method } = await inquirer.prompt([
    { type: "input", name: "apiName", message: "API Name (ex. updateUser):" },
    { type: "list", name: "method", message: "Method", choices: ["GET", "POST", "PUT", "DELETE", "PATCH"] },
    { type: "input", name: "urlPath", message: "Path: " },
  ]);

  const url = String(urlPath).replace(/:.+/g, (match) => `\${params?.${match.slice(1)}}`);

  const fileContent = `import { api } from "./client";
  import queryString from "query-string";
  
  export async function updateUser({ params, queries, body = {} } = {}) {
    const { data } = await api.request({
      method: "${method}",
      url: \`${url}\`,
      data: body,
      params: queryString.stringify(queries),
    });
  
    return data;
  }
  `;

  await fs.outputFile(`${apiFolder}/${apiName}.api.js`, fileContent);
}

generateApi();
