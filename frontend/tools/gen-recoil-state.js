import chalk from "chalk";
import fs from "fs-extra";
import inquirer from "inquirer";
import { capitalize } from "lodash-es";

async function generateGlobalState() {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "key",
      message: "Enter the recoil key:",
    },
  ]);

  const key = answers.key;
  const filePath = `./src/recoils/${key}.state.js`;

  const fileContent = [
    `import { atom, useRecoilState } from "recoil";`,
    ``,
    `export const ${key}Atom = atom({`,
    `key: "${key}-atom",`,
    `default: null,`,
    `});`,
    ``,
    `export const use${capitalize(key)}State = () => useRecoilState(${key}Atom);`,
  ].join("\n");

  try {
    await fs.outputFile(filePath, fileContent);
    console.log(chalk.green(`\n✨ Generated recoil state in ${key}.state.js!\n`));
  } catch (err) {
    console.error("Error creating the file:", err);
  }
}

generateGlobalState();
