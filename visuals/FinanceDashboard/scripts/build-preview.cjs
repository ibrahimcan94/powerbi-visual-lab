const path=require('node:path');
require('../../../scripts/preview.cjs')(path.resolve(__dirname,'..'),"Finance OS").catch(error=>{console.error(error);process.exitCode=1;});
