/* eslint-disable @typescript-eslint/no-explicit-any */
import { contextBridge, ipcRenderer } from "electron";
const windowAsAny = window as any;
const processAsAny = process as any;
const myAPI = {
    openChildWindow: (type: string) => {
        ipcRenderer.send("open-child-window", type);
    },
    context: () => {
        return ipcRenderer.sendSync("get-my-context");
    }
}
if (processAsAny.contextIsolated) {
    contextBridge.exposeInMainWorld("myAPI", myAPI);
} else {
    windowAsAny.myAPI = myAPI;
}
