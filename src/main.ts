import * as core from '@actions/core';
import * as github from '@actions/github';
import * as GitHub from './namespaces/GitHub';
import {parseInputs} from './inputs';
import {createRun} from './checks';

const prEvents = [
  'pull_request',
  'pull_request_review',
  'pull_request_review_comment',
  'pull_request_target',
];

const getSHA = (inputSHA: string | undefined): string => {
  if (inputSHA) {
    return inputSHA;
  }

  let sha = github.context.sha;
  if (prEvents.includes(github.context.eventName)) {
    const pull = github.context.payload.pull_request as GitHub.PullRequest;
    if (pull?.head.sha) {
      sha = pull?.head.sha;
    }
  }

  return sha;
};

async function run(): Promise<void> {
  try {
    core.debug(`Parsing inputs`);
    const inputs = parseInputs(core.getInput);

    core.debug(`Setting up OctoKit`);
    const octokit = github.getOctokit(inputs.token);

    const ownership = {
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
    };
    const sha = getSHA(inputs.sha);

    core.debug(`Creating a new Run on ${ownership.owner}/${ownership.repo}@${sha}`);
    const id = await createRun(octokit, github.context, sha, inputs);
    core.setOutput('check_id', id);

    core.debug(`Done`);
  } catch (e) {
    const error = e as Error;
    core.debug(error.toString());
    core.setFailed(error.message);
  }
}

void run();
