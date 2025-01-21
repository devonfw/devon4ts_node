import { GeneratorCallback, Tree } from '@nx/devkit';
import { join } from 'path';
import devon4tsApplicationGenerator from '../application/application';
import { PresetGeneratorSchema } from './schema';

export async function presetGenerator(tree: Tree, options: PresetGeneratorSchema): Promise<GeneratorCallback> {
  const tasks = await devon4tsApplicationGenerator(tree, {
    name: options.name,
    directory: join('apps', options.name),
    linter: 'eslint' as any,
    e2eTestRunner: 'jest',
    strict: true,
    unitTestRunner: 'jest',
  });
  return tasks;
}

export default presetGenerator;
