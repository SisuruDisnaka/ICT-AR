// Copies AR.js camera calibration + Hiro pattern + printable marker from node_modules into /public/data (works offline).
import fs from 'node:fs'
const base = 'node_modules/@ar-js-org/ar.js/data'
const files = [['data/camera_para.dat','camera_para.dat'],['data/patt.hiro','patt.hiro'],['images/hiro.png','hiro.png']]
fs.mkdirSync('public/data',{recursive:true})
for (const [src,dst] of files) { const p=`${base}/${src}`
  if (fs.existsSync(p)) fs.copyFileSync(p,`public/data/${dst}`); else console.warn('MISSING', p, '- copy it manually into public/data/') }
