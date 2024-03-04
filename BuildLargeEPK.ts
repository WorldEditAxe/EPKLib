const crypto = require("crypto");
const path = require("path");
const fs = require("fs/promises");
const fsSync = require("fs");

type LEPKDirectoryFileRaw = {
  filename: string;
  segments: string[];
  hash: string;
};

type LEPKCompileOutput = {
  directoryFile: string;
  files: LEPKSegmentFileRaw[];
};

type LEPKSegmentFileRaw = {
  filename: string;
  data: ArrayBuffer;
};

async function compileLargeEPK(
  filename: string,
  file: ArrayBuffer,
  segmentMaxSize: number,
  sha256Hash: string
): Promise<LEPKCompileOutput> {
  const output: Partial<LEPKCompileOutput> = {
      directoryFile: undefined,
      files: [],
    },
    rawMeta: Partial<LEPKDirectoryFileRaw> = {
      filename,
      segments: [],
      hash: sha256Hash
    };

  const view = new Uint8Array(file),
    chunkCount = Math.ceil(file.byteLength / segmentMaxSize);
  for (let chunkIndex = 0; chunkIndex < chunkCount; chunkIndex++) {
    const begin = chunkIndex * segmentMaxSize,
      end = Math.min(begin + segmentMaxSize, view.byteLength),
      chunk = view.slice(begin, end),
      outFileName = `${filename.replace(
        /[^\x00-\x7F]/g,
        ""
      )}.${chunkIndex}.seg`;
    output.files!.push({
      filename: outFileName,
      data: chunk,
    });
    rawMeta.segments!.push(outFileName);
  }

  output.directoryFile = JSON.stringify(rawMeta);
  return output as LEPKCompileOutput;
}

type Stringifiable = {
  toString(): string;
};

(async () => {
  // logging
  const _log = (msg: Stringifiable, logType: string, logMethod = "log") =>
      // @ts-expect-error
      console[logMethod](`[${logType}]: ${msg.toString()}`),
    info = (msg: Stringifiable) => _log(msg, "INFO"),
    warn = (msg: Stringifiable) => _log(msg, "WARN", "warn"),
    error = (msg: Stringifiable) => _log(msg, "ERROR", "error");

  const inFile = process.argv[2],
    outDir = process.argv[3],
    maxFileSize = Number(process.argv[4] || "nan");
  if (!inFile || !outDir || isNaN(maxFileSize) || maxFileSize <= 0) {
    error(
      "usage: BuildLargeEPK.js <inFile: path> <outDir: path> <maxFileSize: number>"
    );
    process.exit(1);
  }

  info(
    `Converting ${path.basename(
      inFile
    )} (${inFile}) to LargeEPK file -> ${outDir} w/ max file size of ${maxFileSize} bytes...`
  );
  const filename = path.basename(inFile),
    file = await fs.readFile(path.resolve(inFile));

  const output = await compileLargeEPK(filename, file, maxFileSize, crypto.createHash('sha256').update(file).digest('hex'));
  info(
    `Successfully compiled LargeEPK: split into ${output.files.length} total segments.`
  );
  info(`Saving to ${path.resolve(outDir)}...`);
  try {
    await fs.mkdir(outDir);
  } catch (err) {
    const code = (err as any).code;
    if (code == "EEXIST") {
      warn(
        `Output folder ${outDir} exits! Purging contents before continuing...`
      );
      fsSync.rmSync(outDir, {
        force: true,
        recursive: true,
      });
      await fs.mkdir(outDir);
    } else {
      error(`Could not make output directory folder!\n${(err as Error).stack}`);
      process.exit(1);
    }
  }

  const outputFileMetaDir = path.resolve(outDir, "meta.json");
  info(`Saving meta.json ...`);
  await fs.writeFile(outputFileMetaDir, output.directoryFile);

  for (const file of output.files) {
    try {
      const outputDir = path.resolve(outDir, file.filename);
      info(`Saving ${file.filename} ...`);
      await fs.writeFile(outputDir, file.data);
    } catch (err) {
      error(`Could not save file ${file.filename}!\n${(err as Error).stack}`);
      process.exit(1);
    }
  }

  info("Finished. You may have to tweak meta.json segment paths.");
})();
