import os from 'os'

import {getGithubKeys, writeAuthorizedKeys, getIP} from './add-github-ssh-key'

import * as core from '@actions/core'
import * as github from '@actions/github'
import {Octokit} from '@octokit/rest'
import {install} from 'source-map-support'

install()

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
    await writeAuthorizedKeys(os.homedir(), await getGithubKeys(octokit))
    core.info(`Login with ${os.userInfo().username}@${getIP()}`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
