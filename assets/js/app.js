import { setupZone }     from './upload.js';
import { mergeCSVs }    from './merge.js';
import { compareCSVs }  from './compare.js';
import { downloadResult } from './download.js';
import { $ }            from './utils.js';

setupZone('zone1', 'input1', 1);
setupZone('zone2', 'input2', 2);

$('btnMerge').addEventListener('click',    mergeCSVs);
$('btnCompare').addEventListener('click',  compareCSVs);
$('btnDownload').addEventListener('click', downloadResult);
