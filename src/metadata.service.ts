import * as ffmpeg from "fluent-ffmpeg";
import { IMetadata } from "./types";
import { extname, join } from "path";
import { v4 } from "uuid";
import { tempFolderPath } from "./constants";

export function composeMetadataParams(metadata: IMetadata): string[] {
    const metadataParams = [];
    for (const [key, value] of Object.entries(metadata)) {
        metadataParams.push("-metadata", `${key}=${value}`);
    }
    return metadataParams;
}

export async function addMetadata(filepath: string, metadata: string[], coverPath?: string) {
    const outputPath = join(tempFolderPath, v4() + extname(filepath));

    return new Promise<string>((resolve, reject) => {
        let options = coverPath
            ? ["-i", coverPath, "-map", "0:0", "-map", "1:0", "-c", "copy", "-id3v2_version", "3", ...metadata]
            : [...metadata];
        ffmpeg(filepath)
            .outputOptions(...options)
            .on("error", (err) => {
                reject(err);
            })
            .on("end", () => {
                resolve(outputPath);
            })
            .save(outputPath);
    });
}
