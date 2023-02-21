import axios from "axios";
import { createWriteStream } from "fs";

export async function download(url: string, filepath: string) {
    return new Promise<void>(async (resolve, reject) => {
        const res = await axios({ url, responseType: "stream" });
        res.data
            .pipe(createWriteStream(filepath))
            .on("finish", () => {
                resolve();
            })
            .on("error", (err) => {
                reject(err);
            });
    });
}
