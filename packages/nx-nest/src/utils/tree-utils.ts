import { ProjectConfiguration, Tree, readJson, workspaceRoot } from '@nx/devkit';
import { basename, dirname, join, relative } from 'path';

export function existsConvictConfig(tree: Tree, projectRoot: string): boolean {
  if (projectRoot.endsWith('/src')) {
    return tree.exists(`${projectRoot}/config.ts`);
  }
  return tree.exists(`${projectRoot}/src/config.ts`);
}

export function getNpmScope(tree: Tree): string {
  const { name } = tree.exists('package.json') ? readJson<{ name?: string }>(tree, 'package.json') : { name: null };

  return name?.startsWith('@') ? name.split('/')[0].substring(1) : '';
}

export function updateJestConfig(tree: Tree, projectRoot: string): void {
  const jestconfigPath = join(projectRoot, 'jest.config.ts');
  let jestconfig = tree.read(jestconfigPath)?.toString('utf-8');

  if (!jestconfig || jestconfig.includes('passWithNoTests: true')) {
    return;
  }

  jestconfig = jestconfig.replace(`testEnvironment: 'node',`, `testEnvironment: 'node',\npassWithNoTests: true,`);
  tree.write(jestconfigPath, jestconfig);
}

export function findModuleFile(tree: Tree, modulePath: string): string | undefined {
  let path = modulePath;
  let base = basename(path);
  let idx = 0;

  while (base && base !== '.') {
    const modulePath = findModuleChild(tree, path);
    if (modulePath) {
      return join(path, modulePath);
    }
    path = dirname(path);
    base = basename(path);
    idx++;
    if (idx > 10) {
      break;
    }
  }
  return undefined;
}

function findModuleChild(tree: Tree, path: string): string | undefined {
  return tree.children(path).find(m => m.endsWith('.module.ts'));
}

export function ensureProjectIsAnApplication(config: ProjectConfiguration): void {
  if (config.projectType !== 'application') {
    throw new Error('This generator can be only used in an application.');
  }
}

export function calculateTestFolderPath(tree: Tree, path: string): string {
  let dir = dirname(path);
  let name = basename(dir);

  while (dir !== '.' && tree.exists(dir) && name !== 'src') {
    dir = dirname(dir);
    name = basename(dir);
  }

  const testPath = 'test/' + relative(dir, path).replace(/^(lib|app)\//, '');

  return join(dir, testPath);
}

export function getRelativePathToWorkspaceRoot(): string {
  const cwd = process.env.INIT_CWD?.startsWith(workspaceRoot) ? process.env.INIT_CWD : process.cwd();
  return relative(cwd, workspaceRoot);
}
