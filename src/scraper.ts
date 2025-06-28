import { AxiosError, AxiosInstance } from "axios";
import pLimit, { LimitFunction } from "p-limit";
import ora from "ora";
import chalk from "chalk";
import { SingleBar, Presets } from "cli-progress";
import { Customer, RawStop, Departure, TripDetails, ScrapedData, ERawStop } from "./types";
import { getNextNDays } from "./utils";

const CONCURRENCY = 5;

async function fetchAllTripIds(
    apiClient: AxiosInstance,
    allStops: RawStop[],
    limit: LimitFunction
): Promise<Map<string, Set<string>>> {
    const tripCalendar = new Map<string, Set<string>>();
    const dates = getNextNDays(7);
    const progressBar = new SingleBar(
        { format: "Pobieranie rozkładów |{bar}| {percentage}% || {value}/{total}" },
        Presets.shades_classic
    );
    progressBar.start(allStops.length * dates.length, 0);

    const failedStopSchedules: string[] = [];

    await Promise.all(
        allStops.flatMap((stop) =>
            dates.map((date) =>
                limit(async () => {
                    try {
                        const response = await apiClient.get(
                            `/api/timetables/${stop[ERawStop.id]}?date=${date}`
                        );
                        const departures: Departure[] = response.data.departures || [];

                        for (const dep of departures) {
                            const tripIdStr = dep.trip_id.toString();
                            if (!tripCalendar.has(tripIdStr)) {
                                tripCalendar.set(tripIdStr, new Set());
                            }
                            tripCalendar.get(tripIdStr)!.add(date.replace(/-/g, ""));
                        }
                    } catch (e) {
                        failedStopSchedules.push(
                            `${stop[ERawStop.name]} ${stop[ERawStop.code]} (${stop[ERawStop.id]}): ${date}`
                        );
                    }

                    progressBar.increment();
                })
            )
        )
    );

    progressBar.stop();

    if (failedStopSchedules.length > 0) {
        console.error(chalk.red("Błędy podczas pobierania rozkładów dla niektórych przystanków:"));
        failedStopSchedules.forEach((error) => console.error(chalk.yellow(`- ${error}`)));
    }

    return tripCalendar;
}

async function fetchAllTripDetails(
    apiClient: AxiosInstance,
    tripIds: string[],
    limit: LimitFunction
): Promise<TripDetails[]> {
    const allTripsDetails: TripDetails[] = [];
    const progressBar = new SingleBar(
        { format: "Pobieranie kursów    |{bar}| {percentage}% || {value}/{total} Kursów" },
        Presets.shades_classic
    );
    progressBar.start(tripIds.length, 0);

    const failedTripDetails: string[] = [];

    await Promise.all(
        tripIds.map((tripId) =>
            limit(async () => {
                try {
                    const response = await apiClient.get(`/api/trip/${tripId}/0`);
                    allTripsDetails.push({ ...response.data, trip_id: tripId });
                } catch (e) {
                    failedTripDetails.push(tripId);
                }
                progressBar.increment();
            })
        )
    );

    progressBar.stop();

    if (failedTripDetails.length > 0) {
        console.error(chalk.red("Błędy podczas pobierania szczegółów kursów:"));
        failedTripDetails.forEach((tripId) => console.error(chalk.yellow(`- ${tripId}`)));
    }

    return allTripsDetails;
}

export async function runScrapingPipeline(
    provider: Customer,
    apiClient: AxiosInstance
): Promise<ScrapedData | null> {
    const limit = pLimit(CONCURRENCY);

    const spinner = ora("Krok 1/3: Pobieranie listy przystanków...").start();
    let allStops: RawStop[];
    try {
        const response = await apiClient.get("/stops");
        allStops = response.data.stops;
        spinner.succeed(`Pobrano ${allStops.length} przystanków.`);
    } catch (e) {
        spinner.fail("Błąd podczas pobierania przystanków.");
        console.error((e as AxiosError).response?.status);
        return null;
    }

    console.log(chalk.bold("Krok 2/3: Skanowanie rozkładów w poszukiwaniu kursów..."));
    const tripCalendar = await fetchAllTripIds(apiClient, allStops, limit);
    const uniqueTripIds = Array.from(tripCalendar.keys());
    console.log(chalk.blue(`Znaleziono ${uniqueTripIds.length} kursów.`));

    console.log(chalk.bold("Krok 3/3: Pobieranie szczegółów każdego kursu..."));
    const allTripsDetails = await fetchAllTripDetails(apiClient, uniqueTripIds, limit);

    return { provider, stops: allStops, trips: allTripsDetails, tripCalendar };
}
