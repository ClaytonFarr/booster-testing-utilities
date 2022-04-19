import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, '.booster/*'],
    watchIgnore: [...configDefaults.watchIgnore, '.booster/*'],
    coverage: {
      all: true,
      include: ['src/*'],
      exclude: ['src/index.ts', 'src/constants.ts', 'src/roles.ts', 'src/config', 'src/common/types'],
    },
    globalSetup: ['test/globalSetup.ts'], // will run before/after *all* tests
    // setupFiles: ['test/setup.ts'], // will run before *each* test file
    threads: false,
    // disable parallel tests may help avoid this issue for now: https://github.com/vitest-dev/vitest/issues/317#issuecomment-1058106323
    // disabling threads may also speed up tests at the moment: https://github.com/vitest-dev/vitest/issues/579
  },
})
