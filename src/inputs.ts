import {InputOptions} from '@actions/core';
import * as Inputs from './namespaces/Inputs';

type GetInput = (name: string, options?: InputOptions | undefined) => string;

export const parseInputs = (getInput: GetInput): Inputs.Args => {
  return {
    sha: getInput('sha'),
    token: getInput('token', {required: true}),

    minimumCoverage: getInput('minimum-coverage', {required: true}),
    currentCoverage: getInput('current-coverage', {required: true}),
  };
};
