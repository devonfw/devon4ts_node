import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';

describe('Repository Factory', () => {
  const runner: SchematicTestRunner = new SchematicTestRunner('.', path.join(process.cwd(), 'src/collection.json'));

  it('should throw an error if not executed at project root folder', done => {
    runner
      .runSchematic('repository', { name: 'foo' })
      .then(() => {
        fail();
      })
      .catch(error => {
        expect(error).toStrictEqual(new Error('You must run the schematic at devon4ts_node project root folder.'));
        done();
      });
  });

  it('should generate the entity if not exists', async () => {
    let tree = await runner.runSchematic('application', { name: '' }).then();
    tree = await runner.runSchematic('repository', { name: 'module/repo' }, tree).then();

    expect(tree.files).toContain('/src/app/module/model/entities/repo.entity.ts');
  });

  it('should not generate the entity if exists', async () => {
    let tree = await runner.runSchematic('application', { name: '' }).then();

    tree.create('/src/app/module/model/entities/repo.entity.ts', Buffer.from('this is a fake entity'));
    tree = await runner.runSchematic('repository', { name: 'module/repo' }, tree).then();

    expect(tree.files).toContain('/src/app/module/model/entities/repo.entity.ts');
    expect(tree.readContent('/src/app/module/model/entities/repo.entity.ts')).toStrictEqual('this is a fake entity');
  });

  it('should generate the repository file', async () => {
    let tree = await runner.runSchematic('application', { name: '' }).then();
    tree = await runner.runSchematic('repository', { name: 'module/repo' }, tree).then();

    expect(tree.files).toContain('/src/app/module/repositories/repo.repository.ts');
  });

  it('should generate the repository file at root level if no module is provided', async () => {
    let tree = await runner.runSchematic('application', { name: '' }).then();
    tree = await runner.runSchematic('repository', { name: 'repo' }, tree).then();

    expect(tree.files).toContain('/src/app/repositories/repo.repository.ts');
  });

  it('should add the repository to the module provided', async () => {
    let tree = await runner.runSchematic('application', { name: '' }).then();
    tree = await runner.runSchematic('module', { name: 'module' }, tree).then();
    tree = await runner.runSchematic('repository', { name: 'module/repo' }, tree).then();

    const moduleContent = tree.readContent('/src/app/module/module.module.ts');
    expect(moduleContent).toContain(`import { RepoRepository } from './repositories/repo.repository';`);
    expect(moduleContent).toMatch(/TypeOrmModule\.forFeature\(\[(.|\n)*RepoRepository(.|\n)*\]\)/g);
  });

  it('should add the repository to AppModule if no other module is provided', async () => {
    let tree = await runner.runSchematic('application', { name: '' }).then();
    tree = await runner.runSchematic('repository', { name: 'repo' }, tree).then();

    const moduleContent = tree.readContent('/src/app/app.module.ts');
    expect(moduleContent).toContain(`import { RepoRepository } from './repositories/repo.repository';`);
    expect(moduleContent).toMatch(/TypeOrmModule\.forFeature\(\[(.|\n)*RepoRepository(.|\n)*\]\)/g);
  });
});
