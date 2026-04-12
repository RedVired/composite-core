#!/usr/bin/env node

import * as swemu from "./swemu.js";
import * as bundler from "./bundler.js";
import { Command } from "commander";
import fs from "node:fs";
import yaml from "js-yaml";

const program = new Command();

//global defaults
const configPaths = [
  "./config.yaml",
  "./config.yml",
  "./config.json",
  "./swemu.yaml",
  "./swemu.yml",
  "./swemu.json",
];
const configExample = {
  services: {
    a: { filePath: "./a.lua" },
    b: { filePath: "./b.lua" },
  },
  links: [
    { from: "a", to: "b" },
    { from: "b", to: "a" },
  ],
  log: { console: true, bus: true },
  simulation: { tickHz: 40 },
};

//global calculated
{
  //find config
  name: for (let path of configPaths) {
    if (fs.existsSync(path)) {
      var configPath = path;
      break name;
    }
  }
  var configExists = fs.existsSync(configPath);
  if (configExists) {
    let content = fs.readFileSync(configPath, "utf8");
    try {
      var configObject = yaml.load(content);
    } catch (error) {
      throw new Error("Failed to parse config file: " + error.message);
    }
  } else {
    console.log("No config file found. Please run 'cclua init' to create one.");
  }
}

program.name("cclua").description("composite-core cli").version("0.1.0");

program
  .command("init")
  .description("Initialize a new project")
  .action(() => {
    if (!configExists) {
      fs.writeFileSync("config.yaml", yaml.dump(configExample));
    }
    if (!fs.existsSync("./composite_modules")) {
      fs.mkdirSync("./composite_modules");
    }
    if (!fs.existsSync("./src")) {
      fs.mkdirSync("./src");
    }
  });

program
  .command("run")
  .description("Run the SW simulator")
  .option("-t, --ticks <ticks>", "Number of ticks to run")
  .action((options) => {
    const sim = new swemu.SWSimulator(configObject);
    if (options.ticks) {
      sim.runInterval(parseInt(options.ticks));
    } else {
      sim.run();
    }
  });

program
  .command("build")
  .description("build swlua file whith composite modules")
  .action(() => {
    if (!fs.existsSync("./src")) {
      fs.mkdirSync("./src");
    }
    if (!fs.existsSync("./dist")) {
      fs.mkdirSync("./dist");
    }

    let srccode = fs
      .readdirSync("./src")
      .filter((file) => file.search(/.+.lua/) != -1);
    for (let fileName of srccode) {
      fs.writeFileSync(
        "./dist/" + fileName,
        bundler.bundle(
          fs.readFileSync("./src/" + fileName, "utf-8"),
          "./composite_modules/",
        ),
      );
    }
  });

program.parse();
