# Contributing Guidelines

This documentation contains a set of guidelines to help you during the contribution process.

Read our [Code of Conduct](.CODE_OF_CONDUCT.md) to keep our community approachable and respectable.

In this guide you will get an overview of the contribution workflow from opening an issue, creating a PR, reviewing, and merging the PR.

## New contributor guide

See the [README](README.md) to get an overview of the project. Here are some helpful resources to get you comfortable with open source contribution:

- [Finding ways to contribute to open source on GitHub](https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github)
- [Set up Git](https://docs.github.com/en/get-started/quickstart/set-up-git)
- [GitHub flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Collaborating with pull requests](https://docs.github.com/en/github/collaborating-with-pull-requests)

## Submitting Contributions

Below you will find the process and workflow used to review and merge your changes.

### Step 0 : Find an issue

- Take a look at the Existing Issues or go to [Discussions Section](https://github.com/Progyan1997/Operational-Transformation/discussions/30) for creating new Issues!
- Subscribe to the issue and interact with the maintainers regarding contributing to the issue.
- Note : Every change in this project should/must have an associated issue.

![script](./images/Issues.jpeg)

### Step 1 : Fork the Project

- Fork this Repository. This will create a Local Copy of this Repository on your Github Profile.
  Keep a reference to the original project in `upstream` remote.

```bash
git clone https://github.com/<your-username>/Operational-Transformation
cd <repo-name>
git remote add upstream https://github.com/Progyan1997/Operational-Transformation
```

![script1](./images/PullRequest.jpeg)

- If you have already forked the project, update your copy before working.

```bash
git remote update
git checkout <branch-name>
git rebase upstream/<branch-name>
```

### Step 2 : Branch

Create a new branch. Use its name to identify the issue your addressing.

```bash
# It will create a new branch with name Branch_Name and switch to that branch
git checkout -b branch_name
```

### Step 3 : Work on the issue assigned

- Work on the issue(s) assigned to you.
- Add all the files/folders needed.
- After you've made changes or made your contribution to the project add changes to the branch you've just created by:

```bash
# To add all new files to branch Branch_Name
git add .

# To add only a few files to Branch_Name
git add <some files>
```

### Step 4 : Commit

- Every commit message must follow the [Semantic Commit Structure](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716).

```bash
# The following standard should be followed for commit messages
shortlog: commit message

commit body

fixes: #<issue_number>

Signed-Off-By: [Your name] <your email>
```

### Step 5 : Work Remotely

- Now you are ready to your work to the remote repository.
- When your work is ready and complies with the project conventions, upload your changes to your fork:

```bash
# To push your work to your remote repository
git push -u origin Branch_Name
```

### Step 6 : Pull Request

- Go to your repository in browser and click on compare and pull requests.
  Then add a title and description to your pull request that explains your contribution.
- Voila! Your Pull Request has been submitted and will be reviewed by the moderators and merged.🥳
