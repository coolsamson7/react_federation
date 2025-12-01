/**
 * Initialize Module Federation sharing
 */
export async function initializeRemote(remoteName: string) {
  try {
    // Wait for Webpack sharing to be ready
    //@ts-ignore
    await __webpack_init_sharing__("default");
    console.log(`Remote ${remoteName} sharing initialized`);
  } catch (error) {
    console.error(`Error initializing remote ${remoteName}:`, error);
  }
}

/**
 * Dynamically load a remote component
 */
export async function loadRemoteModule(
  remoteName: string,
  modulePath: string
) {
  try {
    // Ensure modulePath starts with "./"
    const normalizedPath = modulePath.startsWith("./") ? modulePath : `./${modulePath}`;

    // Get the remote container
    //@ts-ignore
    const container = window[remoteName];
    if (!container) {
      throw new Error(`Remote container ${remoteName} not found on window`);
    }

    // Initialize the remote
    //@ts-ignore
    await container.init(__webpack_share_scopes__.default);

    // Get the module factory
    const factory = await container.get(normalizedPath);
    return factory();
  } catch (error) {
    console.error(
      `Error loading module ${modulePath} from ${remoteName}:`,
      error
    );
    throw error;
  }
}
