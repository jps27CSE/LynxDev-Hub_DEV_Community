import type { CourseData } from "./types";
import { codeBlock, externalLink, BOX_STYLE } from "./format";

export const linuxCourse: CourseData = {
  title: "Linux Commands — The Terminal from Scratch",
  description:
    "Master the command line — 12 hands-on lessons from your first prompt to a mini sysadmin task. Navigate files, read logs, manage permissions, chain commands, and inspect systems. Practice in your own terminal.",
  icon: "",
  difficulty: "Beginner",
  category: "DevOps",
  order_index: 4,
  chapters: [
    {
      title: "1. Meet the Terminal",
      content: {
        type: "browser",
        instructions: `
<h2>Your new superpower: the terminal</h2>
<p>Every developer, DevOps engineer, and sysadmin lives in the <strong>terminal</strong> (also called the shell or command line). It is a text interface to your operating system: you type a command, press <kbd>Enter</kbd>, and the system runs it and prints the result. No mouse, no windows — just text in, text out. That is exactly why it is so fast and scriptable.</p>

<h3>Opening a terminal</h3>
<ul>
  <li><strong>Linux (Ubuntu/Debian):</strong> <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>T</kbd>, or search "Terminal" in the app menu.</li>
  <li><strong>macOS:</strong> <kbd>Cmd</kbd>+<kbd>Space</kbd> → type "Terminal" → <kbd>Enter</kbd>.</li>
  <li><strong>Windows:</strong> install <a href="https://learn.microsoft.com/en-us/windows/wsl/install" target="_blank" rel="noopener noreferrer">WSL</a> (Ubuntu), then open "Ubuntu" from the Start menu. Or use Git Bash.</li>
</ul>
<p>What you see is a <strong>prompt</strong> — a line ending in <code>$</code> (or <code>#</code> for root) that says "I'm ready for a command".</p>

<h3>Commands you'll use every day</h3>
${codeBlock(`pwd        # Print Working Directory — where am I?
whoami     # which user am I logged in as?
clear      # clear the screen (or Ctrl+L)
history    # list commands you've typed before`)}

<p><code>pwd</code> is the single most useful command when you are lost: it prints the full path of the directory you are standing in. <code>whoami</code> tells you which user the shell is running as — critical before you run anything destructive.</p>

<h3>Tab completion (the secret weapon)</h3>
<p>Type the first few letters of a filename or command, then press <kbd>Tab</kbd>. The shell completes it for you. Press <kbd>Tab</kbd> twice to list all matches. This is not a luxury — it prevents typos, especially with long paths.</p>
${codeBlock(`cd /usr/loc<Tab>   # completes to /usr/local
ls /etc/pas<Tab>   # completes to /etc/passwd`)}

<h3>Re-running previous commands</h3>
<ul>
  <li><kbd>&uarr;</kbd> / <kbd>&darr;</kbd> — walk through command history.</li>
  <li><code>!!</code> — re-run the previous command (handy with <code>sudo !!</code> after "Permission denied").</li>
  <li><code>!n</code> — re-run command number <code>n</code> from <code>history</code>.</li>
  <li><kbd>Ctrl</kbd>+<kbd>R</kbd> — reverse search through history.</li>
</ul>

<h3>Learn more</h3>
<p>${externalLink("Ubuntu — command-line for beginners", "https://ubuntu.com/tutorials/command-line-for-beginners")} · ${externalLink("Linux Journey — getting started", "https://linuxjourney.com/lesson/the-shell")} · ${externalLink("TLDR pages", "https://tldr.sh/")}</p>

<h3>Your task</h3>
<p>Open a real terminal on your machine. Run each command below and compare your output to the expected output:</p>
${codeBlock(`pwd        # e.g. /home/yourname
whoami     # e.g. yourname
history | head -5   # your last 5 commands
clear      # screen clears`)}
<p><strong>Verify:</strong> <code>pwd</code> prints an absolute path starting with <code>/</code>. <code>whoami</code> prints your username (not <code>root</code> unless you deliberately switched). If any command says "command not found", you are probably in a non-bash shell — type <code>bash</code> and retry.</p>
`,
        initialCode: `# Scratchpad — type commands here for your own notes, then run them in a real terminal.
# pwd
# whoami
# clear
`,
        solution: `$ pwd
/home/jack
$ whoami
jack
$ history | head -5
    1  pwd
    2  whoami
    3  ls
    4  cd /etc
    5  pwd
$ clear
# (screen cleared)`,
      },
      points_reward: 10,
    },
    {
      title: "2. Navigate the Filesystem",
      content: {
        type: "browser",
        instructions: `
<h2>The filesystem is a tree</h2>
<p>Linux stores everything in a single inverted tree rooted at <code>/</code> (the root). Directories (folders) branch down; files are leaves. Your shell is always "standing in" one directory — the <strong>current working directory</strong>. Navigation commands move that pointer.</p>

<h3>Listing: <code>ls</code></h3>
${codeBlock(`ls             # list names in current dir
ls -l          # long format: permissions, owner, size, date
ls -a          # show hidden files (names starting with .)
ls -la         # combine: long + hidden
ls /etc        # list a specific directory without cd-ing into it`)}

<h3>Where am I: <code>pwd</code></h3>
<p>Already met — print the absolute path of the current directory. Use it whenever you are unsure.</p>

<h3>Change directory: <code>cd</code></h3>
${codeBlock(`cd /etc                 # absolute path — starts with /
cd ..                    # up one level (parent)
cd ../..                 # up two levels
cd ~                     # home directory (/home/you)
cd                       # same as cd ~
cd -                     # previous directory (toggle back and forth)
cd projects/lynxdev      # relative path — from where you stand`)}

<p><strong>Absolute vs relative:</strong> a path starting with <code>/</code> is absolute — it works from anywhere. A path without <code>/</code> is relative to your current directory. Beginners get lost here: <code>cd etc</code> only works if <code>etc</code> exists in the current directory; <code>cd /etc</code> always works.</p>

<h3>Hidden files and dotfiles</h3>
<p>Files whose name starts with <code>.</code> (like <code>.bashrc</code>, <code>.gitignore</code>) are hidden. <code>ls</code> hides them by default; <code>ls -a</code> reveals them. This is a convention, not a security feature.</p>

<h3>Learn more</h3>
<p>${externalLink("Ubuntu — navigating the filesystem", "https://ubuntu.com/tutorials/command-line-for-beginners#3-a-quick-tour-of-the-filesystem")} · ${externalLink("Linux Journey — filesystem", "https://linuxjourney.com/lesson/filesystem")} · ${externalLink("Boot.dev — filesystem", "https://www.boot.dev/courses/learn-linux")}</p>

<h3>Your task</h3>
<p>From your home directory, perform this sequence and verify each step:</p>
${codeBlock(`pwd                       # note your starting directory
ls -la                    # list everything including hidden
cd /                      # go to root
ls                        # top-level dirs: bin, etc, home, usr, var...
cd /etc && pwd            # chain: go to /etc and print path
cd -                      # back to previous dir
cd ~ && pwd               # back home`)}
<p><strong>Verify:</strong> <code>cd -</code> prints the directory you jumped from. <code>ls /</code> shows <code>home</code>, <code>etc</code>, <code>usr</code>. If <code>cd /etc</code> says "No such file or directory", you are not on a Linux/macOS system — use WSL or Git Bash.</p>
`,
        initialCode: `# Navigation scratchpad
# pwd
# ls -la
# cd /etc
# cd -
# cd ~
`,
        solution: `$ pwd
/home/jack
$ ls -la
total 48
drwxr-xr-x 8 jack jack 4096 ...
-rw-r--r-- 1 jack jack  220 .bashrc
...
$ cd /
$ ls
bin  boot  dev  etc  home  lib  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var
$ cd /etc && pwd
/etc
$ cd -
/
$ cd ~ && pwd
/home/jack`,
      },
      points_reward: 10,
    },
    {
      title: "3. Create, Copy, Move, Delete",
      content: {
        type: "browser",
        instructions: `
<h2>Manipulating files and directories</h2>
<p>These are the verbs of the filesystem: create, copy, move, rename, delete. Master them and you can organize anything. They are also where mistakes hurt — <code>rm</code> has no recycle bin.</p>

<h3>Create</h3>
${codeBlock(`mkdir notes             # create a directory
mkdir -p a/b/c          # create nested dirs in one shot (-p = parents)
touch hello.txt         # create an empty file (or update its timestamp)
touch a.txt b.txt c.txt # create several at once`)}

<h3>Copy: <code>cp</code></h3>
${codeBlock(`cp file.txt backup.txt          # copy file
cp file.txt dir/               # copy into a directory
cp -r dir1 dir2                # copy a directory recursively (-r)
cp -i file.txt backup.txt      # prompt before overwriting (-i = interactive)`)}

<h3>Move / rename: <code>mv</code></h3>
${codeBlock(`mv old.txt new.txt             # rename
mv file.txt dir/               # move into a directory
mv dir1 dir2                   # rename a directory
mv -i file.txt dir/            # prompt before overwriting`)}

<p><code>mv</code> is how you rename — Linux has no separate "rename" command. Moving across filesystems (e.g. to a USB drive) actually copies then deletes.</p>

<h3>Delete: <code>rm</code> and <code>rmdir</code></h3>
${codeBlock(`rm file.txt                # delete a file
rm -i file.txt             # prompt before deleting (good habit)
rm -r dir/                 # delete a directory and its contents
rm -rf dir/                # force, no prompts — DANGEROUS
rmdir emptydir/            # delete only if directory is empty`)}

<div style="${BOX_STYLE}">
<strong>Warning:</strong> <code>rm -rf /</code> (or <code>rm -rf *</code> in the wrong directory) can destroy your system. There is no undo. Always <code>pwd</code> before deleting, prefer <code>rm -i</code>, and never run <code>rm -rf</code> with <code>sudo</code> unless you are certain. Consider <code>trash-put</code> (trash-cli) for a real recycle bin.
</div>

<h3>Links: <code>ln</code></h3>
${codeBlock(`ln file.txt hardlink.txt      # hard link (same inode, no -s)
ln -s /etc/hosts hostlink   # symbolic link (shortcut/pointer)`)}

<p>A <strong>hard link</strong> is a second name for the same file data; a <strong>symlink</strong> is a pointer to a path. Symlinks are what you use 99% of the time (shortcuts, version switching).</p>

<h3>Learn more</h3>
<p>${externalLink("Opensource.com — essential Linux commands", "https://opensource.com/article/22/5/essential-linux-commands")} · ${externalLink("Linuxize — cp/mv/rm", "https://linuxize.com/post/cp-command-in-linux/")} · ${externalLink("LabEx — practice", "https://labex.io")}</p>

<h3>Your task</h3>
<p>In a scratch directory (e.g. <code>/tmp/practice</code>), build and tear down a small tree:</p>
${codeBlock(`mkdir -p /tmp/practice/a/b/c
cd /tmp/practice
touch a/b/c/notes.txt
echo "hello" > a/b/c/notes.txt
cp a/b/c/notes.txt notes-backup.txt
mv notes-backup.txt notes-final.txt
ls -R                      # recursive listing
rm -r a                    # remove the whole tree
ls                         # only notes-final.txt remains
rm notes-final.txt`)}

<p><strong>Verify:</strong> <code>ls -R</code> shows the nested structure before deletion. After <code>rm -r a</code>, <code>ls</code> shows only <code>notes-final.txt</code>. Running <code>rm -r a</code> again says "No such file or directory" — that is the expected error.</p>
`,
        initialCode: `# File operations scratchpad
# mkdir -p a/b/c
# touch a/b/c/notes.txt
# cp a/b/c/notes.txt backup.txt
# mv backup.txt final.txt
# rm -r a
`,
        solution: `$ mkdir -p /tmp/practice/a/b/c
$ cd /tmp/practice
$ touch a/b/c/notes.txt
$ echo "hello" > a/b/c/notes.txt
$ cp a/b/c/notes.txt notes-backup.txt
$ mv notes-backup.txt notes-final.txt
$ ls -R
.:
a  notes-final.txt

./a:
b

./a/b:
c

./a/b/c:
notes.txt
$ rm -r a
$ ls
notes-final.txt
$ rm notes-final.txt`,
      },
      points_reward: 10,
    },
    {
      title: "4. Read File Contents",
      content: {
        type: "browser",
        instructions: `
<h2>Reading files without an editor</h2>
<p>You will read files far more often than you write them — configs, logs, source code, data. The terminal has purpose-built readers that are faster than opening a GUI editor.</p>

<h3>Dump: <code>cat</code></h3>
${codeBlock(`cat file.txt            # print entire file
cat a.txt b.txt         # concatenate multiple files
cat -n file.txt         # number every line`)}

<p><code>cat</code> is great for small files. For large files it floods your screen — use a pager instead.</p>

<h3>Pagers: <code>less</code> and <code>more</code></h3>
${codeBlock(`less big.log            # scrollable viewer
# inside less: Space=page down, b=page up, /text=search, q=quit, G=end, g=top`)}

<p><code>less</code> is the modern default (despite the name, it does <em>more</em> than <code>more</code>). Always prefer <code>less</code> for large files.</p>

<h3>Peek: <code>head</code> and <code>tail</code></h3>
${codeBlock(`head file.txt           # first 10 lines
head -n 20 file.txt      # first 20 lines
tail file.txt            # last 10 lines
tail -n 50 file.txt      # last 50 lines
tail -f app.log          # follow: stream new lines as they're written (Ctrl+C to stop)`)}

<p><code>tail -f</code> is the #1 debugging tool for live logs — run it on a log file and watch errors appear in real time.</p>

<h3>Count: <code>wc</code></h3>
${codeBlock(`wc file.txt             # lines, words, bytes
wc -l file.txt           # lines only
wc -w file.txt           # words only`)}

<h3>File type: <code>file</code></h3>
${codeBlock(`file photo.jpg          # "JPEG image data, ..."
file script.sh          # "Bourne-Again shell script text"
file unknown.bin        # identifies binaries too`)}

<p><code>file</code> inspects content, not the extension — useful when a file has no extension or a misleading one.</p>

<h3>Learn more</h3>
<p>${externalLink("Red Hat — 20 essential Linux commands", "https://www.redhat.com/en/blog/20-essential-linux-commands-every-user")} · ${externalLink("Linuxize — less", "https://linuxize.com/post/less-command-in-linux/")} · ${externalLink("Boot.dev — Linux", "https://www.boot.dev/courses/learn-linux")}</p>

<h3>Your task</h3>
<p>Create a sample log file and practice reading it different ways:</p>
${codeBlock(`cd /tmp/practice
printf "line %d\\n" $(seq 1 100) > big.log
wc -l big.log             # -> 100
head -n 3 big.log         # -> line 1, 2, 3
tail -n 3 big.log         # -> line 98, 99, 100
tail -f big.log &         # follow in background
echo "line 101" >> big.log
# (you should see "line 101" appear)
kill %1                   # stop the background tail
less big.log              # browse; press q to quit`)}
<p><strong>Verify:</strong> <code>wc -l</code> reports 100. <code>tail -f</code> prints the appended line. <code>less</code> opens a pager you exit with <code>q</code>. If <code>less</code> is not installed, use <code>more</code>.</p>
`,
        initialCode: `# Reading files scratchpad
# cat file.txt
# head -n 20 file.txt
# tail -f app.log
# wc -l file.txt
`,
        solution: `$ printf "line %d\\n" $(seq 1 100) > big.log
$ wc -l big.log
100 big.log
$ head -n 3 big.log
line 1
line 2
line 3
$ tail -n 3 big.log
line 98
line 99
line 100
$ tail -f big.log &
[1] 12345
$ echo "line 101" >> big.log
line 101
$ kill %1
[1]+  Terminated              tail -f big.log
$ less big.log
# (pager opens; press q to quit)`,
      },
      points_reward: 10,
    },
    {
      title: "5. Search Files & Content",
      content: {
        type: "browser",
        instructions: `
<h2>Finding things fast</h2>
<p>You will search constantly: a config value, an error message, a file whose name you half-remember. Two tools cover 95% of cases: <code>grep</code> for content inside files, <code>find</code> for files by name/attributes.</p>

<h3>Search inside files: <code>grep</code></h3>
${codeBlock(`grep "error" app.log              # lines containing "error"
grep -i "error" app.log           # case-insensitive
grep -n "error" app.log           # show line numbers
grep -r "TODO" src/               # recursive search in a directory
grep -rn "TODO" src/              # recursive + line numbers
grep -v "debug" app.log           # invert: lines NOT matching
grep -E "err|warn" app.log        # extended regex (alternation)
grep -l "import React" src/       # list only filenames that match`)}

<p><code>grep -rn</code> is the single most-used command in a codebase. Memorize it.</p>

<h3>Find files by name: <code>find</code></h3>
${codeBlock(`find . -name "*.log"             # files ending in .log, from here down
find /etc -name "hosts"           # exact name
find . -iname "*.PNG"             # case-insensitive
find . -type d -name node_modules # directories only
find . -type f -size +10M         # files larger than 10 MB
find . -mtime -1                  # modified in last 24h
find . -name "*.tmp" -delete      # find and delete (careful!)`)}

<h3>Quick name lookup: <code>locate</code></h3>
${codeBlock(`locate nginx.conf                  # instant, searches a prebuilt DB
sudo updatedb                    # rebuild the DB (run after creating files)`)}

<p><code>locate</code> is instant but the DB may be stale; <code>find</code> is always current but slower.</p>

<h3>Where is a command: <code>which</code> / <code>whereis</code></h3>
${codeBlock(`which node                      # path of the executable that runs
which -a python                # all matches in PATH
whereis bash                   # binary, source, and man page locations`)}

<h3>Learn more</h3>
<p>${externalLink("Linux Journey — searching", "https://linuxjourney.com/lesson/searching-for-files")} · ${externalLink("LabEx — grep/find practice", "https://labex.io")} · ${externalLink("Red Hat — essential commands", "https://www.redhat.com/en/blog/20-essential-linux-commands-every-user")}</p>

<h3>Your task</h3>
<p>In a project directory (any repo), answer these with one command each:</p>
${codeBlock(`# 1. Find all .ts files under src/
find . -path ./node_modules -prune -o -name "*.ts" -print

# 2. Find lines containing "TODO" across the repo
grep -rn "TODO" . --exclude-dir=node_modules

# 3. Find files larger than 1 MB
find . -type f -size +1M

# 4. Which binary runs when you type "node"?
which node`)}
<p><strong>Verify:</strong> command 1 lists <code>.ts</code> files and excludes <code>node_modules</code>. Command 2 prints file:line:text. If <code>grep -r</code> is too slow on a huge repo, narrow the directory first.</p>
`,
        initialCode: `# Search scratchpad
# grep -rn "TODO" .
# find . -name "*.log"
# which node
`,
        solution: `$ grep -rn "TODO" src/
src/app/page.tsx:12:// TODO: add loading state
src/lib/data.ts:45:// TODO: cache this

$ find . -name "*.log" -not -path "*/node_modules/*"
./app.log
./logs/error.log

$ find . -type f -size +1M
./node_modules/.cache/large.bin

$ which node
/usr/bin/node`,
      },
      points_reward: 10,
    },
    {
      title: "6. Get Help Without Leaving the Terminal",
      content: {
        type: "browser",
        instructions: `
<h2>Documentation at your fingertips</h2>
<p>You never need to leave the terminal to learn a command. Built-in help is faster than a web search and always matches your installed version.</p>

<h3>Manual pages: <code>man</code></h3>
${codeBlock(`man ls                  # full manual for ls
man 5 passwd            # section 5 = file format (vs section 1 = command)
# inside man: Space=page down, /text=search, n=next match, q=quit`)}

<p><code>man</code> pages are comprehensive but dense. Read the SYNOPSIS and EXAMPLES sections first.</p>

<h3>Quick help: <code>--help</code></h3>
${codeBlock(`ls --help               # concise usage summary
grep --help
cp --help`)}

<p>Most GNU commands support <code>--help</code>. It is shorter than <code>man</code> and easier to skim.</p>

<h3>One-line descriptions: <code>whatis</code> and <code>apropos</code></h3>
${codeBlock(`whatis ls               # "ls (1) - list directory contents"
whatis grep             # short description
apropos "search"        # list commands whose description matches
apropos "copy file"     # discover commands you didn't know existed`)}

<p><code>apropos</code> is a discovery tool: "I need to do X, what command does that?"</p>

<h3>TLDR: concise examples</h3>
<p><a href="https://tldr.sh/" target="_blank" rel="noopener noreferrer">TLDR pages</a> give practical examples instead of dense manuals. Install with <code>npm install -g tldr</code> or <code>pip install tldr</code>, then:</p>
${codeBlock(`tldr tar                # common tar recipes
tldr find               # find examples
tldr chmod              # chmod recipes`)}

<h3>Learn more</h3>
<p>${externalLink("Linux Journey — getting help", "https://linuxjourney.com/lesson/man-pages")} · ${externalLink("TLDR pages", "https://tldr.sh/")} · ${externalLink("Ubuntu — command line for beginners", "https://ubuntu.com/tutorials/command-line-for-beginners")}</p>

<h3>Your task</h3>
<p>Practice the help workflow on three commands:</p>
${codeBlock(`man ls                  # read; find the -h (human-readable) flag; quit with q
ls --help | head -20    # skim the first 20 lines
whatis chmod            # one-line description
apropos "rename"        # which commands rename files?
# (expect mv among the results)`)}

<p><strong>Verify:</strong> <code>man ls</code> opens a pager you exit with <code>q</code>. <code>apropos "rename"</code> includes <code>mv (1)</code>. If <code>man</code> says "No manual entry", install <code>man-db</code> (<code>sudo apt install man-db</code>).</p>
`,
        initialCode: `# Help scratchpad
# man ls
# ls --help
# whatis chmod
# apropos "copy"
`,
        solution: `$ man ls
# (pager opens; find -h "human readable sizes"; press q)

$ ls --help | head -20
Usage: ls [OPTION]... [FILE]...
List information about the FILEs...
  -a, --all                  do not ignore entries starting with .
  -A, --almost-all           do not list implied . and ..
...

$ whatis chmod
chmod (1) - change file mode bits

$ apropos "rename"
mv (1) - move (rename) files
rename (1) - renames multiple files
rename (2) - change the name or location of a file`,
      },
      points_reward: 10,
    },
    {
      title: "7. Permissions & Ownership",
      content: {
        type: "browser",
        instructions: `
<h2>Who can do what</h2>
<p>Linux permissions decide who can read, write, or execute a file. Every file has an owner, a group, and three permission sets (owner / group / others). Misunderstanding permissions causes half of all "Permission denied" errors.</p>

<h3>Reading permissions: <code>ls -l</code></h3>
${codeBlock(`ls -l
# -rw-r--r-- 1 jack developers 1234 Jan 1 10:00 notes.txt
# ^^^^^^^^^^^
# 1: file type (- = file, d = dir, l = symlink)
# 2-4: owner (rw-)  5-7: group (r--)  8-10: others (r--)`)}

<p><code>r</code> = read, <code>w</code> = write, <code>x</code> = execute. A directory needs <code>x</code> to be entered and <code>r</code> to be listed.</p>

<h3>Changing permissions: <code>chmod</code></h3>
<p>Two syntaxes — symbolic (readable) and numeric (fast).</p>
${codeBlock(`# Symbolic
chmod u+x script.sh        # owner: add execute
chmod g-w file.txt         # group: remove write
chmod o+r file.txt         # others: add read
chmod a+x script.sh        # all: add execute
chmod u=rwx,g=rx,o=r dir   # set exact bits

# Numeric (r=4, w=2, x=1; sum them)
chmod 755 script.sh        # rwxr-xr-x  (owner full, others read+exec)
chmod 644 file.txt         # rw-r--r--  (owner rw, others read)
chmod 600 secret.key       # rw-------  (owner only)
chmod 700 private/         # rwx------  (owner only, dir)`)}

<h3>Ownership: <code>chown</code> and <code>chgrp</code></h3>
${codeBlock(`sudo chown alice file.txt          # change owner
sudo chown alice:developers file.txt # owner + group
sudo chgrp developers file.txt      # group only
sudo chown -R alice:developers dir/ # recursive`)}

<h3>Superuser: <code>sudo</code> and <code>su</code></h3>
<ul>
  <li><code>sudo command</code> — run one command as root (needs your password, and you must be in the <code>sudoers</code> list).</li>
  <li><code>sudo -i</code> / <code>sudo su</code> — open a root shell (exit with <code>exit</code> or <kbd>Ctrl</kbd>+<kbd>D</kbd>).</li>
  <li>Rule of least privilege: use <code>sudo</code> for single commands; avoid living in a root shell.</li>
</ul>

<div style="${BOX_STYLE}">
<strong>Warning:</strong> <code>chmod 777</code> makes a file writable by everyone — almost never correct and a security hole. <code>sudo rm</code> / <code>sudo chmod</code> on system files can break the OS. When in doubt, copy the file first.
</div>

<h3>Learn more</h3>
<p>${externalLink("Opensource.com — chmod cheat sheet", "https://opensource.com/article/19/11/cheat-sheet-common-linux-commands")} · ${externalLink("Opensource.com — essential commands", "https://opensource.com/article/22/5/essential-linux-commands")} · ${externalLink("Linux Journey — permissions", "https://linuxjourney.com/lesson/file-permissions")}</p>

<h3>Your task</h3>
<p>Create a script and lock it down:</p>
${codeBlock(`cd /tmp/practice
echo '#!/bin/bash' > greet.sh
echo 'echo "hi $USER"' >> greet.sh
ls -l greet.sh                # note: -rw-r--r-- (no execute)
chmod u+x greet.sh            # add execute for owner
ls -l greet.sh                # -> -rwxr--r--
./greet.sh                    # runs: hi <you>
chmod 600 greet.sh            # owner only
ls -l greet.sh                # -> -rw-------
./greet.sh                    # still runs (you are owner)
sudo chown nobody greet.sh    # change owner (requires sudo)
ls -l greet.sh                # owner is now nobody`)}

<p><strong>Verify:</strong> before <code>chmod u+x</code>, running <code>./greet.sh</code> says "Permission denied". After, it prints <code>hi &lt;you&gt;</code>. Numeric <code>600</code> removes all access for group/others.</p>
`,
        initialCode: `# Permissions scratchpad
# ls -l file.txt
# chmod 755 script.sh
# chmod u+x script.sh
# sudo chown alice file.txt
`,
        solution: `$ ls -l greet.sh
-rw-r--r-- 1 jack jack 27 Jan  1 10:00 greet.sh
$ chmod u+x greet.sh
$ ls -l greet.sh
-rwxr--r-- 1 jack jack 27 Jan  1 10:00 greet.sh
$ ./greet.sh
hi jack
$ chmod 600 greet.sh
$ ls -l greet.sh
-rw------- 1 jack jack 27 Jan  1 10:00 greet.sh
$ ./greet.sh
hi jack
$ sudo chown nobody greet.sh
$ ls -l greet.sh
-rw------- 1 nobody jack 27 Jan  1 10:00 greet.sh`,
      },
      points_reward: 10,
    },
    {
      title: "8. Redirect Output & Pipes",
      content: {
        type: "browser",
        instructions: `
<h2>Connecting commands together</h2>
<p>The Unix philosophy: small programs that do one thing well, combined with pipes and redirection. This is where the shell becomes more powerful than any GUI.</p>

<h3>Redirection: <code>&gt;</code>, <code>&gt;&gt;</code>, <code>&lt;</code></h3>
${codeBlock(`echo "hello" > out.txt          # overwrite (creates if missing)
echo "world" >> out.txt         # append (does not overwrite)
cat < in.txt                    # read stdin from a file
sort < names.txt > sorted.txt   # read from file, write to file`)}

<div style="${BOX_STYLE}">
<strong>Warning:</strong> <code>&gt;</code> silently overwrites. Use <code>&gt;&gt;</code> to append. Enable <code>set -o noclobber</code> in your shell to prevent accidental overwrites.
</div>

<h3>Pipes: <code>|</code></h3>
${codeBlock(`ls -l | grep ".log"            # list, then filter
cat access.log | grep 404 | wc -l   # chain: read → filter → count
ps aux | grep nginx | grep -v grep # find nginx processes
history | tail -5              # last 5 commands`)}

<p>A pipe takes the <strong>stdout</strong> of the left command and feeds it as <strong>stdin</strong> to the right command. No temp files needed.</p>

<h3>Split output: <code>tee</code></h3>
${codeBlock(`ls -l | tee listing.txt        # print to screen AND save to file
make 2>&1 | tee build.log       # capture stdout+stderr`)}

<h3>Passing args: <code>xargs</code></h3>
${codeBlock(`find . -name "*.tmp" | xargs rm    # delete found files
cat urls.txt | xargs -n1 curl -O  # download each URL
echo "a b c" | xargs -n1 echo     # one item per line`)}

<h3>Learn more</h3>
<p>${externalLink("Linuxize — redirections", "https://linuxize.com/post/bash-redirect-stderr-stdout/")} · ${externalLink("Linux Journey — pipes", "https://linuxjourney.com/lesson/piping-and-redirection")} · ${externalLink("Boot.dev — I/O", "https://www.boot.dev/courses/learn-linux")}</p>

<h3>Your task</h3>
<p>Build a small pipeline and verify each stage:</p>
${codeBlock(`cd /tmp/practice
printf "apple\\nbanana\\ncherry\\napple\\n" > fruits.txt
sort fruits.txt                 # alphabetical
sort fruits.txt | uniq          # unique sorted
sort fruits.txt | uniq -c       # count occurrences
sort fruits.txt | uniq -c | sort -rn   # most common first
cat fruits.txt | grep a | wc -l # lines containing 'a'
ls -l | tee dir-listing.txt     # save + display
cat dir-listing.txt | head -3`)}

<p><strong>Verify:</strong> <code>uniq -c</code> shows <code>2 apple</code>. The final pipeline counts lines with "a" (apple, banana → 2). <code>tee</code> writes the same output to <code>dir-listing.txt</code> that you see on screen.</p>
`,
        initialCode: `# Pipes & redirection scratchpad
# echo "hi" > out.txt
# cat file | grep x | wc -l
# ls | tee listing.txt
`,
        solution: `$ sort fruits.txt | uniq -c
      2 apple
      1 banana
      1 cherry
$ sort fruits.txt | uniq -c | sort -rn
      2 apple
      1 cherry
      1 banana
$ cat fruits.txt | grep a | wc -l
2
$ ls -l | tee dir-listing.txt
total 8
-rw-r--r-- 1 jack jack 24 Jan 1 10:00 fruits.txt
-rw-r--r-- 1 jack jack 95 Jan 1 10:00 dir-listing.txt
$ cat dir-listing.txt | head -3
total 8
-rw-r--r-- 1 jack jack 24 Jan 1 10:00 fruits.txt`,
      },
      points_reward: 10,
    },
  ],
};

