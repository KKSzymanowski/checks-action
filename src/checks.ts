import {GitHub} from '@actions/github/lib/utils';
import * as Inputs from './namespaces/Inputs';
import {Conclusion, Status} from './namespaces/Inputs';
import {Context} from '@actions/github/lib/context';

const unpackInputs = (inputs: Inputs.Args): Record<string, unknown> => {
  const minimum = +inputs.minimumCoverage;
  const current = +inputs.currentCoverage;

  let conclusion;
  let message;
  if (current < minimum) {
    conclusion = Conclusion.Failure;
    message = `Coverage too low. Got: ${current}%. Minimum: ${minimum}%.`;
  } else {
    conclusion = Conclusion.Success;
    message = `Coverage OK: ${current}%. Minimum ${minimum}%.`;
  }

  const output = {
    title: message,
    summary: message,
  };

  return {
    status: Status.Completed.toString(),
    output,
    conclusion: conclusion.toString(),
    completed_at: formatDate(),
  };
};

const formatDate = (): string => {
  return new Date().toISOString();
};

export const createRun = async (
  octokit: InstanceType<typeof GitHub>,
  context: Context,
  sha: string,
  inputs: Inputs.Args,
): Promise<number> => {
  const {data} = await octokit.rest.checks.create({
    owner: context.repo.owner,
    repo: context.repo.repo,
    head_sha: sha,
    name: 'Coverage - ' + context.eventName,
    started_at: formatDate(),
    ...unpackInputs(inputs),
  });
  return data.id;
};
