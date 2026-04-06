#!/usr/bin/env node

import * as swemu from "./swemu.js";
import { Command } from "commander";
import fs from "node:fs";
import yaml from "js-yaml";

const program = new Command();

const configPaths = [
  "./config.yaml",
  "./config.yml",
  "./config.json",
  "./swemu.yaml",
  "./swemu.yml",
  "./swemu.json",
];
let configExample = {
  services: {
    a: { filePath: "./a.lua" },
    b: { filePath: "./b.lua" },
  },
  links: [
    { from: "a", to: "b" },
    { from: "b", to: "a" },
  ],
  log: {console: true, bus: true},
  simulation: {tickHz: 40}
};

program.name("cclua").description("composite-core cli").version("0.1.0");

program
  .command("run")
  .description("Run the SW simulator")
  .option("-t, --ticks <ticks>", "Number of ticks to run")
  .action((options) => {
    //find config
    name: for (let path of configPaths) {
      if (fs.existsSync(path)) {
        var configPath = path;
        break name;
      }
    }

    let configObject;
    try {
      let content = fs.readFileSync(configPath, "utf8");
      configObject = yaml.load(content);
    } catch (error) {
      console.error("Ошибка чтения YAML:", error.message);
    }

    const sim = new swemu.SWSimulator(configObject);
    if (options.ticks) {
      sim.runInterval(parseInt(options.ticks));
    } else {
      sim.run();
    }
  });

program
  .command("init")
  .description("Initialize a new project")
  .action(() => {
    let configExists = false;
    for (let path of configPaths) {
      if (fs.existsSync(path)) {
        configExists = true;
        break;
      }
    }

    if (!configExists) {
      fs.writeFileSync("config.yaml", yaml.dump(configExample));
    }

    if (!fs.existsSync("./composite_modules")) {
      fs.mkdirSync("./composite_modules")
    }
  });

program.parse();
