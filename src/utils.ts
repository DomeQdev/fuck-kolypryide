export const getNextNDays = (n: number): string[] =>
    Array.from({ length: n }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);

        return d.toISOString().split("T")[0];
    });

export const timeToSeconds = (timeStr: string): number => {
    const [h, m] = timeStr.split(":").map(Number);

    return h * 3600 + m * 60;
};

export const secondsToTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};
