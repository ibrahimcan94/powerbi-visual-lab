const path=require('node:path');
require('../../../../scripts/preview.cjs')(path.resolve(__dirname,'..'),"Workforce OS").catch(error=>{console.error(error);process.exitCode=1;});
