#!/usr/bin/env node

import chalk from "chalk";
import { runCli } from "./ui";
import { createAxiosInstance } from "./api-client";
import { runScrapingPipeline } from "./scraper";
import { generateGtfs } from "./gtfs-generator";

async function main() {
    console.clear();
    console.log(chalk.bold.bgYellow.blue("   KolyPryide.com.ua  "));
    console.log(chalk.bold.bgBlue.yellow("    GTFS Generator    "));
    console.log("");

    const choices = await runCli();
    if (!choices) return console.log(chalk.yellow("Przerwano."));

    const apiClient = await createAxiosInstance(choices);
    const scrapedData = await runScrapingPipeline(choices.provider, apiClient);

    if (!scrapedData) {
        return console.log(chalk.red("Pobieranie danych nie powiodło się. Kończenie pracy."));
    }

    await generateGtfs(scrapedData);

    console.log(chalk.green.bold(`\nGotowe! Plik GTFS został zapisany w bieżącym katalogu.`));
}

main();
