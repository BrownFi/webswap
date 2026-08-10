export function getPercentChange(valueNow: number | undefined, value24HoursAgo: number | undefined): number {
    if (valueNow && value24HoursAgo) {
        const change = ((valueNow - value24HoursAgo) / value24HoursAgo) * 100;
        return change;
    }
    return 0;
}
