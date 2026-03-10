# Repository Safety Baseline

This repo is set up for a single developer working through pull requests into `main`.

## Baseline rules

- Work on feature branches, not directly on `main`.
- Open a pull request for every change, even when you are the only developer.
- Require the `PR Safety` workflow to pass before merging.
- Do not force-push to `main`.
- Do not delete `main`.

## What the PR Safety workflow blocks

- Merge conflict markers accidentally committed into files.
- Tracked `.env` files.
- Files larger than 5 MB committed directly to the repo.
- Broken YAML syntax in GitHub workflow files.

## Rollback tags

- A daily workflow creates or refreshes a tag named `rollback-YYYY-MM-DD` from the latest `main`.
- Cleanup removes rollback tags older than 7 days.
- The newest 5 rollback tags are always kept, even if they are older than 7 days.

## GitHub settings to enable

- Protect `main`.
- Require a pull request before merging.
- Require status checks to pass before merging.
- Select `PR Safety` as a required status check.
- Disable force pushes.
- Disable branch deletion.
