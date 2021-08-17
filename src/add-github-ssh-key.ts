import path from 'path'
import fs from 'fs'

import * as core from '@actions/core'
import * as github from '@actions/github'
import {Octokit} from '@octokit/rest'
import {install} from 'source-map-support'

install()

export async function getGithubKeys(octokit: Octokit): Promise<string> {
  const {actor} = github.context
  const keys = await octokit.users.listPublicKeysForUser({
    username: actor
  })
  if (keys.data.length === 0) {
    core.warning('No SSH keys found for user, ssh keys will not be added')
    return ''
  }
  return keys.data.map(e => e.key).join('\n')
}

export async function writeAuthorizedKeys(
  homedir: string,
  keys: string,
  removeExistingKeys: boolean
): Promise<string> {
  const authorizedKeysPath = path.resolve(
    path.join(homedir, '.ssh', 'authorized_keys')
  )
  if (fs.existsSync(authorizedKeysPath) && removeExistingKeys) {
    core.info(
      '~/.ssh/authorized_keys file found on node, removing ~/.ssh and starting fresh'
    )
    fs.rmdirSync(path.dirname(authorizedKeysPath), {recursive: true})
  }
  fs.mkdirSync(path.dirname(authorizedKeysPath), {recursive: true, mode: 0o700})
  fs.writeFileSync(authorizedKeysPath, keys, {mode: 0o400, flag: 'w'})
  return authorizedKeysPath
}
