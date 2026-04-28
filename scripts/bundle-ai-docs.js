import fs from 'node:fs';
import path from 'node:path';

/**
 * BUNDLE AI DOCS
 * Genera llms.txt y llms-full.txt para que las IAs entiendan FrankJStein de un vistazo.
 */

const CONFIG = {
    docsDir: './docs',
    skillsDir: './.agents/skills',
    outputFull: './llms-full.txt',
    outputIndex: './llms.txt',
    repoUrl: 'https://github.com/tuadmin/FrankJStein'
};

async function getFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const name = path.join(dir, file);
        if (fs.statSync(name).isDirectory()) {
            await getFiles(name, fileList);
        } else if (file.endsWith('.md')) {
            fileList.push(name);
        }
    }
    return fileList;
}

async function generate() {
    console.log('🚀 Generando documentación para IAs...');
    
    const docsFiles = await getFiles(CONFIG.docsDir);
    const skillsFiles = await getFiles(CONFIG.skillsDir);
    
    let fullContent = `# FrankJStein: Full AI Context\n\n> Este archivo contiene toda la documentación y reglas del framework para facilitar la asistencia por IA.\n\n`;
    let indexContent = `# FrankJStein AI Index\n\n> Mapa de ruta para Agentes de IA y LLMs.\n\n`;

    // --- SECTION: AI SKILLS (ENGLISH) ---
    fullContent += `\n# SECTION: AI SKILLS (ENGLISH)\n`;
    fullContent += `> Technical rules and architectural patterns for AI Agents.\n\n`;
    
    indexContent += `\n## 🤖 AI Skills (English)\n\n`;
    for (const file of skillsFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const title = content.match(/name: (.*)/)?.[1] || path.basename(file);
        const relativePath = file.replace(/\\/g, '/');

        indexContent += `- [${title}](/${relativePath})\n`;
        fullContent += `\n---\n# File: ${relativePath}\n\n${content}\n`;
    }

    // --- SECTION: DOCUMENTATION (SPANISH) ---
    fullContent += `\n# SECTION: DOCUMENTACIÓN (SPANISH)\n`;
    fullContent += `> Manuales de usuario y guías de arquitectura en español.\n\n`;

    indexContent += `\n## 📚 Documentación Core (Español)\n\n`;
    for (const file of docsFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        const title = content.match(/^# (.*)/)?.[1] || path.basename(file);
        const relativePath = file.replace(/\\/g, '/');
        
        indexContent += `- [${title}](/${relativePath})\n`;
        fullContent += `\n---\n# File: ${relativePath}\n\n${content}\n`;
    }

    // --- Add footer and meta to Index ---
    indexContent += `\n## ⚡ Full Context\n\n- [llms-full.txt](/${CONFIG.outputFull.replace('./', '')}): Todo el conocimiento en un solo archivo plano.\n`;

    // Guardar archivos
    fs.writeFileSync(CONFIG.outputFull, fullContent);
    fs.writeFileSync(CONFIG.outputIndex, indexContent);

    console.log(`✅ ¡Éxito!`);
    console.log(`- ${CONFIG.outputIndex} generado.`);
    console.log(`- ${CONFIG.outputFull} generado (${(fullContent.length / 1024).toFixed(2)} KB).`);
}

generate().catch(console.error);
