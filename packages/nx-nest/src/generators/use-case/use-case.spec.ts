import { Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { moduleGenerator } from '@nx/nest';
import { ApplicationGeneratorOptions } from '@nx/nest/src/generators/application/schema';
import applicationGenerator from '../application/application';
import useCaseGenerator from './use-case';

describe('use-case generator', () => {
  let tree: Tree;
  const applicationOptions: ApplicationGeneratorOptions = {
    name: 'test',
    directory: 'apps/test',
    skipFormat: true,
    skipPackageJson: true,
  };

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    await applicationGenerator(tree, applicationOptions);
  });

  it('should generate the use-case in the application layer and add it to app.module', async () => {
    await useCaseGenerator(tree, { name: 'generate-test', path: 'apps/test/src/app' });
    expect(tree.exists('apps/test/src/app/application/generate-test.use-case.ts')).toBeTruthy();
    expect(tree.read('apps/test/src/app/application/generate-test.use-case.ts')?.toString('utf-8')).toMatchSnapshot();
    expect(tree.read('apps/test/src/app/app.module.ts')?.toString('utf-8')).toMatchSnapshot();
  });

  it('should generate the use-case in the application layer of the specified module', async () => {
    await moduleGenerator(tree, {
      module: 'test-module',
      path: 'apps/test/src/app/test-module/test-module',
    });
    await useCaseGenerator(tree, { name: 'generate-test', path: 'apps/test/src/app/test-module' });

    expect(tree.exists('apps/test/src/app/test-module/application/generate-test.use-case.ts')).toBeTruthy();
    expect(tree.exists('apps/test/src/app/application/generate-test.use-case.ts')).toBeFalsy();
    expect(tree.exists('apps/test/src/app/test-module/application/generate-test.use-case.test.ts')).toBeFalsy();
    expect(tree.exists('apps/test/src/test/test-module/application/generate-test.use-case.test.ts')).toBeTruthy();
    expect(
      tree.read('apps/test/src/app/test-module/application/generate-test.use-case.ts')?.toString('utf-8'),
    ).toMatchSnapshot();
    expect(
      tree.read('apps/test/src/test/test-module/application/generate-test.use-case.test.ts')?.toString('utf-8'),
    ).toMatchSnapshot();
    expect(tree.read('apps/test/src/app/test-module/test-module.module.ts')?.toString('utf-8')).toMatchSnapshot();
  });

  it('should generate the specs in the same folder if specSameFolder is true', async () => {
    await moduleGenerator(tree, {
      module: 'test-module',
      path: 'apps/test/src/app/test-module/test-module',
    });
    await useCaseGenerator(tree, {
      name: 'generate-test',
      path: 'apps/test/src/app/test-module',
      specSameFolder: true,
    });
    expect(tree.exists('apps/test/src/app/test-module/application/generate-test.use-case.ts')).toBeTruthy();
    expect(tree.exists('apps/test/src/app/application/generate-test.use-case.ts')).toBeFalsy();
    expect(tree.exists('apps/test/src/app/test-module/application/generate-test.use-case.test.ts')).toBeTruthy();
    expect(tree.exists('apps/test/src/test/test-module/application/generate-test.use-case.test.ts')).toBeFalsy();
    expect(
      tree.read('apps/test/src/app/test-module/application/generate-test.use-case.ts')?.toString('utf-8'),
    ).toMatchSnapshot();
    expect(
      tree.read('apps/test/src/app/test-module/application/generate-test.use-case.test.ts')?.toString('utf-8'),
    ).toMatchSnapshot();
    expect(tree.read('apps/test/src/app/test-module/test-module.module.ts')?.toString('utf-8')).toMatchSnapshot();
  });
});
