import type { SectionColor, ItemType } from "@/lib/types/database";

export interface TemplateItem {
  item_type: ItemType;
  key_text: string;
  value_text: string;
  is_new?: boolean;
}

export interface TemplateSection {
  title: string;
  color: SectionColor;
  items: TemplateItem[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  emoji: string;
  layout: { columns: 1 | 2 | 3 | 4 };
  toggles: { id: string; label: string; options: { key: string; label: string }[]; default: string }[];
  sections: TemplateSection[];
}

export const TEMPLATES: Template[] = [
  {
    id: "github",
    name: "GitHub & Git",
    description: "Essential Git commands and GitHub workflow shortcuts",
    emoji: "🐙",
    layout: { columns: 4 },
    toggles: [],
    sections: [
      {
        title: "Repository Setup",
        color: "gray",
        items: [
          { item_type: "pair", key_text: "git init", value_text: "Initialize a new local repo" },
          { item_type: "pair", key_text: "git clone [url]", value_text: "Clone a remote repository" },
          { item_type: "pair", key_text: "git remote add origin [url]", value_text: "Connect to remote repo" },
          { item_type: "pair", key_text: "git remote -v", value_text: "List remote connections" },
        ],
      },
      {
        title: "Staging & Commits",
        color: "green",
        items: [
          { item_type: "pair", key_text: "git status", value_text: "Show working tree status" },
          { item_type: "pair", key_text: "git add .", value_text: "Stage all changes" },
          { item_type: "pair", key_text: "git add [file]", value_text: "Stage specific file" },
          { item_type: "pair", key_text: "git commit -m \"msg\"", value_text: "Commit with message" },
          { item_type: "pair", key_text: "git commit --amend", value_text: "Modify last commit" },
          { item_type: "pair", key_text: "git reset HEAD [file]", value_text: "Unstage a file" },
        ],
      },
      {
        title: "Branching",
        color: "blue",
        items: [
          { item_type: "pair", key_text: "git branch", value_text: "List local branches" },
          { item_type: "pair", key_text: "git branch [name]", value_text: "Create new branch" },
          { item_type: "pair", key_text: "git checkout [branch]", value_text: "Switch to branch" },
          { item_type: "pair", key_text: "git checkout -b [name]", value_text: "Create & switch branch" },
          { item_type: "pair", key_text: "git branch -d [name]", value_text: "Delete branch" },
          { item_type: "pair", key_text: "git merge [branch]", value_text: "Merge branch into current" },
        ],
      },
      {
        title: "Push & Pull",
        color: "purple",
        items: [
          { item_type: "pair", key_text: "git push origin [branch]", value_text: "Push to remote" },
          { item_type: "pair", key_text: "git push -u origin [branch]", value_text: "Push & set upstream" },
          { item_type: "pair", key_text: "git pull", value_text: "Fetch & merge from remote" },
          { item_type: "pair", key_text: "git fetch", value_text: "Fetch without merging" },
          { item_type: "pair", key_text: "git pull --rebase", value_text: "Pull with rebase" },
        ],
      },
      {
        title: "Logs & Diff",
        color: "cyan",
        items: [
          { item_type: "pair", key_text: "git log", value_text: "Show commit history" },
          { item_type: "pair", key_text: "git log --oneline", value_text: "Compact commit history" },
          { item_type: "pair", key_text: "git diff", value_text: "Show unstaged changes" },
          { item_type: "pair", key_text: "git diff --staged", value_text: "Show staged changes" },
          { item_type: "pair", key_text: "git show [commit]", value_text: "Show commit details" },
        ],
      },
      {
        title: "Undo & Reset",
        color: "red",
        items: [
          { item_type: "pair", key_text: "git revert [commit]", value_text: "Revert a commit (safe)" },
          { item_type: "pair", key_text: "git reset --soft HEAD~1", value_text: "Undo commit, keep changes" },
          { item_type: "pair", key_text: "git reset --hard HEAD~1", value_text: "Undo commit, discard changes" },
          { item_type: "pair", key_text: "git stash", value_text: "Stash uncommitted changes" },
          { item_type: "pair", key_text: "git stash pop", value_text: "Apply last stash" },
          { item_type: "pair", key_text: "git clean -fd", value_text: "Remove untracked files" },
        ],
      },
      {
        title: "GitHub PRs",
        color: "orange",
        items: [
          { item_type: "subheader", key_text: "Via GitHub CLI (gh)", value_text: "" },
          { item_type: "pair", key_text: "gh pr create", value_text: "Open a pull request" },
          { item_type: "pair", key_text: "gh pr list", value_text: "List open PRs" },
          { item_type: "pair", key_text: "gh pr checkout [number]", value_text: "Check out a PR locally" },
          { item_type: "pair", key_text: "gh pr merge [number]", value_text: "Merge a PR" },
          { item_type: "pair", key_text: "gh repo clone [repo]", value_text: "Clone via gh cli" },
        ],
      },
      {
        title: "Tags & Releases",
        color: "amber",
        items: [
          { item_type: "pair", key_text: "git tag", value_text: "List all tags" },
          { item_type: "pair", key_text: "git tag v1.0.0", value_text: "Create a lightweight tag" },
          { item_type: "pair", key_text: "git tag -a v1.0.0 -m \"msg\"", value_text: "Create annotated tag" },
          { item_type: "pair", key_text: "git push origin --tags", value_text: "Push all tags" },
          { item_type: "pair", key_text: "git tag -d v1.0.0", value_text: "Delete a local tag" },
        ],
      },
    ],
  },
  {
    id: "vscode",
    name: "VS Code Shortcuts",
    description: "Essential keyboard shortcuts for Visual Studio Code",
    emoji: "💻",
    layout: { columns: 4 },
    toggles: [
      {
        id: "os",
        label: "OS",
        options: [
          { key: "mac", label: "Mac" },
          { key: "windows", label: "Windows" },
        ],
        default: "mac",
      },
    ],
    sections: [
      {
        title: "General",
        color: "blue",
        items: [
          {
            item_type: "pair",
            key_text: "⌘+Shift+P",
            value_text: "Command palette",
            is_new: false,
          },
          { item_type: "pair", key_text: "⌘+P", value_text: "Quick open file" },
          { item_type: "pair", key_text: "⌘+,", value_text: "Open settings" },
          { item_type: "pair", key_text: "⌘+K ⌘+S", value_text: "Keyboard shortcuts" },
          { item_type: "pair", key_text: "⌘+Shift+X", value_text: "Extensions panel" },
          { item_type: "pair", key_text: "⌘+B", value_text: "Toggle sidebar" },
        ],
      },
      {
        title: "Editing",
        color: "green",
        items: [
          { item_type: "pair", key_text: "⌘+D", value_text: "Select next occurrence" },
          { item_type: "pair", key_text: "⌘+Shift+L", value_text: "Select all occurrences" },
          { item_type: "pair", key_text: "⌥+↑/↓", value_text: "Move line up/down" },
          { item_type: "pair", key_text: "⌥+Shift+↑/↓", value_text: "Copy line up/down" },
          { item_type: "pair", key_text: "⌘+Shift+K", value_text: "Delete line" },
          { item_type: "pair", key_text: "⌘+/", value_text: "Toggle line comment" },
          { item_type: "pair", key_text: "⌥+Shift+F", value_text: "Format document" },
        ],
      },
      {
        title: "Navigation",
        color: "purple",
        items: [
          { item_type: "pair", key_text: "⌘+G", value_text: "Go to line" },
          { item_type: "pair", key_text: "⌘+Shift+O", value_text: "Go to symbol" },
          { item_type: "pair", key_text: "F12", value_text: "Go to definition" },
          { item_type: "pair", key_text: "⌥+F12", value_text: "Peek definition" },
          { item_type: "pair", key_text: "⌘+←/→", value_text: "Go to start/end of line" },
          { item_type: "pair", key_text: "⌘+Shift+\\", value_text: "Jump to matching bracket" },
        ],
      },
      {
        title: "Search & Replace",
        color: "amber",
        items: [
          { item_type: "pair", key_text: "⌘+F", value_text: "Find in file" },
          { item_type: "pair", key_text: "⌘+H", value_text: "Replace in file" },
          { item_type: "pair", key_text: "⌘+Shift+F", value_text: "Find in all files" },
          { item_type: "pair", key_text: "⌘+Shift+H", value_text: "Replace in all files" },
          { item_type: "pair", key_text: "F3", value_text: "Find next" },
          { item_type: "pair", key_text: "Shift+F3", value_text: "Find previous" },
        ],
      },
      {
        title: "Multi-cursor",
        color: "cyan",
        items: [
          { item_type: "pair", key_text: "⌥+Click", value_text: "Insert cursor" },
          { item_type: "pair", key_text: "⌘+⌥+↑/↓", value_text: "Add cursor above/below" },
          { item_type: "pair", key_text: "⌘+U", value_text: "Undo last cursor" },
          { item_type: "pair", key_text: "Shift+⌥+I", value_text: "Add cursor to line ends" },
          { item_type: "pair", key_text: "Escape", value_text: "Cancel multi-cursor" },
        ],
      },
      {
        title: "Terminal",
        color: "gray",
        items: [
          { item_type: "pair", key_text: "⌘+`", value_text: "Toggle integrated terminal" },
          { item_type: "pair", key_text: "⌘+Shift+`", value_text: "New terminal" },
          { item_type: "pair", key_text: "⌘+\\", value_text: "Split terminal" },
          { item_type: "pair", key_text: "⌘+Shift+5", value_text: "Split terminal (alt)" },
        ],
      },
      {
        title: "Panels & Layout",
        color: "orange",
        items: [
          { item_type: "pair", key_text: "⌘+Shift+E", value_text: "Explorer panel" },
          { item_type: "pair", key_text: "⌘+Shift+G", value_text: "Source control panel" },
          { item_type: "pair", key_text: "⌘+Shift+D", value_text: "Debug panel" },
          { item_type: "pair", key_text: "⌘+\\", value_text: "Split editor" },
          { item_type: "pair", key_text: "⌘+1/2/3", value_text: "Focus editor group" },
        ],
      },
      {
        title: "Debug",
        color: "red",
        items: [
          { item_type: "pair", key_text: "F5", value_text: "Start/continue debug" },
          { item_type: "pair", key_text: "Shift+F5", value_text: "Stop debugging" },
          { item_type: "pair", key_text: "F9", value_text: "Toggle breakpoint" },
          { item_type: "pair", key_text: "F10", value_text: "Step over" },
          { item_type: "pair", key_text: "F11", value_text: "Step into" },
          { item_type: "pair", key_text: "Shift+F11", value_text: "Step out" },
        ],
      },
    ],
  },
  {
    id: "css-flexbox-grid",
    name: "CSS Flexbox & Grid",
    description: "Quick reference for CSS layout properties",
    emoji: "🎨",
    layout: { columns: 4 },
    toggles: [],
    sections: [
      {
        title: "Flexbox Container",
        color: "blue",
        items: [
          { item_type: "pair", key_text: "display: flex", value_text: "Enable flexbox" },
          { item_type: "pair", key_text: "flex-direction", value_text: "row | column | row-reverse | column-reverse" },
          { item_type: "pair", key_text: "flex-wrap", value_text: "nowrap | wrap | wrap-reverse" },
          { item_type: "pair", key_text: "justify-content", value_text: "flex-start | center | space-between | space-around | space-evenly" },
          { item_type: "pair", key_text: "align-items", value_text: "stretch | flex-start | center | flex-end | baseline" },
          { item_type: "pair", key_text: "align-content", value_text: "Multi-line cross-axis alignment" },
          { item_type: "pair", key_text: "gap", value_text: "Spacing between flex items" },
        ],
      },
      {
        title: "Flexbox Items",
        color: "purple",
        items: [
          { item_type: "pair", key_text: "flex: 1", value_text: "Grow to fill space (shorthand)" },
          { item_type: "pair", key_text: "flex-grow", value_text: "How much item grows (0 = no)" },
          { item_type: "pair", key_text: "flex-shrink", value_text: "How much item shrinks (1 = yes)" },
          { item_type: "pair", key_text: "flex-basis", value_text: "Initial size before flex math" },
          { item_type: "pair", key_text: "align-self", value_text: "Override align-items for one item" },
          { item_type: "pair", key_text: "order", value_text: "Visual order (default: 0)" },
        ],
      },
      {
        title: "Grid Container",
        color: "green",
        items: [
          { item_type: "pair", key_text: "display: grid", value_text: "Enable grid" },
          { item_type: "pair", key_text: "grid-template-columns", value_text: "Define column track sizes" },
          { item_type: "pair", key_text: "grid-template-rows", value_text: "Define row track sizes" },
          { item_type: "pair", key_text: "grid-template-areas", value_text: "Name areas with strings" },
          { item_type: "pair", key_text: "gap / row-gap / column-gap", value_text: "Spacing between tracks" },
          { item_type: "pair", key_text: "justify-items", value_text: "Align items horizontally in cell" },
          { item_type: "pair", key_text: "align-items", value_text: "Align items vertically in cell" },
        ],
      },
      {
        title: "Grid Items",
        color: "cyan",
        items: [
          { item_type: "pair", key_text: "grid-column: 1 / 3", value_text: "Span from col 1 to 3" },
          { item_type: "pair", key_text: "grid-column: span 2", value_text: "Span 2 columns" },
          { item_type: "pair", key_text: "grid-row: 1 / 3", value_text: "Span from row 1 to 3" },
          { item_type: "pair", key_text: "grid-area: header", value_text: "Place in named area" },
          { item_type: "pair", key_text: "justify-self", value_text: "Override justify-items" },
          { item_type: "pair", key_text: "align-self", value_text: "Override align-items" },
        ],
      },
      {
        title: "Useful Patterns",
        color: "amber",
        items: [
          { item_type: "subheader", key_text: "Common recipes", value_text: "" },
          { item_type: "pair", key_text: "repeat(3, 1fr)", value_text: "3 equal columns" },
          { item_type: "pair", key_text: "repeat(auto-fit, minmax(200px, 1fr))", value_text: "Responsive auto columns" },
          { item_type: "pair", key_text: "minmax(0, 1fr)", value_text: "Column with min 0" },
          { item_type: "pair", key_text: "place-items: center", value_text: "Center horizontally & vertically" },
          { item_type: "pair", key_text: "place-content: center", value_text: "Center whole grid" },
        ],
      },
      {
        title: "Positioning",
        color: "orange",
        items: [
          { item_type: "pair", key_text: "position: static", value_text: "Default, no offset" },
          { item_type: "pair", key_text: "position: relative", value_text: "Offset from normal position" },
          { item_type: "pair", key_text: "position: absolute", value_text: "Relative to nearest positioned parent" },
          { item_type: "pair", key_text: "position: fixed", value_text: "Relative to viewport" },
          { item_type: "pair", key_text: "position: sticky", value_text: "Sticks when scrolled to" },
          { item_type: "pair", key_text: "z-index", value_text: "Stack order (higher = on top)" },
        ],
      },
      {
        title: "Sizing",
        color: "red",
        items: [
          { item_type: "pair", key_text: "width / height", value_text: "Explicit size" },
          { item_type: "pair", key_text: "min-width / max-width", value_text: "Size constraints" },
          { item_type: "pair", key_text: "box-sizing: border-box", value_text: "Include padding in size" },
          { item_type: "pair", key_text: "overflow: hidden/scroll/auto", value_text: "Handle overflowing content" },
          { item_type: "pair", key_text: "aspect-ratio: 16/9", value_text: "Maintain aspect ratio" },
        ],
      },
      {
        title: "Tailwind Equivalents",
        color: "gray",
        items: [
          { item_type: "pair", key_text: "flex", value_text: "display: flex" },
          { item_type: "pair", key_text: "grid", value_text: "display: grid" },
          { item_type: "pair", key_text: "items-center", value_text: "align-items: center" },
          { item_type: "pair", key_text: "justify-between", value_text: "justify-content: space-between" },
          { item_type: "pair", key_text: "grid-cols-3", value_text: "grid-template-columns: repeat(3, 1fr)" },
          { item_type: "pair", key_text: "col-span-2", value_text: "grid-column: span 2" },
        ],
      },
    ],
  },
];
