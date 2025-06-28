import prompts from "prompts";
import axios from "axios";
import chalk from "chalk";
import { Customer, CliChoices } from "./types";

export async function runCli(): Promise<CliChoices | null> {
    const args = process.argv.slice(2);
    const agencyIndex = args.indexOf("--agency");
    const agencyArg = agencyIndex > -1 ? args[agencyIndex + 1] : undefined;

    const proxiesIndex = args.indexOf("--proxies");
    const proxiesArg = proxiesIndex > -1 ? args[proxiesIndex + 1] : undefined;

    const customers = await axios
        .get("http://gpa.kolypryide.com.ua/api/customers")
        .then((res) => res.data.customers as Customer[]);

    if (agencyArg) {
        const provider = customers.find((c) => c.prefix === agencyArg);
        if (!provider) {
            console.log(chalk.red(`Nie znaleziono przewoźnika o prefiksie: ${agencyArg}`));
            return null;
        }

        let proxyOption: "none" | "custom" = "none";
        let customProxies: string[] = [];

        if (proxiesArg) {
            proxyOption = "custom";
            customProxies = proxiesArg.split(",").filter((p: string) => p.length > 0);
            if (customProxies.length === 0) {
                console.log(chalk.yellow("Nie podano żadnych prawidłowych proxy. Kontynuuję bez nich."));
                proxyOption = "none";
            }
        }

        console.log(chalk.green(`Wybrano przewoźnika: ${provider.name} (${provider.prefix})`));
        if (proxyOption === "custom") {
            console.log(chalk.green(`Używam ${customProxies.length} serwerów proxy.`));
        } else {
            console.log(chalk.green("Nie używam serwerów proxy."));
        }

        return { provider, proxyOption, customProxies };
    }

    const { providerPrefix } = await prompts({
        type: "autocomplete",
        name: "providerPrefix",
        message: "Wybierz przewoźnika (zacznij pisać, aby wyszukać)",
        choices: customers.map((c) => ({ title: `${c.name} (${c.prefix})`, value: c.prefix })),
    });

    if (!providerPrefix) return null;
    const provider = customers.find((c) => c.prefix === providerPrefix)!;

    const { proxyOption } = await prompts({
        type: "select",
        name: "proxyOption",
        message: "Czy chcesz skorzystać z serwerów proxy?",
        choices: [
            { title: "Nie", value: "none" },
            { title: "Tak, użyję własnej listy proxy", value: "custom" },
        ],
    });

    if (!proxyOption) return null;

    let customProxies: string[] = [];
    if (proxyOption === "custom") {
        const { proxies } = await prompts({
            type: "list",
            name: "proxies",
            message: "Wklej listę proxy (format: ip:port:user:pass), oddzielając je przecinkami",
            separator: ",",
        });
        customProxies = proxies.filter((p: string) => p.length > 0);
        if (customProxies.length === 0) {
            console.log(chalk.yellow("Nie podano żadnych proxy. Kontynuuję bez nich."));
            return { provider, proxyOption: "none", customProxies: [] };
        }
    }

    return { provider, proxyOption, customProxies };
}
