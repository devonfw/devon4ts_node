import { formatFiles, generateFiles, names, Tree } from '@nx/devkit';
import { NameAndDirectoryOptions } from '@nx/devkit/src/generators/artifact-name-and-directory-utils';
import { dirname, join, relative } from 'path';
import { ASTFileBuilder } from '../../utils/ast-file-builder';
import { normalizeOptions } from '../../utils/normalize-options';
import { calculateTestFolderPath } from '../../utils/tree-utils';
import { UseCaseGeneratorSchema } from './schema';

export async function useCaseGenerator(tree: Tree, options: UseCaseGeneratorSchema): Promise<void> {
  const optionsNormalized = await normalizeOptions(tree, {
    artifactType: 'use-case',
    callingGenerator: '@devon4ts/nx-nest:use-case',
    nameAndDirectoryFormat: 'as-provided',
    suffix: 'use-case',
    layer: 'application',
    ...options,
  });
  generateFiles(tree, join(__dirname, 'files/src'), optionsNormalized.directory, {
    name: optionsNormalized.artifactName,
    className: names(optionsNormalized.artifactName).className,
  });
  const testFolder = !options.specSameFolder
    ? calculateTestFolderPath(tree, optionsNormalized.directory)
    : optionsNormalized.directory;
  generateFiles(tree, join(__dirname, 'files/test'), testFolder, {
    name: optionsNormalized.artifactName,
    className: names(optionsNormalized.artifactName).className,
    relativeImport: relative(testFolder, optionsNormalized.directory),
  });
  addUseCaseToModule(tree, optionsNormalized, optionsNormalized.modulePath);
  if (!options.skipFormat) {
    await formatFiles(tree);
  }
}

function addUseCaseToModule(tree: Tree, options: NameAndDirectoryOptions, modulePath?: string): void {
  if (!modulePath) {
    return;
  }

  const contentBuilder = new ASTFileBuilder(tree.read(modulePath)!.toString());
  const moduleName = contentBuilder.getModuleClassName();
  const useCaseNames = names(options.artifactName);

  if (!moduleName) {
    return;
  }

  contentBuilder
    .addImports(useCaseNames.className, './' + relative(dirname(modulePath), join(options.directory, options.fileName)))
    .addToModuleDecorator(moduleName, useCaseNames.className, 'providers');

  tree.write(modulePath, contentBuilder.build());
}

export default useCaseGenerator;
