import { Composer, Markup, Scenes } from "telegraf";
import { Wizard, genres, tempFolderPath } from "./constants";
import { IContext } from "./types";
import { getGenresMsg } from "./utils";
import { download } from "./upload.service";
import { extname } from "path";
import { v4 } from "uuid";
import { unlink } from "fs/promises";
import { addMetadata, composeMetadataParams } from "./metadata.service";

const stepHandler = new Composer<IContext>();

stepHandler.action("next", (ctx) => {
    ctx.reply("Почти готово!", finalizeMarkup);
    ctx.wizard.next();
});
stepHandler.on("document", async (ctx) => {
    const file = ctx.message.document;
    if (file) {
        if (file.mime_type.split("/")[0] !== "image") {
            return ctx.reply("Это не фото)");
        }
        const downloadUrl = await ctx.telegram.getFileLink(file.file_id);
        const filepath = `${tempFolderPath}/${v4()}${extname(file.file_name)}`;
        await download(downloadUrl.href, filepath);
        ctx.session.coverPath = filepath;
    }
    ctx.reply("Почти готово!", finalizeMarkup);
    return ctx.wizard.next();
});
stepHandler.use((ctx) => {
    ctx.reply("Скиньте фото файлом");
});

const nextStepMarkup = Markup.inlineKeyboard([[Markup.button.callback("Пропустить", "next")]]);
const finalizeMarkup = Markup.inlineKeyboard([[Markup.button.callback("Завершить✅", "next")]]);

export const addMetadataWizard = new Scenes.WizardScene(
    Wizard.addMetadata,
    async (ctx) => {
        ctx.session.metadata = {};
        ctx.reply("Отправьте аудиофайл");
        return ctx.wizard.next();
    },
    async (ctx) => {
        const message = ctx.message as any;
        const audio = message?.audio;
        if (!audio) {
            return ctx.reply("Это не аудио");
        }
        ctx.session.fileId = audio.file_id;
        ctx.session.ext = extname(audio.file_name);
        ctx.reply("Введите название трека", nextStepMarkup);
        return ctx.wizard.next();
    },
    async (ctx) => {
        const message = ctx.message as any;
        const text = message?.text;
        if (text) {
            ctx.session.metadata.title = text;
        }
        ctx.reply("Введите автора трека", nextStepMarkup);
        return ctx.wizard.next();
    },
    async (ctx) => {
        const message = ctx.message as any;
        const text = message?.text;
        if (text) {
            ctx.session.metadata.artist = text;
        }
        ctx.reply("Введите название альбома", nextStepMarkup);
        return ctx.wizard.next();
    },
    async (ctx) => {
        const message = ctx.message as any;
        const text = message?.text;
        if (text) {
            ctx.session.metadata.album = text;
        }
        ctx.reply(`Выберите жанр (цифру)\n\n${getGenresMsg()}`, nextStepMarkup);
        return ctx.wizard.next();
    },
    async (ctx) => {
        const message = ctx.message as any;
        const text = message?.text;
        if (text) {
            if (isNaN(parseInt(text))) {
                return ctx.reply("Введите номер жанра из списка");
            }
            if (text <= 0 || text > genres.length) {
                return ctx.reply("Такого жанра нет в списке");
            }
            ctx.session.metadata.genre = genres[text - 1].value;
        }
        ctx.reply(`Введите комментарий`, nextStepMarkup);
        return ctx.wizard.next();
    },
    async (ctx) => {
        const message = ctx.message as any;
        const text = message?.text;
        if (text) {
            ctx.session.metadata.comment = text;
        }
        ctx.reply("Отправьте фото для обложки (файлом)", nextStepMarkup);
        return ctx.wizard.next();
    },
    stepHandler,
    async (ctx) => {
        console.log(ctx.session);
        ctx.reply("Обработка...");
        const downloadUrl = await ctx.telegram.getFileLink(ctx.session.fileId);
        const filepath = `${tempFolderPath}/${v4()}.${ctx.session.ext}`;
        await download(downloadUrl.href, filepath);
        const outputPath = await addMetadata(
            filepath,
            composeMetadataParams(ctx.session.metadata),
            ctx.session.coverPath
        );

        await ctx.replyWithAudio({ source: outputPath });
        if (ctx.session.coverPath) {
            await unlink(ctx.session.coverPath);
        }
        await Promise.all([unlink(filepath), unlink(outputPath)]);
        return ctx.scene.leave();
    }
);
