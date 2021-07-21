import os from 'os'
import path from 'path'
import fs from 'fs'

import * as core from '@actions/core'
import * as github from '@actions/github'
import {Octokit} from '@octokit/rest'

async function run(): Promise<void> {
  try {
    const activateWithLabel: boolean = core.getBooleanInput(
      'activate-with-label'
    )
    const label: string = core.getInput('label')
    const github_token: string = core.getInput('GITHUB_TOKEN')
    const octokit = new Octokit({auth: github_token})
    const labels: string[] = github.context.payload?.pull_request?.labels
    if (github.context.eventName !== 'pull_request') {
      core.info('Not on pull request, skipping adding ssh keys')
      return
    } else if (activateWithLabel && !labels.includes(label)) {
      core.info(`Label ${label} not set, skipping adding ssh keys`)
      return
    }
    await writeGithubKeys(await getGithubKeys(octokit))
  } catch (error) {
    core.setFailed(error.message)
  }
}

async function getGithubKeys(octokit: Octokit): Promise<string> {
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

async function writeGithubKeys(keys: string): Promise<void> {
  const authorizedKeysPath = path.join(os.homedir(), '.ssh', 'authorized_keys')
  await fs.promises.mkdir(path.dirname(authorizedKeysPath), {recursive: true})
  await fs.promises.writeFile(authorizedKeysPath, keys)
}

run()
