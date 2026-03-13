# Repository Safety Baseline

This repo is set up for a single developer working through pull requests into `main`.

## Baseline rules

- Work on feature branches, not directly on `main`.
- Open a pull request for every change, even when you are the only developer.
- Require the `PR Safety` workflow to pass before merging.
- Do not force-push to `main`.
- Do not delete `main`.
- Keep docs aligned with implementation in the same branch.

## What the PR Safety workflow blocks

- merge conflict markers accidentally committed into files
- tracked `.env` files
- files larger than 5 MB committed directly to the repo
- broken YAML syntax in GitHub workflow files
- a missing `package-lock.json` when `package.json` exists
- dependency install failures in Node-based app branches
- failed `lint` checks when a `lint` script exists
- failed `typecheck` checks when a `typecheck` script exists
- failed test runs when a `test` script exists
- failed production builds when a `build` script exists

## How Node checks behave

- if the branch does not include `package.json`, the workflow only runs repo hygiene checks
- if `package.json` exists, the workflow requires `package-lock.json`, runs `npm ci`, and then runs available scripts with `--if-present`
- this keeps docs-only branches lightweight while making app branches prove they still install and build before merge

## Rollback tags

- a daily workflow creates or refreshes a tag named `rollback-YYYY-MM-DD` from the latest `main`
- cleanup removes rollback tags older than 7 days
- the newest 5 rollback tags are always kept, even if they are older than 7 days

## GitHub settings to enable

- protect `main`
- require a pull request before merging
- require status checks to pass before merging
- select `PR Safety` as a required status check
- require branches to be up to date before merging
- disable force pushes
- disable branch deletion