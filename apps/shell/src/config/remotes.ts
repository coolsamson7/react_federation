/**
 * Configuration for MFE remotes
 * Each remote will have its manifest.json loaded to discover routes dynamically
 */
export const MFE_REMOTES = [
  {
    name: "mfe1",
    url: "http://localhost:3001/remoteEntry.js",
  },
  // Add more remotes here as needed
  // {
  //   name: "mfe2",
  //   url: "http://localhost:3002/remoteEntry.js",
  // },
];
