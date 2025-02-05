const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');
const frontMatter = require('front-matter');

async function processDirectory(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            await processDirectory(fullPath);
        } else {
            await processFile(fullPath);
        }
    }
}

async function processFile(filePath) {
    const ext = path.extname(filePath);
    const relativePath = path.relative('src/pages', filePath);
    const outputPath = path.join('docs', relativePath.replace('.md', '.html'));
    
    if (ext === '.html') {
        await fs.copy(filePath, outputPath);
    } else if (ext === '.md') {
        const content = await fs.readFile(filePath, 'utf-8');
        const { attributes, body } = frontMatter(content);
        const html = marked(body);
        
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>${attributes.title || 'Simple Static Site V2'}</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            max-width: 650px;
            margin: 40px auto;
            padding: 0 20px;
            color: #333;
            background: #fff;
        }
        nav {
            margin-bottom: 40px;
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
        }
        nav a {
            color: #333;
            text-decoration: none;
            margin-right: 20px;
        }
        nav a:hover {
            text-decoration: underline;
        }
        h1, h2 {
            margin-top: 40px;
            margin-bottom: 20px;
        }
        p {
            margin-bottom: 20px;
            color: #444;
        }
        .episode {
            color: #666;
            font-size: 0.9em;
            margin-bottom: 10px;
            text-transform: uppercase;
        }
        hr {
            border: none;
            border-top: 1px solid #eee;
            margin: 40px 0;
        }
        a {
            color: #d32f2f;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .see-all {
            display: inline-block;
            margin-top: 20px;
            font-weight: 500;
        }
        .article-list {
            margin-top: 60px;
            border-top: 1px solid #eee;
            padding-top: 40px;
        }
        .article h3 {
            font-size: 1.8em;
            margin-bottom: 15px;
        }
    </style>
</head>
<body>
    <nav>
        <a href="index.html">Home</a>
        <a href="blog.html">Blog</a>
        <a href="about.html">About</a>
        <a href="faq.html">FAQ</a>
    </nav>
    <main>
        ${html}
    </main>
</body>
</html>`;
        
        await fs.outputFile(outputPath, htmlContent);
    }
}

async function build() {
    await fs.emptyDir('docs');
    
    if (await fs.pathExists('src/assets')) {
        await fs.copy('src/assets', 'docs');
    }
    
    await processDirectory('src/pages');
}

build().catch(console.error); 