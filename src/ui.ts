import prompts from "prompts";
import axios from "axios";
import chalk from "chalk";
import { Customer, CliChoices } from "./types";

export async function runCli(): Promise<CliChoices | null> {
    const customers = await axios
        .get("http://gpa.kolypryide.com.ua/api/customers")
        .then((res) => res.data.customers as Customer[]);

    const { providerPrefix } = await prompts({
        type: "autocomplete",
        name: "providerPrefix",
        message: "Wybierz przewoźnika (zacznij pisać, aby wyszukać)",
        choices: customers.map((c) => ({ title: c.name, value: c.prefix })),
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
            message: "Wklej listę proxy (format: ip:port:user:pass), oddzielając nową linią",
            separator: "\n",
        });
        customProxies = proxies.filter((p: string) => p.length > 0);
        if (customProxies.length === 0) {
            console.log(chalk.yellow("Nie podano żadnych proxy. Kontynuuję bez nich."));
            return { provider, proxyOption: "none", customProxies: [] };
        }
    }

    return { provider, proxyOption, customProxies };
}
