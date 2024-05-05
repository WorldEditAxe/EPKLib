# EPKLib
A TypeScript library that splits a huge file into multiple segments to be uploaded to a hosting platform with filesize restrictions.
## Usage
### BuildLargeEPK.ts
Requires Node.js of version >= 12. Optionally requires TypeScript installed on your computer, but you can use the [online compiler](https://typescriptlang.org/play) instead if you really don't want to install TypeScript for whatever reason
```
usage: node BuildLargeEPK.js <inFile: path> <outDir: path> <maxFileSize: number>
```
where:
- `inFile`: The file to split.
- `outDir`: The output directory for the split files.
- `maxFileSize`: The maximum file size, in bytes, of each segment file.
### EPKLib.ts
Can be ran in the browser. Best used with [jsSHA](https://github.com/Caligatio/jsSHA), a JavaScript implementation of the SHA256 algorithm (as native/built-in browser cryptography isn't present everywhere). Documentation is under construction; please check back later.
