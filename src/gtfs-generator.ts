import fs from "fs/promises";
import path from "path";
import JSZip from "jszip";
import Papa from "papaparse";
import ora from "ora";
import { ERawStop, ScrapedData } from "./types";
import { secondsToTime, timeToSeconds } from "./utils";

export async function generateGtfs(data: ScrapedData) {
    const spinner = ora("Przygotowywanie danych do formatu GTFS...").start();
    const zip = new JSZip();

    zip.file(
        "agency.txt",
        Papa.unparse([
            {
                agency_id: data.provider.prefix,
                agency_name: data.provider.name,
                agency_url: `https://${data.provider.prefix}.${data.provider.domain}`,
                agency_timezone: "Europe/Warsaw",
                agency_lang: "pl",
            },
        ])
    );

    const routes = new Map<string, Object>();
    const trips: Object[] = [];
    const stopTimes: Object[] = [];
    const calendarDates: Object[] = [];

    const usedStops = new Set<string>();

    for (const tripDetail of data.trips) {
        const routeId = tripDetail.line.name;
        if (!routes.has(routeId)) {
            routes.set(routeId, {
                route_id: routeId,
                agency_id: data.provider.prefix,
                route_short_name: routeId,
                route_type: 3,
            });
        }

        const tripId = tripDetail.trip_id;
        const serviceId = tripId;

        trips.push({
            route_id: routeId,
            service_id: serviceId,
            trip_id: tripId,
            trip_headsign: tripDetail.direction,
        });

        const datesForTrip = data.tripCalendar.get(tripId);
        if (datesForTrip) {
            for (const date of datesForTrip) {
                calendarDates.push({ service_id: serviceId, date: date, exception_type: 1 });
            }
        }

        let lastDepartureSeconds = -1;
        tripDetail.times.forEach((stopTime, index) => {
            let departureSeconds = timeToSeconds(stopTime.departure_time);

            if (departureSeconds < lastDepartureSeconds) {
                departureSeconds += 24 * 3600;
            }
            lastDepartureSeconds = departureSeconds;

            usedStops.add(stopTime.place_id);

            stopTimes.push({
                trip_id: tripId,
                arrival_time: secondsToTime(departureSeconds),
                departure_time: secondsToTime(departureSeconds),
                stop_id: stopTime.place_id,
                stop_sequence: index + 1,
            });
        });
    }

    zip.file(
        "stops.txt",
        Papa.unparse(
            data.stops
                .filter((stop) => usedStops.has(stop[ERawStop.id]))
                .map((stop) => ({
                    stop_id: stop[ERawStop.id],
                    stop_code: stop[ERawStop.code],
                    stop_name: stop[ERawStop.name],
                    stop_lon: stop[ERawStop.lon] / 1e6,
                    stop_lat: stop[ERawStop.lat] / 1e6,
                }))
        )
    );

    zip.file("routes.txt", Papa.unparse(Array.from(routes.values())));
    zip.file("trips.txt", Papa.unparse(trips));
    zip.file("stop_times.txt", Papa.unparse(stopTimes));
    zip.file("calendar_dates.txt", Papa.unparse(calendarDates));

    const fileName = `gtfs_${data.provider.prefix}.zip`;

    spinner.text = `Kompresowanie danych do pliku ${fileName}...`;
    const content = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 9 },
    });

    await fs.writeFile(path.join(process.cwd(), fileName), content);

    spinner.succeed("Zakończono generowanie GTFS.");
}
