# EPKLib
A TypeScript library that splits a huge file into multiple segments to be uploaded to a hosting platform with filesize restrictions.
## Usage
### BuildLargeEPK.ts
Requires Node.js of version >= 12.
```
usage: node BuildLargeEPK.js <inFile: path> <outDir: path> <maxFileSize: number>
```
where:
- `inFile`: The file to split.
- `outDir`: The output directory for the split files.
- `maxFileSize`: The maximum file size, in bytes, of each segment file.
### EPKLib.ts
Can be ran in the browser. Best used with [jsSHA](https://github.com/Caligatio/jsSHA), a JavaScript implementation of the SHA256 algorithm (as native/built-in browser cryptography isn't present everywhere). Documentation is under construction; please check back later.
