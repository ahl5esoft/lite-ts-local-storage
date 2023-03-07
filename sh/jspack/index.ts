import { FileFactory, JsPack } from 'lite-ts-fs';

(async () => {
    const jsPack = new JsPack();
    const res = await jsPack.getDirContent('dist');

    const fsFactory = new FileFactory();
    const pkg = await fsFactory.buildFile('package.json').read<{ name: string; }>();

    await fsFactory.buildFile(`${pkg.name}.d.ts`).write(
        res.join('\n').replace(/export\ /g, '')
            .replace(/moment\.unitOfTime\.StartOf/g, 'string')
    );

    const licenseFile = fsFactory.buildFile(`${pkg.name}.min.js.LICENSE.txt`);
    const exists = await licenseFile.exists();
    if (exists)
        await licenseFile.remove();
})();