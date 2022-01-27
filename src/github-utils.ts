import * as core from '@actions/core'
import {Octokit} from '@octokit/rest'
import * as github from '@actions/github'

export async function getPRAuthor(
  octokit: Octokit,
  prNumber: number
): Promise<string> {
  const prInfo = await octokit.pulls.get({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: prNumber
  })
  return prInfo.data.user?.login as string
}

export function extractCiFlowPrNumber(reference: string): number {
  if (reference) {
    core.info('ciflow reference detected, attempting to extract PR number')
    const potentialPrNumber = reference.split('/').pop()
    if (potentialPrNumber === undefined) {
      core.error(
        `Could not derive PR number from ciflow reference ${reference}, is everything alright?`
      )
    }
    return Number(potentialPrNumber)
  }
  return NaN
}
