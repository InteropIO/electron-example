import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("myAPI", {
    openChildWindow: (type: string) => {
        ipcRenderer.send("open-child-window", type);
    },
    context: () => {
        return ipcRenderer.sendSync("get-my-context");
    }
});
