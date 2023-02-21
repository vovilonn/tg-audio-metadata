import { config } from "dotenv";
import { Scenes, Telegraf, session } from "telegraf";
import { IContext } from "./types";
import { addMetadataWizard } from "./addMetadata.wizard";
import { Wizard, helpMsg, tempFolderPath } from "./constants";
import { existsSync, mkdirSync } from "fs";

config(); // configure environment

const bot = new Telegraf<IContext>(process.env.TG_BOT_TOKEN);
const stage = new Scenes.Stage<IContext>([addMetadataWizard]);

bot.use(session());

bot.use(stage.middleware());

bot.start((ctx) => {
    ctx.reply(helpMsg);
});

bot.help((ctx) => {
    ctx.reply(helpMsg);
});

bot.command("addmeta", (ctx) => {
    ctx.scene.enter(Wizard.addMetadata);
});

if (!existsSync(tempFolderPath)) {
    mkdirSync(tempFolderPath);
}

bot.launch();
console.log("Started");

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
