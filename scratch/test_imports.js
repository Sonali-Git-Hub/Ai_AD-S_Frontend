import axios from 'axios';

const devServerUrl = 'http://localhost:5173';
const mainFileUrl = `${devServerUrl}/@fs/H:/aisa_new_web/AISA_New/src/pages/AdminDashboard.jsx`;

async function testImports() {
    try {
        console.log(`Fetching main file: ${mainFileUrl}`);
        const response = await axios.get(mainFileUrl);
        const code = response.data;
        console.log('Main file fetched successfully.');

        // Find all import statements in the compiled code
        // e.g. import { ... } from "/src/..."; or import "/src/...";
        const importRegex = /import\s+[^'"]*\s+from\s+['"]([^'"]+)['"]/g;
        let match;
        const imports = [];
        while ((match = importRegex.exec(code)) !== null) {
            imports.push(match[1]);
        }

        const simpleImportRegex = /import\s+['"]([^'"]+)['"]/g;
        while ((match = simpleImportRegex.exec(code)) !== null) {
            imports.push(match[1]);
        }

        console.log(`Found ${imports.length} imports in the compiled file.`);
        
        // Remove duplicates
        const uniqueImports = [...new Set(imports)];
        console.log(`Unique imports to test: ${uniqueImports.length}`);

        for (const imp of uniqueImports) {
            // Only test relative/absolute paths served by Vite, not node_modules or vite internal
            if (imp.startsWith('/') && !imp.startsWith('/node_modules/') && !imp.startsWith('/@vite/')) {
                const url = `${devServerUrl}${imp}`;
                try {
                    const res = await axios.head(url);
                    console.log(`✅ SUCCESS [${res.status}]: ${imp}`);
                } catch (err) {
                    console.log(`❌ FAILED [${err.response ? err.response.status : 'NO_RESPONSE'}]: ${imp}`);
                    if (err.response && err.response.data) {
                        console.log(`   Error details:`, String(err.response.data).substring(0, 300));
                    }
                }
            } else {
                console.log(`   Skipped testing library/internal: ${imp}`);
            }
        }
    } catch (error) {
        console.error('Error during testing:', error.message);
    }
}

testImports();
