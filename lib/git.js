import cmd from './cmd.js'

const cache = {}

export default function Git(treeish) {
  if (cache[treeish]) {
    return cache[treeish]
  }
  const git = RealGit(treeish)
  cache[treeish] = git
  return git
}

function RealGit(treeish) {
  const cacheHash = {}
  const cacheFiles = {}

  const ret = {
    async getHash(path) {
      if (cacheHash[path]) {
        return cacheHash[path]
      }
      const hash = await cmd(`git rev-list -1 '${treeish}' -- '${path}'`)
      cacheHash[path] = hash
      return hash
    },

    async readFile(path) {
      if (cacheFiles[path]) {
        return cacheFiles[path]
      }
      const file = await cmd(`git show '${treeish}':'${path}'`)
      cacheFiles[path] = file
      return file
    },

    async getRevisions() {
      return await cmd(`git rev-list '${treeish}'`)
    },

    async everything() {
      const files = (await cmd(`git ls-tree -r '${treeish}'`))
        .split('\n')
        .map(line => line.split('\t')[1])

      const detailed = {}

      for (const path of files) {
        detailed[path] = {
          hash: await ret.getHash(path),
          contents: await ret.readFile(path),
        }
      }

      return detailed
    },
  }

  return ret
}