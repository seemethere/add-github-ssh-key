import os from 'os'

import {getGithubKeys, writeAuthorizedKeys} from './add-github-ssh-key'
import {getIPs} from './get-ip'

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
    const sshLabel: string = core.getInput('label')
    const github_token: string = core.getInput('GITHUB_TOKEN')
    const removeExistingKeys: boolean = core.getBooleanInput(
      'remove-existing-keys'
    )
    const octokit = new Octokit({auth: github_token})
    if (github.context.eventName !== 'pull_request') {
      core.info('Not on pull request, skipping adding ssh keys')
      return
    } else if (activateWithLabel) {
      const labels = await octokit.issues.listLabelsOnIssue({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: github.context.payload.pull_request?.number as number
      })
      let sshLabelSet = false
      for (const label of labels.data) {
        if (label.name === sshLabel) {
          sshLabelSet = true
        }
      }
      if (!sshLabelSet) {
        core.info(`Label ${sshLabel} not set, skipping adding ssh keys`)
        return
      }
    }
    core.info(
      `Grabbing public ssh keys from https://github.com/${github.context.actor}.keys`
    )
    const authorizedKeysPath = await writeAuthorizedKeys(
      os.homedir(),
      await getGithubKeys(octokit),
      removeExistingKeys
    )
    core.info(`Public keys pulled and installed to ${authorizedKeysPath}`)
    const ips = await getIPs()
    core.warning(`Login using: ssh ${os.userInfo().username}@${ips.ipv4}`)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
