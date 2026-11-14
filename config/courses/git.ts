import type { CourseData } from "./types";
import { codeBlock, externalLink, BOX_STYLE } from "./format";

export const gitCourse: CourseData = {
  title: "Git & GitHub — Version Control from Scratch",
  description:
    "Master version control — 10 hands-on lessons from your first commit to a collaborative pull request. Track changes, branch, merge, resolve conflicts, and ship code on GitHub. Practice in your own terminal.",
  icon: "",
  difficulty: "Beginner",
  category: "Tools",
  order_index: 6,
  chapters: [
    {
      title: "1. What Is Version Control?",
      content: {
        type: "browser",
        instructions: `
<h2>Why every developer needs Git</h2>
<p><strong>Version control</strong> is a system that records changes to files over time so you can recall specific versions later. <strong>Git</strong> is the most widely used version control system — it's distributed, fast, and free.</p>

<h3>The problem Git solves</h3>
<ul>
  <li><code>final_v2_FINAL_fixed.docx</code> — no more filename chaos</li>
  <li>"Who broke the build on Tuesday?" — every change is attributed to an author and timestamp</li>
  <li>"Can we go back to last week's version?" — yes, instantly, without backups</li>
  <li>Multiple people editing the same file — Git merges their changes intelligently</li>
</ul>

<h3>Git vs GitHub</h3>
<ul>
  <li><strong>Git</strong> — the tool on your machine that tracks changes (works offline)</li>
  <li><strong>GitHub</strong> — a website that hosts Git repositories and adds collaboration features (pull requests, issues, actions)</li>
  <li>You can use Git without GitHub, but not GitHub without Git</li>
</ul>

<h3>How Git thinks</h3>
<p>Git stores <strong>snapshots</strong>, not diffs. Each commit is a complete picture of your project at that moment. Unchanged files are stored as pointers to the previous version — so commits are fast and cheap.</p>

<h3>The three states</h3>
${codeBlock(`Working Directory  →  Staging Area  →  Repository
   (modified)            (staged)         (committed)

  git add          git commit`)}

<h3>Learn more</h3>
<p>${externalLink("Pro Git — Getting Started", "https://git-scm.com/book/en/v2/Getting-Started-About-Version-Control")} · ${externalLink("GitHub Docs — Hello World", "https://docs.github.com/en/get-started/start-your-journey/hello-world")}</p>

<h3>Your task</h3>
<p>Open a terminal and run <code>git --version</code>. If it's not installed, follow the install link above. Then run <code>git config --list</code> to see your current (possibly empty) configuration.</p>
`,
        initialCode: `# Git & GitHub — Chapter 1 scratchpad
# Practice these in your own terminal:

git --version
git config --list

# Check your identity (will be empty until Ch 2):
git config user.name
git config user.email`,
        solution: `# Expected output (versions will vary):
# git version 2.43.0

# After Ch 2, config --list shows:
# user.name=Your Name
# user.email=you@example.com
# init.defaultbranch=main`,
      },
      points_reward: 10,
    },
    {
      title: "2. Install & Configure Git",
      content: {
        type: "browser",
        instructions: `
<h2>Tell Git who you are</h2>
<p>Before your first commit, configure your identity. Git stamps every commit with this info — it's how teammates (and future you) know who changed what.</p>

${codeBlock(`# Set your name and email (use your real ones)
git config --global user.name "Ada Lovelace"
git config --global user.email "ada@example.com"

# Set default branch name to "main"
git config --global init.defaultBranch main

# Pick an editor (optional)
git config --global core.editor "code --wait"   # VS Code
git config --global core.editor "nano"          # nano`)}

<h3>Levels of config</h3>
<ul>
  <li><code>--system</code> — all users on the machine (rare)</li>
  <li><code>--global</code> — you, across all repos (most common)</li>
  <li><code>--local</code> — this repo only (overrides global)</li>
</ul>
<p>Later settings override earlier ones: local beats global beats system.</p>

<h3>Viewing config</h3>
${codeBlock(`git config --list              # all settings
git config user.name           # one setting
git config --global --edit     # open config file in editor`)}

<h3>Line endings (Windows)</h3>
${codeBlock(`# Windows: convert CRLF -> LF on commit
git config --global core.autocrlf true

# macOS/Linux: leave as-is
git config --global core.autocrlf input`)}

<h3>Learn more</h3>
<p>${externalLink("Pro Git — First-Time Git Setup", "https://git-scm.com/book/en/v2/Getting-Started-First-Time-Git-Setup")} · ${externalLink("git config docs", "https://git-scm.com/docs/git-config")}</p>

<h3>Your task</h3>
<p>Set your name, email, and default branch. Then run <code>git config --list</code> and verify all three appear. Check which file they're stored in: <code>git config --global --list --show-origin</code>.</p>
`,
        initialCode: `# Configure Git (run in your terminal):

git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main

# Verify:
git config --list
git config --global --list --show-origin`,
        solution: `# Expected: your settings printed, with file path like:
# file:/home/you/.gitconfig    user.name=Your Name
# file:/home/you/.gitconfig    user.email=you@example.com
# file:/home/you/.gitconfig    init.defaultbranch=main`,
      },
      points_reward: 10,
    },
    {
      title: "3. Your First Repository",
      content: {
        type: "browser",
        instructions: `
<h2>Track a project from scratch</h2>
<p>A <strong>repository</strong> (repo) is a directory Git tracks. Initialize one with <code>git init</code>, then the cycle is: edit → stage → commit.</p>

${codeBlock(`# Create a project folder and enter it
mkdir my-project && cd my-project

# Initialize Git
git init
# -> Initialized empty Git repository in .../my-project/.git/

# Check status
git status`)}

<h3>The commit cycle</h3>
${codeBlock(`# 1. Create a file
echo "Hello, Git!" > README.md

# 2. Stage it (add to staging area)
git add README.md

# 3. Commit (snapshot)
git commit -m "Add README"

# 4. Verify
git status          # "nothing to commit, working tree clean"
git log             # see your commit`)}

<h3>Staging: selective commits</h3>
${codeBlock(`git add file.txt          # one file
git add *.js              # glob
git add .                 # everything in current dir
git add -p                # interactive: stage hunks one by one`)}

<h3>Good commit messages</h3>
<ul>
  <li>Imperative mood: "Add login button" not "Added login button"</li>
  <li>First line ≤ 50 chars, then blank line, then body if needed</li>
  <li>Explain <em>why</em>, not just <em>what</em></li>
</ul>

<h3>Learn more</h3>
<p>${externalLink("Pro Git — Getting a Git Repository", "https://git-scm.com/book/en/v2/Git-Basics-Getting-a-Git-Repository")} · ${externalLink("git add docs", "https://git-scm.com/docs/git-add")}</p>

<h3>Your task</h3>
<p>Create a new repo, add a <code>README.md</code> and a <code>.gitignore</code> (ignore <code>node_modules/</code> and <code>.env</code>), make two separate commits. Verify with <code>git log --oneline</code>.</p>
`,
        initialCode: `# Your first repo (run in your terminal):

mkdir my-project && cd my-project
git init

echo "Hello, Git!" > README.md
echo "node_modules/" > .gitignore
echo ".env" >> .gitignore

git add README.md
git commit -m "Add README"

git add .gitignore
git commit -m "Add .gitignore"

git log --oneline
git status`,
        solution: `# Expected:
# [main abc1234] Add .gitignore
# [main def5678] Add README
# (hashes will differ)

# git log --oneline shows 2 commits
# git status: "nothing to commit, working tree clean"`,
      },
      points_reward: 10,
    },
    {
      title: "4. Viewing History",
      content: {
        type: "browser",
        instructions: `
<h2>See what changed and when</h2>
<p>Git's history is its superpower. Learn to read it efficiently.</p>

<h3><code>git log</code></h3>
${codeBlock(`git log                    # full history
git log --oneline          # one line per commit
git log --oneline --graph  # ASCII branch graph
git log -p                 # show diffs (patches)
git log --stat             # file change summary
git log -5                 # last 5 commits
git log --author="Ada"     # filter by author
git log --since="2 weeks ago"`)}

<h3><code>git diff</code></h3>
${codeBlock(`git diff                   # working dir vs staging area
git diff --staged          # staging area vs last commit
git diff HEAD              # working dir vs last commit
git diff abc123 def456     # between two commits
git diff main..feature     # between branches`)}

<h3><code>git show</code></h3>
${codeBlock(`git show                   # last commit + diff
git show abc123            # specific commit
git show abc123:file.txt    # file content at that commit`)}

<h3>Blame</h3>
${codeBlock(`git blame file.txt         # who changed each line and when`)}

<h3>Learn more</h3>
<p>${externalLink("Pro Git — Viewing the Commit History", "https://git-scm.com/book/en/v2/Git-Basics-Viewing-the-Commit-History")} · ${externalLink("git log docs", "https://git-scm.com/docs/git-log")}</p>

<h3>Your task</h3>
<p>In your repo, make 3 more commits with different messages. Then use <code>git log --oneline --graph</code>, <code>git log -p -1</code>, and <code>git blame README.md</code> to explore. Try <code>git diff HEAD~2</code> to see changes since two commits ago.</p>
`,
        initialCode: `# Explore history (run in your repo):

git log --oneline --graph --all
git log --stat -3
git log -p -1

# Compare:
git diff HEAD~1
git diff HEAD~2

# Blame:
git blame README.md`,
        solution: `# No single expected output — verify you can:
# - read the commit graph
# - see diffs per commit
# - use HEAD~n to reference older commits
# - use git blame to find who changed a line`,
      },
      points_reward: 10,
    },
    {
      title: "5. Branching",
      content: {
        type: "browser",
        instructions: `
<h2>Work in parallel without breaking main</h2>
<p>A <strong>branch</strong> is a movable pointer to a commit. <code>main</code> is just a branch. Creating a branch is instant and cheap — use branches for every feature or fix.</p>

${codeBlock(`# Create and switch to a new branch
git switch -c feature/login     # modern (Git 2.23+)
git checkout -b feature/login  # older syntax

# List branches
git branch                     # local
git branch -a                  # all (incl. remote)

# Switch branches
git switch main
git switch feature/login`)}

<h3>Making changes on a branch</h3>
${codeBlock(`git switch -c feature/login
echo "login code" > login.js
git add login.js
git commit -m "Add login feature"

# Switch back — login.js disappears (it's on the other branch)
git switch main
ls   # no login.js`)}

<h3>Merging</h3>
${codeBlock(`# Merge a branch into current branch
git switch main
git merge feature/login
# -> Fast-forward (if main hasn't moved) or merge commit`)}

<h3>Fast-forward vs merge commit</h3>
<ul>
  <li><strong>Fast-forward</strong> — main just moves forward; no merge commit</li>
  <li><strong>Merge commit</strong> — main has new commits; Git creates a merge commit combining both</li>
  <li>Use <code>git merge --no-ff</code> to always create a merge commit (clearer history)</li>
</ul>

<h3>Deleting branches</h3>
${codeBlock(`git branch -d feature/login    # safe: only if merged
git branch -D feature/login    # force delete`)}

<h3>Learn more</h3>
<p>${externalLink("Pro Git — Branches in a Nutshell", "https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell")} · ${externalLink("Learn Git Branching (interactive)", "https://learngitbranching.js.org/")}</p>

<h3>Your task</h3>
<p>Create a branch <code>feature/about-page</code>, add an <code>about.html</code>, commit, switch to <code>main</code>, merge it, then delete the branch. Verify with <code>git log --oneline --graph --all</code> before and after merge.</p>
`,
        initialCode: `# Branching practice (run in your repo):

git switch -c feature/about-page
echo "<h1>About</h1>" > about.html
git add about.html
git commit -m "Add about page"

git switch main
git merge feature/about-page

git branch -d feature/about-page
git log --oneline --graph --all`,
        solution: `# Expected:
# - about.html exists on main after merge
# - feature/about-page branch deleted
# - git log shows the merge (fast-forward or merge commit)
# - git branch shows only main`,
      },
      points_reward: 10,
    },
    {
      title: "6. Resolving Conflicts",
      content: {
        type: "browser",
        instructions: `
<h2>When Git can't auto-merge</h2>
<p>A <strong>conflict</strong> happens when two branches changed the same lines of the same file. Git stops and asks you to decide.</p>

<h3>Triggering a conflict</h3>
${codeBlock(`# On main: edit README.md line 1 -> "Hello from main"
# On feature: edit README.md line 1 -> "Hello from feature"
# Merge -> conflict`)}

<h3>What a conflict looks like</h3>
${codeBlock(`<<<<<<< HEAD
Hello from main
=======
Hello from feature
>>>>>>> feature/x`)}

<h3>Resolving</h3>
<ol>
  <li>Open the file, decide the final content, remove the <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code>, <code>=======</code>, <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> markers</li>
  <li><code>git add file.txt</code> — marks it resolved</li>
  <li><code>git commit</code> — completes the merge (or <code>git merge --continue</code>)</li>
</ol>

<h3>Aborting</h3>
${codeBlock(`git merge --abort    # bail out, return to pre-merge state`)}

<h3>Tools that help</h3>
<ul>
  <li><code>git mergetool</code> — launches a visual merge tool (VS Code, Meld, etc.)</li>
  <li>VS Code's built-in 3-way merge editor</li>
  <li><code>git diff --cc</code> — combined diff during conflict</li>
</ul>

<h3>Learn more</h3>
<p>${externalLink("Pro Git — Basic Merge Conflicts", "https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging#_basic_merge_conflicts")} · ${externalLink("git mergetool", "https://git-scm.com/docs/git-mergetool")}</p>

<h3>Your task</h3>
<p>Create a conflict on purpose: branch off main, edit the same line in README.md on both branches, merge, resolve it, and commit. Verify <code>git status</code> is clean and the final file content is what you chose.</p>
`,
        initialCode: `# Create a conflict (run in your repo):

git switch -c feature/conflict
echo "Hello from feature" > README.md
git add README.md
git commit -m "Change greeting (feature)"

git switch main
echo "Hello from main" > README.md
git add README.md
git commit -m "Change greeting (main)"

# This will conflict:
git merge feature/conflict`,
        solution: `# After merge conflict:
# 1. Open README.md, remove markers, keep desired line
# 2. git add README.md
# 3. git commit  (or git merge --continue)
# 4. git branch -d feature/conflict

# Verify:
git status        # clean
git log --oneline --graph`,
      },
      points_reward: 10,
    },
    {
      title: "7. Remote Repositories",
      content: {
        type: "browser",
        instructions: `
<h2>Sync with a remote (GitHub)</h2>
<p>A <strong>remote</strong> is a version of your repo hosted elsewhere (GitHub, GitLab, etc.). The default name is <code>origin</code>.</p>

${codeBlock(`# Clone an existing repo
git clone https://github.com/user/repo.git

# Add a remote to an existing local repo
git remote add origin https://github.com/user/repo.git

# View remotes
git remote -v`)}

<h3>Push / Pull / Fetch</h3>
${codeBlock(`git push origin main          # upload commits
git push -u origin main       # set upstream (first push)
git pull                      # fetch + merge
git fetch                     # download only, no merge
git pull --rebase             # fetch + rebase (cleaner history)`)}

<h3>Tracking branches</h3>
${codeBlock(`git branch -vv                # show tracking info
git push origin --delete feature/x   # delete remote branch`)}

<h3>First push flow</h3>
<ol>
  <li>Create empty repo on GitHub (no README)</li>
  <li><code>git remote add origin &lt;url&gt;</code></li>
  <li><code>git push -u origin main</code></li>
  <li>Refresh GitHub — your code is there</li>
</ol>

<h3>Learn more</h3>
<p>${externalLink("Pro Git — Working with Remotes", "https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes")} · ${externalLink("GitHub — Create a repo", "https://docs.github.com/en/get-started/quickstart/create-a-repo")}</p>

<h3>Your task</h3>
<p>Create an empty repo on GitHub, add it as <code>origin</code>, push your <code>main</code> branch with <code>-u</code>. Then make a local commit and <code>git push</code> again. Verify on GitHub's web UI.</p>
`,
        initialCode: `# Remote practice (run in your repo):

# 1. Create empty repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git remote -v

git push -u origin main

# Later:
git push
git pull`,
        solution: `# Expected:
# origin  https://github.com/YOUR_USER/YOUR_REPO.git (fetch)
# origin  https://github.com/YOUR_USER/YOUR_REPO.git (push)

# After push: branch 'main' set up to track 'origin/main'
# GitHub web UI shows your commits`,
      },
      points_reward: 10,
    },
    {
      title: "8. GitHub Essentials",
      content: {
        type: "browser",
        instructions: `
<h2>Collaboration on GitHub</h2>
<p>GitHub adds collaboration on top of Git. The core workflow: fork → clone → branch → commit → push → pull request → review → merge.</p>

<h3>Pull Requests (PRs)</h3>
<ul>
  <li>A PR proposes merging your branch into another (usually <code>main</code>)</li>
  <li>Teammates review, comment, request changes</li>
  <li>CI runs (tests, lint) before merge</li>
  <li>Merge via "Merge commit", "Squash", or "Rebase"</li>
</ul>

<h3>Forks</h3>
<p>A <strong>fork</strong> is your own copy of someone else's repo. You push to your fork, then open a PR to the original. Used for open-source contributions.</p>

<h3>Issues</h3>
<ul>
  <li>Track bugs, features, tasks</li>
  <li>Reference in commits: <code>Fixes #42</code> auto-closes the issue on merge</li>
  <li>Labels, milestones, assignees for organization</li>
</ul>

<h3>GitHub Actions (CI/CD)</h3>
<p>Automate tests/builds/deployments on push or PR. Defined in <code>.github/workflows/*.yml</code>. Free for public repos and 2000 min/month for private.</p>

<h3>README & badges</h3>
<p>A good README: what it is, how to install, how to use, how to contribute, license. Badges (build status, version) add polish.</p>

<h3>Learn more</h3>
<p>${externalLink("GitHub Docs — Pull Requests", "https://docs.github.com/en/pull-requests")} · ${externalLink("GitHub Actions quickstart", "https://docs.github.com/en/actions/quickstart")} · ${externalLink("GitHub Skills (interactive courses)", "https://skills.github.com/")}</p>

<h3>Your task</h3>
<p>Create a branch, make a change, push it, and open a Pull Request on GitHub. Add a description, request a review (or self-merge). Then merge and delete the branch. Try referencing an issue with <code>Fixes #1</code> in the PR description.</p>
`,
        initialCode: `# GitHub workflow (run in your repo):

git switch -c feature/update-readme
echo "## About" >> README.md
git add README.md
git commit -m "Add About section"
git push -u origin feature/update-readme

# Then open a PR on GitHub's web UI.
# After merge:
git switch main
git pull
git branch -d feature/update-readme`,
        solution: `# No single expected output — verify:
# - PR opened and merged on GitHub
# - main updated locally after pull
# - feature branch deleted both locally and remotely`,
      },
      points_reward: 10,
    },
    {
      title: "9. Undoing Changes",
      content: {
        type: "browser",
        instructions: `
<h2>Fix mistakes safely</h2>
<p>Git gives you several ways to undo — pick the right one for the situation.</p>

<h3>Discard working-dir changes</h3>
${codeBlock(`git restore file.txt          # discard unstaged changes (Git 2.23+)
git checkout -- file.txt      # older syntax`)}

<h3>Unstage (keep changes)</h3>
${codeBlock(`git restore --staged file.txt   # unstage, keep edits
git reset HEAD file.txt        # older syntax`)}

<h3>Amend last commit</h3>
${codeBlock(`git commit --amend            # edit message or add staged changes
git commit --amend --no-edit  # add staged changes, keep message`)}

<h3>Revert (safe for shared history)</h3>
${codeBlock(`git revert abc123            # creates a NEW commit that undoes abc123
# Use this on pushed commits — never rewrite shared history`)}

<h3>Reset (rewrites history — local only)</h3>
${codeBlock(`git reset --soft HEAD~1      # undo commit, keep changes staged
git reset --mixed HEAD~1     # undo commit, keep changes unstaged (default)
git reset --hard HEAD~1      # undo commit AND discard changes (dangerous)`)}

<h3>Stash (shelve work temporarily)</h3>
${codeBlock(`git stash                    # shelve working changes
git stash pop                # restore them
git stash list              # see stashes
git stash apply stash@{1}    # apply specific stash`)}

<h3>Golden rule</h3>
<p><strong>Never rewrite history that others have pulled.</strong> Use <code>revert</code> for shared commits; <code>reset</code>/<code>amend</code> only for local, unpushed work.</p>

<h3>Learn more</h3>
<p>${externalLink("Pro Git — Undoing Things", "https://git-scm.com/book/en/v2/Git-Basics-Undoing-Things")} · ${externalLink("git reset docs", "https://git-scm.com/docs/git-reset")}</p>

<h3>Your task</h3>
<p>Practice each: (1) modify a file and discard with <code>restore</code>, (2) stage a file then unstage with <code>restore --staged</code>, (3) make a commit and amend it, (4) stash changes, switch branches, pop. Verify state after each.</p>
`,
        initialCode: `# Undo practice (run in your repo):

# 1. Discard
echo "temp" >> README.md
git restore README.md

# 2. Unstage
echo "temp" >> README.md
git add README.md
git restore --staged README.md
git restore README.md

# 3. Amend
echo "x" > x.txt
git add x.txt
git commit -m "Add x"
echo "more" >> x.txt
git add x.txt
git commit --amend --no-edit

# 4. Stash
echo "wip" >> README.md
git stash
git stash pop`,
        solution: `# No single expected output — verify:
# - restore discards working changes
# - restore --staged unstages but keeps edits
# - amend folds new staged changes into last commit
# - stash/pop shelves and restores work`,
      },
      points_reward: 10,
    },
    {
      title: "10. Project — Collaborative Workflow",
      content: {
        type: "browser",
        instructions: `
<h2>Capstone: a full collaboration scenario</h2>
<p>Put it all together: clone → branch → commit → push → PR → review → merge → sync. This is the daily workflow of a professional developer.</p>

<h3>The scenario</h3>
<ol>
  <li>You and a teammate share a repo on GitHub</li>
  <li>You're assigned issue #1: "Add a contact page"</li>
  <li>Create a branch, implement, push, open a PR referencing the issue</li>
  <li>Teammate reviews, requests a change</li>
  <li>You address feedback, push again</li>
  <li>PR merges (issue auto-closes)</li>
  <li>You sync main locally and delete the branch</li>
</ol>

<h3>Commands you'll use</h3>
${codeBlock(`git clone <url>
git switch -c feature/contact-page
# ... edit, add, commit ...
git push -u origin feature/contact-page
# open PR on GitHub, reference "Fixes #1"
# after review feedback:
git add . && git commit -m "Address review feedback"
git push
# after merge:
git switch main
git pull
git branch -d feature/contact-page
git push origin --delete feature/contact-page`)}

<h3>Best practices checklist</h3>
<ul>
  <li>Branch names: <code>feature/</code>, <code>fix/</code>, <code>chore/</code> prefixes</li>
  <li>One logical change per commit</li>
  <li>Pull before you push; rebase to keep history clean</li>
  <li>Never commit secrets (<code>.env</code>, API keys) — use <code>.gitignore</code></li>
  <li>Write meaningful commit messages and PR descriptions</li>
</ul>

<h3>Learn more</h3>
<p>${externalLink("GitHub Skills — Introduction to GitHub", "https://skills.github.com/")} · ${externalLink("Pro Git — Distributed Workflows", "https://git-scm.com/book/en/v2/Distributed-Git-Distributed-Workflows")}</p>

<h3>Your task</h3>
<p>Run through the full scenario above on a real GitHub repo (your own is fine). Verify each step: branch created, PR opened, merged, main synced, branch cleaned up. Screenshot the PR for your records.</p>
`,
        initialCode: `# Capstone workflow (run in your repo):

git switch main
git pull

git switch -c feature/contact-page
mkdir -p src
echo "<h1>Contact</h1>" > src/contact.html
git add src/contact.html
git commit -m "Add contact page (Fixes #1)"

git push -u origin feature/contact-page
# -> open PR on GitHub, review, merge

git switch main
git pull
git branch -d feature/contact-page
git push origin --delete feature/contact-page`,
        solution: `# Verify the full flow completed:
# - src/contact.html exists on main
# - PR shows as merged on GitHub
# - Issue #1 auto-closed (if you created it)
# - feature/contact-page deleted locally and remotely
# - git log --oneline --graph shows clean linear history`,
      },
      points_reward: 25,
    },
  ],
};
