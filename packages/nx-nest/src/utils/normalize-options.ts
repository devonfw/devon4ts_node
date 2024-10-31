import { names, Tree } from '@nx/devkit';
import {
  ArtifactGenerationOptions,
  determineArtifactNameAndDirectoryOptions,
  NameAndDirectoryOptions,
} from '@nx/devkit/src/generators/artifact-name-and-directory-utils';
import { basename, dirname, join } from 'path';
import { findModuleFile } from './tree-utils';

export async function normalizeOptions(
  tree: Tree,
  options: ArtifactGenerationOptions & { skipModule?: boolean; layer?: 'application' | 'domain' | 'infrastructure' },
): Promise<NameAndDirectoryOptions & { modulePath?: string }> {
  const optionsNormalized = await determineArtifactNameAndDirectoryOptions(tree, {
    ...options,
    name: names(options.name).fileName,
    directory: options.directory && names(options.directory).fileName,
  });

  if (options.skipModule) {
    return optionsNormalized;
  }

  const modulePath = findModuleFile(tree, optionsNormalized.directory);
  if (!modulePath || !options.layer) {
    throw new Error('Expected module');
  }

  const directory = calculateLayerFolder(optionsNormalized.directory, dirname(modulePath), options.layer);

  return {
    ...optionsNormalized,
    filePath: join(directory, basename(optionsNormalized.filePath)),
    directory: directory,
    modulePath,
  };
}

function calculateLayerFolder(path: string, moduleFolder: string, layer: string): string {
  let currentPath = path;

  while (currentPath !== moduleFolder) {
    if (basename(currentPath) === layer) {
      return path;
    }

    currentPath = dirname(currentPath);
  }

  return join(moduleFolder, layer, removeLayerFromSubpath(path.substring(moduleFolder.length)));
}

function removeLayerFromSubpath(path: string): string {
  return ['/application', '/domain', '/infrastructure'].reduce((acc, l) => {
    if (acc.startsWith(l)) {
      return acc.substring(l.length);
    }

    return acc;
  }, path);
}
