const fs = require('fs-extra');
const path = require('path');
const { marked } = require('marked');
const frontMatter = require('front-matter');

async function build() {
    // Clear docs directory
    await fs.emptyDir('docs');
    
    // Copy static assets if they exist
    if (await fs.pathExists('src/assets')) {
        await fs.copy('src/assets', 'docs');
    }
    
    // Process files
    const contentDir = 'src/pages';
    const files = await fs.readdir(contentDir);
    
    for (const file of files) {
        const ext = path.extname(file);
        
        if (ext === '.html') {
            // Direct copy for HTML files
            await fs.copy(
                path.join(contentDir, file),
                path.join('docs', file)
            );
        } else if (ext === '.md') {
            // Process markdown files
            const content = await fs.readFile(path.join(contentDir, file), 'utf-8');
            const { attributes, body } = frontMatter(content);
            const html = marked(body);
            
            // Create HTML file with navigation
            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${attributes.title || 'My Site'}</title>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        nav {
                            background: #333;
                            padding: 1rem;
                            margin-bottom: 2rem;
                        }
                        nav a {
                            color: white;
                            text-decoration: none;
                            margin-right: 1rem;
                        }
                        nav a:hover {
                            text-decoration: underline;
                        }
                        .container {
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 0 1rem;
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
                    <div class="container">
                        ${html}
                    </div>
                </body>
                </html>
            `;
            
            const outputPath = path.join('docs', file.replace('.md', '.html'));
            await fs.outputFile(outputPath, htmlContent);
        }
    }
}

build().catch(console.error); 