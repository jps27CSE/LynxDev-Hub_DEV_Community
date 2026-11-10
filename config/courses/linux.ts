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
  ],
};
