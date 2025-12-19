import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXTENSIONS = [".php", ".ts", ".tsx", ".js", ".jsx", ".sql"];
const IGNORE_DIRS = ["node_modules", "dist", ".git", ".next"];

function removeCommentsFromFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    const ext = path.extname(filePath);

    if (ext === ".sql") {
      content = removeSqlComments(content);
    } else {
      content = removeCodeComments(content);
    }

    fs.writeFileSync(filePath, content, "utf8");
    return true;
  } catch (err) {
    console.error(`Error processing ${filePath}:`, err.message);
    return false;
  }
}

function removeCodeComments(content) {
  let result = "";
  let i = 0;
  let inString = false;
  let stringChar = "";
  let inTemplate = false;

  while (i < content.length) {
    if (content[i] === "`" && (i === 0 || content[i - 1] !== "\\")) {
      inTemplate = !inTemplate;
      result += content[i];
      i++;
      continue;
    }

    if (inTemplate) {
      result += content[i];
      i++;
      continue;
    }

    // Handle strings
    if (
      (content[i] === '"' || content[i] === "'") &&
      (i === 0 || content[i - 1] !== "\\")
    ) {
      if (!inString) {
        inString = true;
        stringChar = content[i];
      } else if (content[i] === stringChar) {
        inString = false;
      }
      result += content[i];
      i++;
      continue;
    }

    if (inString) {
      result += content[i];
      i++;
      continue;
    }

    // Remove single-line comments
    if (content[i] === "/" && content[i + 1] === "/") {
      // Skip to end of line
      while (i < content.length && content[i] !== "\n") {
        i++;
      }
      // Keep the newline
      if (content[i] === "\n") {
        result += "\n";
        i++;
      }
      continue;
    }

    // Remove multi-line comments
    if (content[i] === "/" && content[i + 1] === "*") {
      i += 2; // skip /*
      // Skip to */
      while (i < content.length - 1) {
        if (content[i] === "*" && content[i + 1] === "/") {
          i += 2;
          break;
        }
        // Preserve newlines inside comments for line number consistency
        if (content[i] === "\n") {
          result += "\n";
        }
        i++;
      }
      continue;
    }

    // Remove PHP-style comments (#)
    if (content[i] === "#" && (i === 0 || /[\s\n;]/.test(content[i - 1]))) {
      // Skip to end of line
      while (i < content.length && content[i] !== "\n") {
        i++;
      }
      // Keep the newline
      if (content[i] === "\n") {
        result += "\n";
        i++;
      }
      continue;
    }

    result += content[i];
    i++;
  }

  return result;
}

function removeSqlComments(content) {
  let result = "";
  let i = 0;
  let inString = false;
  let stringChar = "";

  while (i < content.length) {
    // Handle strings
    if (
      (content[i] === "'" || content[i] === '"') &&
      (i === 0 || content[i - 1] !== "\\")
    ) {
      if (!inString) {
        inString = true;
        stringChar = content[i];
      } else if (content[i] === stringChar) {
        inString = false;
      }
      result += content[i];
      i++;
      continue;
    }

    if (inString) {
      result += content[i];
      i++;
      continue;
    }

    // Remove -- comments
    if (content[i] === "-" && content[i + 1] === "-") {
      while (i < content.length && content[i] !== "\n") {
        i++;
      }
      if (content[i] === "\n") {
        result += "\n";
        i++;
      }
      continue;
    }

    // Remove /* */ comments
    if (content[i] === "/" && content[i + 1] === "*") {
      i += 2;
      while (i < content.length - 1) {
        if (content[i] === "*" && content[i + 1] === "/") {
          i += 2;
          break;
        }
        if (content[i] === "\n") {
          result += "\n";
        }
        i++;
      }
      continue;
    }

    // Remove # comments
    if (content[i] === "#") {
      while (i < content.length && content[i] !== "\n") {
        i++;
      }
      if (content[i] === "\n") {
        result += "\n";
        i++;
      }
      continue;
    }

    result += content[i];
    i++;
  }

  return result;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let count = 0;

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(file)) {
        count += walkDir(filePath);
      }
    } else if (EXTENSIONS.includes(path.extname(file))) {
      if (removeCommentsFromFile(filePath)) {
        console.log(`✓ ${filePath}`);
        count++;
      }
    }
  });

  return count;
}

// Main execution
const startDir = process.argv[2] || "./";
console.log(`🧹 Removing comments from files in: ${startDir}\n`);

const count = walkDir(startDir);
console.log(`\n✅ Successfully processed ${count} files`);
