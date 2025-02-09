export const FileReadAsync=async(buf:ArrayBuffer,encoding="SJIS"):Promise<string>=>{
    const reader: FileReader = new FileReader();
    reader.readAsText(new Blob([buf], { type: "text/plain" }), encoding);
    return new Promise((resolve, reject) => {
      reader.addEventListener("load", () => {
        if (typeof reader.result === "string") {
          resolve(reader.result)
        } else {
          console.error("file can't read");
          reject("file can't read")
        }
      });
    });
}