import { defineConfig } from 'cypress';
import * as fs from 'node:fs';
import * as path from 'node:path';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    downloadsFolder: 'cypress/downloads',
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on('task', {
        clearDownloads(prefix: string) {
          const downloadsFolder = path.resolve(config.projectRoot, config.downloadsFolder);

          if (fs.existsSync(downloadsFolder)) {
            fs.readdirSync(downloadsFolder).forEach((file) => {
              if (file.startsWith(prefix)) {
                fs.rmSync(path.join(downloadsFolder, file), {
                  recursive: true,
                  force: true
                });
              }
            });
          }

          return null;
        }
      });

      return config;
    },
  },
});
