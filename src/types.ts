export interface Customer {
    name: string;
    prefix: string;
    domain: string;
}

export interface CliChoices {
    provider: Customer;
    proxyOption: "none" | "custom";
    customProxies: string[];
}

export type RawStop = [string, number, string, number, number];

export enum ERawStop {
    id = 0,
    code = 1,
    name = 2,
    lon = 3,
    lat = 4,
}

export interface Departure {
    trip_id: number;
}

export interface TripDetails {
    times: {
        place_id: string;
        departure_time: string;
    }[];
    direction: string;
    line: { name: string };
    trip_id: string;
}

export interface ScrapedData {
    provider: Customer;
    stops: RawStop[];
    trips: TripDetails[];
    tripCalendar: Map<string, Set<string>>;
}
