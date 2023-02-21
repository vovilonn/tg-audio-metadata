import { Context, Scenes } from "telegraf";

export interface IMetadata {
    artist?: string;
    title?: string;
    album?: string;
    genre?: string;
    comment?: string;
}

interface MyWizardSession extends Scenes.WizardSessionData {
    myWizardSessionProp: number;
}

interface MySession extends Scenes.WizardSession<MyWizardSession> {
    metadata: IMetadata;
    coverPath?: string;
    fileId: string;
    ext: string;
}

export interface IContext extends Context {
    session: MySession;
    scene: Scenes.SceneContextScene<IContext, MyWizardSession>;
    wizard: Scenes.WizardContextWizard<IContext>;
}
