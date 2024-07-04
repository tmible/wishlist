import { execSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const nodePath = execSync('which node', { encoding: 'utf8' }).trim();
const cwd = execSync('pnpm prefix', { encoding: 'utf8' }).trim();
const user = execSync('whoami', { encoding: 'utf8' }).trim();
const envs = await readFile('.env', 'utf8').then((vars) => {
  return vars
    .trim()
    .split('\n')
    .map((variable) => {
      const splitted = variable.split('=');
      return [
        splitted[0],
        splitted[1].replace(/^"/, '').replace(/"$/, ''),
      ].join('=');
    });
});

await writeFile(
  `${process.env.SERVICE_NAME}.service`,
  `
    [Unit]
    Description=${process.env.SERVICE_DESCRIPTION}

    [Service]
    ExecStart=${nodePath} ${resolve(cwd, process.env.PATH_TO_EXECUTABLE)}
    Restart=always
    User=${user}
    Group=${user}
    Environment=PATH=/usr/bin:/usr/local/bin
    Environment=NODE_ENV=production
    ${envs.map((env) => `Environment=${env}`).join('\n')}
    WorkingDirectory=${cwd}

    [Install]
    WantedBy=multi-user.target
  `.trim().replaceAll(/^ +(?=[^ ])/mg, '').replace(/$/, '\n'),
);
