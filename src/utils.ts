import { genres } from "./constants";

export function getGenresMsg() {
    return genres.reduce((prev, curr, i) => {
        return `${prev}${i + 1}. ${curr.title}\n`;
    }, "");
}
