import axios, { AxiosInstance } from "axios";
import { HttpsProxyAgent } from "hpagent";
import { CliChoices } from "./types";

export async function createAxiosInstance(choices: CliChoices): Promise<AxiosInstance> {
    const { provider, proxyOption, customProxies } = choices;
    let proxyList: string[] = [];

    if (proxyOption === "custom") {
        proxyList = customProxies;
    }

    const apiClient = axios.create({ baseURL: `https://${provider.prefix}.${provider.domain}` });

    if (proxyList.length > 0) {
        apiClient.interceptors.request.use((config) => {
            const randomProxy = proxyList[Math.floor(Math.random() * proxyList.length)];
            const [host, port, username, password] = randomProxy.split(":");

            const proxyConfig = {
                keepAlive: true,
                keepAliveMsecs: 1000,
                maxSockets: 256,
                maxFreeSockets: 256,
                proxy: `http://${username && password ? `${username}:${password}@` : ""}${host}:${port}`,
            };

            config.httpsAgent = new HttpsProxyAgent(proxyConfig);
            config.httpAgent = new HttpsProxyAgent(proxyConfig);

            return config;
        });
    }

    return apiClient;
}
