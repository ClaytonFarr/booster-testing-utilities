import { configDefaults, defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    threads: false, // disabling parallel tests to avoid this issue for now: https://github.com/vitest-dev/vitest/issues/317#issuecomment-1058106323
    exclude: [...configDefaults.exclude, '.booster/*'],
    watchIgnore: [...configDefaults.watchIgnore, '.booster/*'],
    coverage: {
      all: true,
      include: ['src/*'],
      exclude: ['src/index.ts', 'src/constants.ts', 'src/roles.ts', 'src/config', 'src/common/types'],
    },
    globalSetup: ['test/globalSetup.ts'], // will run before/after *all* tests
    // setupFiles: ['test/setup.ts'], // will run before *each* test file
  },
})
