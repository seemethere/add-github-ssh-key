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
  keys: string
): Promise<void> {
  const authorizedKeysPath = path.resolve(
    path.join(homedir, '.ssh', 'authorized_keys')
  )
  fs.mkdirSync(path.dirname(authorizedKeysPath), {recursive: true})
  fs.writeFileSync(authorizedKeysPath, keys)
  fs.chmodSync(path.dirname(authorizedKeysPath), 0o700)
  fs.chmodSync(authorizedKeysPath, 0o644)
}
