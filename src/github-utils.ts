import {Octokit} from '@octokit/rest'
import * as github from '@actions/github'

export async function getPRAuthor(octokit: Octokit): Promise<string> {
  const prInfo = await octokit.pulls.get({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: github.context.payload.pull_request?.number as number
  })
  return prInfo.data.user?.login as string
}
