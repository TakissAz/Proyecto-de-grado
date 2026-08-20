const fs = require('fs');
let c = fs.readFileSync('resources/js/Pages/Endocrinologo/Citas/Index.tsx', 'utf8');
c = c.replace(/\/endocrinologo\/citas/g, '/nutricionista/citas');
c = c.replace('prefijo="endocrinologo"', 'prefijo="nutricionista"');
fs.writeFileSync('resources/js/Pages/Nutricionista/Citas/Index.tsx', c);
console.log('ok');
